from rest_framework import serializers
from api.models import User, Student, Teacher


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_aluno",
            "is_professor",
            "password",
        )
        extra_kwargs = {
            "password": {"write_only": True},
        }