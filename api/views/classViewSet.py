from rest_framework import viewsets, serializers, status
from api.models import (
    Class,
    Student,
    Activity,
    StudentActivity,
    NineBox,
    StudentNineBox,
)
from api.serializers import ClassSerializer
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime


class AddStudentBody(serializers.Serializer):
    student_email = serializers.EmailField()


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    @swagger_auto_schema(
        method="post",
        operation_description="Adiciona um student à class usando seu e-mail.",
        request_body=AddStudentBody,  # <--- Indicamos que o corpo da requisição deve ser conforme definido em AddstudentBody
    )
    @action(detail=True, methods=["POST"], url_path="add_student")
    def add_student_to_class(self, request, pk=None):
        class_model = self.get_object()
        student_email = request.data.get("student_email", None)

        if not student_email:
            return Response(
                {"error": "O e-mail do student é necessário"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            student = Student.objects.get(user__email=student_email)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student com este e-mail não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Adicionando o aluno à classe
        class_model.students.add(student)

        # Adicionando atividades
        current_date = datetime.now()
        activities_of_class = Activity.objects.filter(
            class_obj=class_model,
        )
        for activity in activities_of_class:
            StudentActivity.objects.create(
                student=student, activity=activity, class_obj=class_model
            )

        # Adicionando NineBox, se necessário
        nine_boxes_of_class = NineBox.objects.filter(class_obj=class_model)
        for nine_box in nine_boxes_of_class:
            StudentNineBox.objects.create(student=student, nine_box=nine_box)

        class_model.save()

        return Response(
            {"status": f"Student com e-mail {student_email} foi adicionado à class"},
            status=status.HTTP_200_OK,
        )
