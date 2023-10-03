from rest_framework import serializers
from api.models import User, Student, Teacher


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "is_active",
            "is_student",
            "is_teacher",
            "password",
        )
        extra_kwargs = {
            "password": {"write_only": True},
        }
