from rest_framework import viewsets
from api.serializers import CriteriaSerializer
from api.models import Criteria
from django_filters import rest_framework as filters


class CriteriaViewSet(viewsets.ModelViewSet):
    queryset = Criteria.objects.all()
    serializer_class = CriteriaSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
