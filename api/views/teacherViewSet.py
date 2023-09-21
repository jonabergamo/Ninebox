from rest_framework import viewsets, status, serializers
from api.models import Teacher, Class, Criteria, Subject, NineBox, Activity
from drf_yasg.utils import swagger_auto_schema
from api.serializers import TeacherSerializer, ClassSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg import openapi
from django.utils.crypto import get_random_string
from django.core.exceptions import ObjectDoesNotExist


class JoinTurmaRequest(serializers.Serializer):
    unique_id = serializers.CharField()


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    @swagger_auto_schema(
        operation_description="Cria uma nova turma e associa o teacher a ela.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "name": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Nome da turma"
                ),
            },
            required=["name"],
        ),
    )
    @action(detail=True, methods=["POST"], url_path="create_class")
    def create_class(self, request, pk=None):
        teacher = self.get_object()

        name_class = request.data.get("name", "")
        if not name_class:
            return Response(
                {"error": "Nome da turma é necessário"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unique_id = get_random_string(length=6).upper()

        # Verifica se o ID único já existe e gera um novo, se necessário
        while True:
            try:
                existing_class = Class.objects.get(unique_id=unique_id)
                unique_id = get_random_string(length=6).upper()  # Gera um novo ID
            except ObjectDoesNotExist:
                break  # Sai do loop quando um ID único é encontrado

        class_instance = Class.objects.create(unique_id=unique_id, name=name_class)
        class_instance.teachers.add(teacher)
        class_instance.save()

        return Response(
            {"message": f"Turma {name_class} criada com o ID {unique_id}"},
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        operation_description="Associa um teacher a uma turma existente usando um ID único.",
        request_body=JoinTurmaRequest,
    )
    @action(detail=True, methods=["POST"], url_path="join_class")
    def join_class(self, request, pk=None):
        teacher = self.get_object()

        unique_id = request.data.get("unique_id", None)

        if not unique_id:
            return Response(
                {"error": "Unique ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            class_instance = Class.objects.get(unique_id=unique_id)
        except class_instance.DoesNotExist:
            return Response(
                {"error": "Turma não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )

        if teacher not in class_instance.teachers.all():
            class_instance.teachers.add(teacher)
            class_instance.save()

        return Response(
            {"message": "teacher adicionado à turma existente"},
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_description="Cria uma nova atividade e a associa a uma turma específica, também cria ou recupera os critérios associados.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=[
                "name",
                "level",
                "subjects",
                "nine_boxes",
                "criteria_descriptions",
                "class_id",
            ],
            properties={
                "name": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Nome da atividade"
                ),
                "level": openapi.Schema(
                    type=openapi.TYPE_INTEGER, description="Nível da atividade"
                ),
                "subjects": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_INTEGER),
                    description="Disciplinas associadas à atividade",
                ),
                "nine_boxes": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_INTEGER),
                    description="NineBoxes associadas à atividade",
                ),
                "criteria": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "description": openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description="Descrição do critério",
                            ),
                            "weight": openapi.Schema(
                                type=openapi.TYPE_INTEGER,
                                description="Peso do critério",
                            ),
                        },
                    ),
                    description="Critérios associados à atividade",
                ),
                "class_id": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="ID da turma à qual a atividade pertencerá",
                ),
            },
        ),
    )
    @action(detail=True, methods=["POST"], url_path="create_activity")
    def create_activity(self, request, pk=None):
        teacher = self.get_object()
        name = request.data.get("name", "")
        level = request.data.get("level", 0)
        subjects = request.data.get("subjects", [])
        nine_boxes = request.data.get("nine_boxes", [])
        criteria_data = request.data.get(
            "criteria", []
        )  # Agora é uma lista de dicionários
        class_id = request.data.get("class_id", "")

        if not all([name, level, subjects, nine_boxes, criteria_data, class_id]):
            return Response(
                {"error": "Todos os campos são necessários"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            class_instance = Class.objects.get(unique_id=class_id)
            if teacher not in class_instance.teachers.all():
                return Response(
                    {"error": "Teacher não está associado a esta turma"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        except ObjectDoesNotExist:
            return Response(
                {"error": "Turma não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )
        criteria_objects = [
            Criteria.objects.get_or_create(
                description=crit["description"], weight=crit["weight"]
            )[0]
            for crit in criteria_data
        ]
        subjects_objects = Subject.objects.filter(id__in=subjects)
        nine_boxes_objects = NineBox.objects.filter(id__in=nine_boxes)

        new_activity = Activity.objects.create(
            name=name, level=level, class_obj=class_instance
        )
        new_activity.subjects.set(subjects_objects)
        new_activity.nine_boxes.set(nine_boxes_objects)
        new_activity.criteria.set(criteria_objects)
        new_activity.save()

        return Response(
            {"message": "Atividade criada com sucesso"}, status=status.HTTP_201_CREATED
        )
