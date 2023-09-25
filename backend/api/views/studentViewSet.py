from rest_framework import viewsets
from api.models import Student
from api.serializers import StudentSerializer
from django_filters import rest_framework as filters


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"