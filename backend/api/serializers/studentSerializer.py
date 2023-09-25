from rest_framework import serializers
from api.models import Student
from api.serializers import UserSerializer


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Student
        fields = "__all__"
