from rest_framework import serializers
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


class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professor
        fields = "__all__"


class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = "__all__"


class AlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aluno
        fields = "__all__"


class DisciplinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disciplina
        fields = "__all__"


class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        fields = "__all__"


class NineBoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = NineBox
        fields = "__all__"


class AlunoNineBoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlunoNineBox
        fields = "__all__"


class CriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criterio
        fields = "__all__"


class AvaliacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avaliacao
        fields = "__all__"
