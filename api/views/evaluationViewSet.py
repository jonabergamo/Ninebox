from rest_framework import viewsets
from api.models import Evaluation
from api.serializers import EvaluationSerializer
from django_filters import rest_framework as filters


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
