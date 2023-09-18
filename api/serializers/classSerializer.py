from rest_framework import serializers
from api.models import Class
from api.serializers.studentSerializer import StudentSerializer
from api.serializers.teacherSerializer import TeacherSerializer
from api.serializers.activitySerializer import ActivitySerializer
from api.serializers.nineBoxSerializer import NineBoxSerializer


class ClassSerializer(serializers.ModelSerializer):
    students = StudentSerializer(many=True, read_only=True)
    teachers = TeacherSerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    nineboxes = NineBoxSerializer(many=True, read_only=True)

    class Meta:
        model = Class
        fields = (
            "unique_id",
            "name",
            "students",
            "teachers",
            "activities",
            "nineboxes",
        )
        read_only_fields = ("unique_id",)
