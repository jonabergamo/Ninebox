from rest_framework import serializers
from api.models import User, Student, Teacher, StudentActivity


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

class StudentActivityWithStudentSerializer(serializers.ModelSerializer):
    student = UserSerializer(source='student.user')  # Aqui é onde a mágica acontece. Estamos pegando o user através do student.

    class Meta:
        model = StudentActivity
        fields = ('id', 'activity', 'class_obj', 'evaluations', 'post_date', 'correction_date', 'final_grade', 'student')