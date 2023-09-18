from rest_framework import serializers
from api.models import StudentNineBox


class StudentNineBoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentNineBox
        fields = "__all__"
