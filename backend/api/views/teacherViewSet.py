from rest_framework import viewsets, status, serializers
from api.models import (
    Teacher,
    Class,
    Criteria,
    Subject,
    NineBox,
    Activity,
    Student,
    StudentActivity,
)
from drf_yasg.utils import swagger_auto_schema
from api.serializers import TeacherSerializer, ClassSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg import openapi
from django.utils.crypto import get_random_string
from django.core.exceptions import ObjectDoesNotExist
from django_filters import rest_framework as filters
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from django.core.mail import EmailMessage
from io import BytesIO
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.colors import black


class JoinTurmaRequest(serializers.Serializer):
    unique_id = serializers.CharField()


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]

    def generate_pdf(self, activity):
        buffer = BytesIO()

        # Configurações iniciais
        width, height = landscape(letter)
        c = canvas.Canvas(buffer, pagesize=landscape(letter))

        # Título
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(width / 2, height - 50, activity.name)

        # Descrição da Atividade
        y_position = height - 100
        text = c.beginText(50, y_position)
        text.setFont("Helvetica", 14)
        text.textLines(activity.description)
        c.drawText(text)
        y_position -= 25 * len(
            activity.description.split("\n")
        )  # Atualizar a posição y

        # Detalhes da atividade
        c.setFont("Helvetica", 14)
        c.drawString(50, y_position, f"Nível: {activity.level}")
        y_position -= 30

        # Subjects
        y_position -= 10  # Espaço
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, "Disciplinas:")
        y_position -= 25
        for subject in activity.subjects.all():
            text = c.beginText(70, y_position)
            text.setFont("Helvetica", 14)
            text.textLines(subject.name)
            c.drawText(text)
            y_position -= 25 * len(subject.name.split("\n"))

        # Nine boxes
        y_position -= 10  # Espaço
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, "Nine Boxes:")
        y_position -= 25
        for box in activity.nine_boxes.all():
            text = c.beginText(70, y_position)
            text.setFont("Helvetica", 14)
            text.textLines(f"{box.description} (ID: {box.id})")
            c.drawText(text)
            y_position -= 25 * len(box.description.split("\n"))

        # Criterias
        y_position -= 10  # Espaço
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, "Critérios avaliativos:")
        y_position -= 25
        for criterion in activity.criteria.all():
            text = c.beginText(70, y_position)
            text.setFont("Helvetica", 14)
            text.textLines(
                f"{criterion.description} (ID: {criterion.id}, Peso: {criterion.weight})"
            )
            c.drawText(text)
            y_position -= 25 * len(criterion.description.split("\n"))

        # Salvando e retornando
        c.showPage()
        c.save()
        buffer.seek(0)
        return buffer.read()

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
        created_class = ClassSerializer(class_instance)

        return Response(
            {
                "message": f"Turma {name_class} criada com o ID {unique_id}",
                "object": created_class.data,
            },
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

    # def create_activity_for_all_students(self, sender, instance, created):
    #     if created:
    #         class_obj = instance.class_obj
    #         students_of_class = Student.objects.filter(classes=class_obj)
    #         for student in students_of_class:
    #             StudentActivity.objects.create(
    #                 student=student, activity=instance, class_obj=class_obj
    #             )

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
                "description": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Descrição da atividade"
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
                # "student_ids": openapi.Schema(
                #     type=openapi.TYPE_ARRAY,
                #     items=openapi.Schema(type=openapi.TYPE_INTEGER),
                #     description="IDs dos estudantes para os quais a atividade será criada",
                # ),
            },
        ),
    )
    @action(detail=True, methods=["POST"], url_path="create_activity")
    def create_activity(self, request, pk=None):
        teacher = self.get_object()
        name = request.data.get("name", "")
        description = request.data.get("description", "")
        level = request.data.get("level", 0)
        subjects = request.data.get("subjects", [])
        nine_boxes = request.data.get("nine_boxes", [])
        criteria_data = request.data.get("criteria", [])
        class_id = request.data.get("class_id", "")
        student_ids = request.data.get("student_ids", [])

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

        # Validação dos IDs dos Estudantes
        if student_ids:
            valid_students = Student.objects.filter(
                user__in=student_ids
            )  # Mudei 'id' para 'user'
            if len(valid_students) != len(student_ids):
                return Response(
                    {"error": "Um ou mais IDs de estudantes fornecidos são inválidos"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            valid_students = Student.objects.filter(classes=class_instance)

        criteria_objects = [
            Criteria.objects.get_or_create(
                description=crit["description"], weight=crit["weight"]
            )[0]
            for crit in criteria_data
        ]

        subjects_objects = Subject.objects.filter(id__in=subjects)
        nine_boxes_objects = NineBox.objects.filter(id__in=nine_boxes)

        new_activity = Activity.objects.create(
            name=name, description=description, level=level, class_obj=class_instance
        )
        new_activity.subjects.set(subjects_objects)
        new_activity.nine_boxes.set(nine_boxes_objects)
        new_activity.criteria.set(criteria_objects)
        new_activity.save()

        for student in valid_students:
            StudentActivity.objects.create(
                student=student, activity=new_activity, class_obj=class_instance
            )

        # Geração do PDF após a criação das instâncias de StudentActivity.
        pdf_file = self.generate_pdf(new_activity)

        for student_activity in valid_students:
            # Obter o e-mail do estudante.
            student_email = student_activity.user.email

            # Configurar e enviar e-mail.
            mail = EmailMessage(
                "Nova Atividade Criada",
                "Uma nova atividade foi criada. Veja o anexo para mais detalhes.",
                "from_email@example.com",
                [student_email],  # Enviar para o e-mail do estudante
            )
            mail.attach("activity.pdf", pdf_file, "application/pdf")
            mail.send()

        return Response(
            {"message": "Atividade criada com sucesso"}, status=status.HTTP_201_CREATED
        )
