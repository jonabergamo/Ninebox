from rest_framework import viewsets
from api.models import Subject
from api.serializers import SubjectSerializer
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]
