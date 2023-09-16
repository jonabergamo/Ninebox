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


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def create(self, request):
        """
        Create a new user.

        Parameters:
            self (AddUserView): The instance of this class.
            request (HttpRequest): The HTTP request object containing user data.

        Returns:
            Response: A JSON response indicating success or failure.
        """

        # Initialize the serializer and populate it with data from the request
        serializer = CustomUserSerializer(data=request.data)

        # Check if the provided data is valid
        if serializer.is_valid():
            if (
                serializer.data["is_aluno"] == True
                and serializer.data["is_professor"] == True
            ):
                return Response(
                    {
                        "detail": {
                            "error": "Um usuário não pode ser um professor e um aluno simultaneamente"
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = CustomUser.objects.create_user(
                serializer.validated_data["username"],
                serializer.validated_data["email"],
                serializer.validated_data["password"],
            )
            user.is_aluno = serializer.validated_data["is_aluno"]
            user.is_professor = serializer.validated_data["is_professor"]
            user.save()

            if user.is_aluno:
                Aluno.objects.create(user=user)
            elif user.is_professor:
                Professor.objects.create(user=user)

            # Return a JSON response with the new user's data and a success status code
            return Response(
                {"id": user.id, "username": user.username, "email": user.email},
                status=status.HTTP_201_CREATED,
            )

        # If the data is not valid, return a 400 Bad Request status and the validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfessorViewSet(viewsets.ModelViewSet):
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer


class TurmaViewSet(viewsets.ModelViewSet):
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer


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
