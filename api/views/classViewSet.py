from rest_framework import viewsets, serializers, status
from api.models import (
    Class,
    Student,
    Activity,
    StudentActivity,
    NineBox,
    StudentNineBox,
    User,
    Teacher,
)
from api.serializers import ClassSerializer
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, StdDev
import numpy as np
from drf_yasg import openapi
from django.core.exceptions import ObjectDoesNotExist


class AddStudentBody(serializers.Serializer):
    user_email = serializers.EmailField(default="string@gmail.com")


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        method="post",
        operation_description="Adiciona um student à class usando seu e-mail.",
        request_body=AddStudentBody,  # <--- Indicamos que o corpo da requisição deve ser conforme definido em AddstudentBody
    )
    @action(detail=True, methods=["POST"], url_path="add_user")
    def add_user_to_class(self, request, pk=None):
        class_model = self.get_object()
        user_email = request.data.get("user_email", None)

        if not user_email:
            return Response(
                {"error": "O e-mail do usuário é necessário"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response(
                {"error": f"Usuário com o e-mail {user_email} não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_student:
            student, created = Student.objects.get_or_create(user=user)
            class_model.students.add(student)


            # Adicionar todas as NineBox da classe ao estudante
            nine_boxes = NineBox.objects.filter(class_obj=class_model)
            for nine_box in nine_boxes:
                StudentNineBox.objects.get_or_create(
                    student=student,
                    nine_box=nine_box,
                    level=0,
                    x=2,
                    y=1,
                    last_rank_fail_count=0,
                )

        elif user.is_teacher:
            teacher, created = Teacher.objects.get_or_create(user=user)
            class_model.teachers.add(teacher)

        else:
            return Response(
                {"error": "Tipo de usuário não identificado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        class_model.save()
        class_serializer = ClassSerializer(class_model)

        return Response(
            {
                "status": f"Usuário com e-mail {user_email} foi adicionado à classe",
                "object": class_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["GET"], url_path="get_student_nineboxes")
    def get_student_nineboxes(self, request, pk=None):
        class_model = self.get_object()

        # Obtém todos os alunos relacionados a essa classe através do campo 'classes' na model Student.
        students = Student.objects.filter(classes__unique_id=class_model.unique_id)

        # Prepara para armazenar as StudentNineBox de todos os alunos.
        all_student_nineboxes = []

        for student in students:
            # Para cada aluno, encontra todas as suas StudentNineBox.
            student_nineboxes = StudentNineBox.objects.filter(student=student)

            for snb in student_nineboxes:
                all_student_nineboxes.append(
                    {
                        "student_email": student.user.email,
                        "nine_box": snb.nine_box.id,
                        "level": snb.level,
                        "x": snb.x,
                        "y": snb.y,
                        "last_rank_fail_count": snb.last_rank_fail_count,
                    }
                )

        return Response(
            {
                "status": "Sucesso",
                "student_nineboxes": all_student_nineboxes,
            },
            status=status.HTTP_200_OK,
        )

    def calculate_stats(self, values, avg, std_dev):
        if not values:  # Se a lista estiver vazia
            return {
                "avg": 0,
                "median": 0,
                "std_dev": 0,
                "percentiles": {
                    "0": 0,
                    "25": 0,
                    "50": 0,
                    "75": 0,
                    "100": 0,
                },
            }

        return {
            "avg": avg,
            "median": np.median(values),
            "std_dev": std_dev,
            "percentiles": {
                "0": np.percentile(values, 0),  # Valor mínimo
                "25": np.percentile(values, 25),
                "50": np.percentile(values, 50),
                "75": np.percentile(values, 75),
                "100": np.percentile(values, 100),  # Valor máximo
            },
        }

    @swagger_auto_schema(
        operation_description="Obtém informações agregadas de nineboxes.",
        manual_parameters=[
            openapi.Parameter(
                "ninebox",
                openapi.IN_QUERY,
                description="Nome opcional da ninebox para filtrar os resultados.",
                type=openapi.TYPE_STRING,
            ),
        ],
        responses={200: "Sucesso"},
    )
    @action(detail=True, methods=["GET"], url_path="get_aggregate_nineboxes")
    def get_aggregate_nineboxes(self, request, pk=None):
        class_model = self.get_object()

        ninebox_filter = request.query_params.get(
            "ninebox", None
        )  # Pega o parâmetro opcional

        students = Student.objects.filter(classes__unique_id=class_model.unique_id)
        student_nineboxes = StudentNineBox.objects.filter(student__in=students)

        if ninebox_filter:
            student_nineboxes = student_nineboxes.filter(
                nine_box=ninebox_filter
            )  # Filtra se o parâmetro foi fornecido
        # Calculando médias e desvios padrão.
        aggregate_data = student_nineboxes.aggregate(
            avg_level=Avg("level"),
            std_level=StdDev("level"),
            avg_x=Avg("x"),
            std_x=StdDev("x"),
            avg_y=Avg("y"),
            std_y=StdDev("y"),
        )

        # Buscando os valores para calcular mediana e percentis.
        levels = list(student_nineboxes.values_list("level", flat=True))
        xs = list(student_nineboxes.values_list("x", flat=True))
        ys = list(student_nineboxes.values_list("y", flat=True))

        # Monta a resposta.
        response_data = {
            "status": "Sucesso",
            "aggregate_nineboxes": {
                "level": self.calculate_stats(
                    levels, aggregate_data["avg_level"], aggregate_data["std_level"]
                ),
                "x": self.calculate_stats(
                    xs, aggregate_data["avg_x"], aggregate_data["std_x"]
                ),
                "y": self.calculate_stats(
                    ys, aggregate_data["avg_y"], aggregate_data["std_y"]
                ),
            },
        }

        return Response(response_data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Remove um usuário de uma classe específica.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["user_email"],
            properties={
                "user_email": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="E-mail do usuário a ser removido.",
                ),
            },
        ),
        responses={
            200: "Usuário removido com sucesso",
            400: "Requisição inválida",
            404: "Usuário ou classe não encontrados",
        },
    )
    @action(detail=True, methods=["POST"], url_path="remove_user")
    def remove_user_from_class(self, request, pk=None):
        class_model = self.get_object()
        user_email = request.data.get("user_email", None)

        if not user_email:
            return Response(
                {"error": "O e-mail do usuário é necessário"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response(
                {"error": f"Usuário com o e-mail {user_email} não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_student:
            try:
                student = Student.objects.get(user=user)
                class_model.students.remove(student)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Estudante não está na classe"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        elif user.is_teacher:
            try:
                teacher = Teacher.objects.get(user=user)
                class_model.teachers.remove(teacher)
            except ObjectDoesNotExist:
                return Response(
                    {"error": "Professor não está na classe"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        else:
            return Response(
                {"error": "Tipo de usuário não identificado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        class_model.save()
        return Response(
            {"status": f"Usuário com e-mail {user_email} foi removido da classe"},
            status=status.HTTP_200_OK,
        )
