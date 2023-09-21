from rest_framework import viewsets
from api.models import StudentNineBox
from api.serializers import StudentNineBoxSerializer
from django_filters import rest_framework as filters


class StudentNineBoxViewSet(viewsets.ModelViewSet):
    queryset = StudentNineBox.objects.all()
    serializer_class = StudentNineBoxSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
