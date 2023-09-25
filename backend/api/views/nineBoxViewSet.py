from rest_framework import viewsets
from api.models import NineBox
from api.serializers import NineBoxSerializer
from django_filters import rest_framework as filters


class NineBoxViewSet(viewsets.ModelViewSet):
    queryset = NineBox.objects.all()
    serializer_class = NineBoxSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
