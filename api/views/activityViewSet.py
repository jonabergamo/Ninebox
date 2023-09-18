from rest_framework import viewsets
from api.serializers import ActivitySerializer
from api.models import Activity


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
