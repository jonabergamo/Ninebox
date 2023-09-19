from rest_framework import serializers
from api.models import Evaluation
from api.serializers import StudentSerializer, ActivitySerializer, CriteriaSerializer


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ["id", "student", "activity", "criteria", "grade"]
