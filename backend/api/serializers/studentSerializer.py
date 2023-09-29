from rest_framework import serializers
from api.models import Student
from api.serializers import ClassSerializer, UserSerializer


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    classes = ClassSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = "__all__"
