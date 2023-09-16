from rest_framework import viewsets
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
)
from django.db.models.signals import post_save
from django.dispatch import receiver


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
