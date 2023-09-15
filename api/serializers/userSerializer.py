from rest_framework import serializers
from api.models import UserModel


class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[("STUDENT", "Student"), ("TEACHER", "Teacher")], read_only=True
    )

    class Meta:
        model = UserModel
        fields = ("id", "username", "email", "password", "role")
        extra_kwargs = {"password": {"write_only": True}}

    def to_representation(self, instance):
        representation = super(UserSerializer, self).to_representation(instance)
        representation["role"] = instance.role  # Adiciona 'role' ao output
        return representation

    def create(self, validated_data):
        # Aqui, você pode definir "role" como "STUDENT" porque este serializer é apenas para estudantes
        validated_data["role"] = "STUDENT"
        return super(UserSerializer, self).create(validated_data)


class ValidateUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
