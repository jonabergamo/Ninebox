from rest_framework import serializers
from api.models import Class, Subject
from api.serializers.subjectSerializer import SubjectSerializer
from api.serializers.activitySerializer import ActivitySerializer
from api.serializers.nineBoxSerializer import NineBoxSerializer


class ClassSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)
    nineboxes = NineBoxSerializer(many=True, read_only=True)
    subjects = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = (
            "unique_id",
            "name",
            "students",
            "teachers",
            "activities",
            "nineboxes",
            "subjects",
        )
        read_only_fields = ("unique_id",)

    def get_subjects(self, obj):
        subjects = Subject.objects.filter(class_obj=obj)
        return SubjectSerializer(subjects, many=True).data
