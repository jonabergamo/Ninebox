from rest_framework import serializers
from api.models import Teacher
from api.serializers import UserSerializer


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Teacher
        fields = "__all__"
