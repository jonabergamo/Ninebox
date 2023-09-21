from rest_framework import viewsets
from api.models import Subject
from api.serializers import SubjectSerializer
from django_filters import rest_framework as filters


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
