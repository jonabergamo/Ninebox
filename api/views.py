from rest_framework import viewsets, status
from .models import (
    Professor,
    Turma,
    Aluno,
    Disciplina,
    Atividade,
    NineBox,
    AlunoNineBox,
    Criterio,
    Avaliacao,
    CustomUser,
)
from .serializers import (
    ProfessorSerializer,
    TurmaSerializer,
    AlunoSerializer,
    DisciplinaSerializer,
    AtividadeSerializer,
    NineBoxSerializer,
    AlunoNineBoxSerializer,
    CriterioSerializer,
    AvaliacaoSerializer,
    CustomUserSerializer,
)
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.response import Response
from django.utils.crypto import get_random_string
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import serializers


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer


def create(self, request):
    """
    Create a new user.

    Parameters:
        self (CustomUserViewSet): The instance of this class.
        request (HttpRequest): The HTTP request object containing user data.

    Returns:
        Response: A JSON response indicating success or failure.
    """

    # Initialize the serializer and populate it with data from the request
    serializer = CustomUserSerializer(data=request.data)

    # Check if the provided data is valid
    if serializer.is_valid():
        if (
            serializer.validated_data["is_aluno"] == True
            and serializer.validated_data["is_professor"] == True
        ):
            return Response(
                {
                    "detail": {
                        "error": "Um usuário não pode ser um professor e um aluno simultaneamente"
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the user
        user = CustomUser.objects.create_user(
            serializer.validated_data["username"],
            serializer.validated_data["email"],
            serializer.validated_data["password"],
            first_name=serializer.validated_data["first_name"],
            last_name=serializer.validated_data["last_name"],
        )
        user.is_aluno = serializer.validated_data["is_aluno"]
        user.is_professor = serializer.validated_data["is_professor"]  # fixed this line
        user.save()

        # Return a JSON response with the new user's data and a success status code
        return Response(
            {"id": user.id, "username": user.username, "email": user.email},
            status=status.HTTP_201_CREATED,
        )

    # If the data is not valid, return a 400 Bad Request status and the validation errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateTurmaRequest(serializers.Serializer):
    # qualquer campo que a requisição POST para criar uma turma deve conter
    some_field = serializers.CharField()


class JoinTurmaRequest(serializers.Serializer):
    unique_id = serializers.CharField()


class ProfessorViewSet(viewsets.ModelViewSet):
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer

    @swagger_auto_schema(
        operation_description="Cria uma nova turma e associa o professor a ela.",
        request_body=TurmaSerializer(
            partial=True
        ),  # 'partial=True' indica que nem todos os campos são necessários
    )
    @action(detail=True, methods=["POST"], url_path="create_turma")
    def create_turma(self, request, pk=None):
        professor = self.get_object()

        nome_turma = request.data.get("nome", "")
        if not nome_turma:
            return Response(
                {"error": "Nome da turma é necessário"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Gera um ID único de 6 dígitos para a nova turma
        unique_id = get_random_string(length=6).upper()
        turma = Turma.objects.create(unique_id=unique_id, nome=nome_turma)
        turma.professores.add(professor)
        turma.save()

        return Response(
            {"message": f"Turma {nome_turma} criada com o ID {unique_id}"},
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        operation_description="Associa um professor a uma turma existente usando um ID único.",
        request_body=JoinTurmaRequest,
        manual_parameters=[
            openapi.Parameter(
                name="unique_id",
                in_=openapi.IN_QUERY,
                description="ID único da turma para juntar-se",
                type=openapi.TYPE_STRING,
            ),
        ],
    )
    @action(detail=True, methods=["POST"], url_path="join_turma")
    def join_turma(self, request, pk=None):
        professor = self.get_object()

        unique_id = request.data.get("unique_id", None)

        if not unique_id:
            return Response(
                {"error": "Unique ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            turma = Turma.objects.get(unique_id=unique_id)
        except Turma.DoesNotExist:
            return Response(
                {"error": "Turma não encontrada"}, status=status.HTTP_404_NOT_FOUND
            )

        if professor not in turma.professores.all():
            turma.professores.add(professor)
            turma.save()

        return Response(
            {"message": "Professor adicionado à turma existente"},
            status=status.HTTP_200_OK,
        )


class AddAlunoBody(serializers.Serializer):
    aluno_email = serializers.EmailField()


class TurmaViewSet(viewsets.ModelViewSet):
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer

    @swagger_auto_schema(
        method="post",
        operation_description="Adiciona um aluno à turma usando seu e-mail.",
        request_body=AddAlunoBody,  # <--- Indicamos que o corpo da requisição deve ser conforme definido em AddAlunoBody
    )
    @action(detail=True, methods=["POST"], url_path="add_aluno")
    def add_aluno_to_turma(self, request, pk=None):
        turma = self.get_object()
        aluno_email = request.data.get("aluno_email", None)

        if not aluno_email:
            return Response(
                {"error": "O e-mail do aluno é necessário"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            aluno = Aluno.objects.get(user__email=aluno_email)
        except Aluno.DoesNotExist:
            return Response(
                {"error": "Aluno com este e-mail não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        turma.alunos.add(aluno)
        turma.save()

        return Response(
            {"status": f"Aluno com e-mail {aluno_email} foi adicionado à turma"},
            status=status.HTTP_200_OK,
        )


class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer


class DisciplinaViewSet(viewsets.ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer


class AtividadeViewSet(viewsets.ModelViewSet):
    queryset = Atividade.objects.all()
    serializer_class = AtividadeSerializer


class NineBoxViewSet(viewsets.ModelViewSet):
    queryset = NineBox.objects.all()
    serializer_class = NineBoxSerializer


class AlunoNineBoxViewSet(viewsets.ModelViewSet):
    queryset = AlunoNineBox.objects.all()
    serializer_class = AlunoNineBoxSerializer


class CriterioViewSet(viewsets.ModelViewSet):
    queryset = Criterio.objects.all()
    serializer_class = CriterioSerializer


class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer


@receiver(post_save, sender=Aluno)
def create_nine_boxes_for_aluno(sender, instance, created, **kwargs):
    if created:
        all_nine_boxes = NineBox.objects.all()
        for nine_box in all_nine_boxes:
            AlunoNineBox.objects.create(aluno=instance, nine_box=nine_box)


@receiver(post_save, sender=NineBox)
def create_nine_box_for_all_alunos(sender, instance, created, **kwargs):
    if created:
        all_alunos = Aluno.objects.all()
        for aluno in all_alunos:
            AlunoNineBox.objects.create(aluno=aluno, nine_box=instance)
