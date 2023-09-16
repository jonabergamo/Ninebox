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
    CustomUser,
)
from django.contrib.auth.hashers import make_password


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "is_aluno",
            "is_professor",
            "password",
        )
        extra_kwargs = {"password": {"write_only": True}}

    def save(self, **kwargs):
        instance = super().save(**kwargs)
        if instance.is_aluno:
            Aluno.objects.create(user=instance)
        elif instance.is_professor:
            Professor.objects.create(user=instance)
        return instance


class ProfessorSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Professor
        fields = "__all__"


class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = "__all__"


class AlunoSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

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
