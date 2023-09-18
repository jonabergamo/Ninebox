from rest_framework import viewsets
from api.models import Evaluation
from api.serializers import ActivitySerializer


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = ActivitySerializer
