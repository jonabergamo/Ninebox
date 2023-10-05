from rest_framework import viewsets
from api.serializers import ActivitySerializer
from api.models import Activity
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter



class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    filter_backends = (filters.DjangoFilterBackend, OrderingFilter)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]

    ordering_fields = ['id', 'name', 'level']  # Adicione outros campos conforme necessário
    ordering = ['id']  # Opcional: ordena por 'id' por padrão