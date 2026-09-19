from rest_framework import serializers
from api.models import Evaluation
from api.serializers import StudentSerializer, ActivitySerializer, CriteriaSerializer


class EvaluationSerializer(serializers.ModelSerializer):
    activity_name = serializers.CharField(source="activity.name")
    criteria_description = serializers.CharField(source="criteria.description")

    class Meta:
        model = Evaluation
        fields = [
            "student",
            "activity",
            "activity_name",
            "criteria_description",
            "criteria",
            "grade",
            "feedback"
        ]
