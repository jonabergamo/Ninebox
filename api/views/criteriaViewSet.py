from rest_framework import viewsets
from api.serializers import CriteriaSerializer
from api.models import Criteria


class CriteriaViewSet(viewsets.ModelViewSet):
    queryset = Criteria.objects.all()
    serializer_class = CriteriaSerializer
