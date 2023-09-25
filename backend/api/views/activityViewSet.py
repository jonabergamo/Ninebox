from rest_framework import viewsets
from api.serializers import ActivitySerializer
from api.models import Activity
from django_filters import rest_framework as filters


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
