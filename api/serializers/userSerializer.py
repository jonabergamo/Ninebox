from rest_framework import serializers
from api.models import UserModel


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("id", "username", "email", "password")
        extra_kwargs = {"password": {"write_only": True}}


class ValidateUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
