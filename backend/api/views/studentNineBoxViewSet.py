from rest_framework import viewsets
from api.models import StudentNineBox
from api.serializers import StudentNineBoxSerializer
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated


class StudentNineBoxViewSet(viewsets.ModelViewSet):
    queryset = StudentNineBox.objects.all()
    serializer_class = StudentNineBoxSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]
