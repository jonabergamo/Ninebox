from rest_framework import serializers
from api.models import Evaluation
from api.serializers import StudentSerializer, ActivitySerializer, CriteriaSerializer


class EvaluationSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    activity = ActivitySerializer()
    criteria = CriteriaSerializer()

    class Meta:
        model = Evaluation
        fields = "__all__"
