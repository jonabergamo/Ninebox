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
from docx import Document
import os
from docx.shared import Inches, RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
import unicodedata

class JoinTurmaRequest(serializers.Serializer):
    unique_id = serializers.CharField()


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]
    
    
    def format_activity_name(activity_name):
        # Remove acentos
        nfkd_form = unicodedata.normalize('NFKD', activity_name)
        name_without_accents = u"".join([c for c in nfkd_form if not unicodedata.combining(c)])

        # Substitui espaços por underscores e converte para lowercase
        formatted_name = name_without_accents.replace(" ", "_").lower()

        return formatted_name


    def generate_word(self, activity):
        doc = Document()

        # Ajustando as margens do documento
        section = doc.sections[0]
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)

        # Adicionando uma tabela de 1x2
        table = doc.add_table(rows=1, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False  # Isso permite definir manualmente a largura da tabela

        # Centralizando verticalmente o conteúdo das células da tabela
        for row in table.rows:
            for cell in row.cells:
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        # Adicione suas imagens às células da tabela
        cell_1 = table.cell(0, 0)
        cell_2 = table.cell(0, 1)

        # Define a largura das células
        cell_width = Inches(2.5)
        cell_1.width = cell_width
        cell_2.width = cell_width

        # Adiciona espaço antes da próxima seção
        doc.add_paragraph()


        # Título
        doc.add_heading(activity.name, level=0)

        # Descrição da Atividade
        doc.add_paragraph(activity.description)

        # Detalhes da atividade
        doc.add_paragraph(f"Nível: {activity.level}")

        # Subjects
        doc.add_heading('Disciplinas:', level=1)
        for subject in activity.subjects.all():
            doc.add_paragraph(subject.name)

        # Nine boxes
        doc.add_heading('Nine Boxes:', level=1)
        for box in activity.nine_boxes.all():
            doc.add_paragraph(f"{box.description}")

        doc.add_heading('Critérios avaliativos:', level=1)
        for criterion in activity.criteria.all():
            p = doc.add_paragraph(
                f"{criterion.description} (Peso: {criterion.weight})"
            )
            p.style = 'ListNumber'  # Definindo o estilo para uma lista numerada


        file_path = "atividade2.docx"
        doc.save(file_path)
        
        return file_path

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
                "send_to_students": openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description="Indica se deve enviar o e-mail para os estudantes ou não"
                ),
                "send_to_teacher": openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description="Indica se deve enviar o e-mail para o professor que está criando a atividade ou não"
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
        user = self.request.user
        teacher = self.get_object()
        name = request.data.get("name", "")
        description = request.data.get("description", "")
        level = request.data.get("level", 0)
        subjects = request.data.get("subjects", [])
        nine_boxes = request.data.get("nine_boxes", [])
        criteria_data = request.data.get("criteria", [])
        class_id = request.data.get("class_id", "")
        student_ids = request.data.get("student_ids", [])
        send_to_students = request.data.get("send_to_students", False)
        send_to_teacher = request.data.get("send_to_teacher", False)

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
            name=name, description=description, level=level, class_obj=class_instance, created_by=user
        )
        new_activity.subjects.set(subjects_objects)
        new_activity.nine_boxes.set(nine_boxes_objects)
        new_activity.criteria.set(criteria_objects)
        new_activity.save()
        
        file_path = self.generate_word(new_activity)
        
        for student in valid_students:
            StudentActivity.objects.create(
                student=student, activity=new_activity, class_obj=class_instance
            )
        try:
            if send_to_students:
                # Coletando e-mails dos estudantes em uma lista.
                student_emails = [student.user.email for student in valid_students]

                # Configurar e enviar e-mail.
                mail = EmailMessage(
                    "Nova Atividade Criada",
                    "Uma nova atividade foi criada. Veja o anexo para mais detalhes.",
                    "from_email@example.com",
                    student_emails,  # Enviar para a lista de e-mails dos estudantes
                )

                with open(file_path, 'rb') as f:
                    mail.attach("activity.docx", f.read(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

                mail.send()

                # Após o envio do e-mail, considere remover o arquivo para economizar espaço no servidor.
                
                
            if send_to_teacher:
                teacher_email = request.user.email  # Assumindo que o usuário fazendo a requisição é o professor

                # Configurar e enviar e-mail.
                mail = EmailMessage(
                    "Nova Atividade Criada",
                    "Você criou uma nova atividade. Veja o anexo para mais detalhes.",
                    "from_email@example.com",
                    [teacher_email],  # Enviar para o e-mail do professor
                )
                
                with open(file_path, 'rb') as f:
                    mail.attach("activity.docx", f.read(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

                mail.send()
        except ConnectionAbortedError:
            return Response(
                {"error": "O envio de e-mail foi bloqueado, possivelmente pelo seu Wi-Fi. Verifique sua conexão ou tente novamente mais tarde."},
                status=status.HTTP_408_REQUEST_TIMEOUT,
    )
            
        os.remove(file_path)
        return Response(
            {"message": "Atividade criada com sucesso"}, status=status.HTTP_201_CREATED
        )