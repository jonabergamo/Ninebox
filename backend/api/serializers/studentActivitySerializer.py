from rest_framework import serializers
from api.models import StudentActivity
from api.serializers import (
    EvaluationSerializer,
    StudentSerializer,
    ActivitySerializer,
    ClassSerializer,
)


class StudentActivitySerializer(serializers.ModelSerializer):
    evaluations = EvaluationSerializer(many=True, read_only=True)
    activity = ActivitySerializer()

    class Meta:
        model = StudentActivity
        fields = [
            "id",
            "student",
            "activity",
            "class_obj",
            "post_date",
            "correction_date",
            "final_grade",
            "evaluations",
            "activity_link"
        ]
        extra_kwargs = {'activity_link': {'required': False}}

    # def to_representation(self, instance):
    #     representation = super().to_representation(instance)
    #     representation["student"] = StudentSerializer(instance.student).data
    #     representation["activity"] = ActivitySerializer(instance.activity).data
    #     representation["class_obj"] = ClassSerializer(instance.class_obj).data
    #     return representation
