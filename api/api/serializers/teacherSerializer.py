from rest_framework import serializers
from api.models import Teacher
from api.serializers import UserSerializer, ClassSerializer


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    classes = ClassSerializer(many=True, read_only=True)

    class Meta:
        model = Teacher
        fields = "__all__"
