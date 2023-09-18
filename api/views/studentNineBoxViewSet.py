from rest_framework import viewsets
from api.models import StudentNineBox
from api.serializers import StudentNineBoxSerializer


class StudentNineBoxViewSet(viewsets.ModelViewSet):
    queryset = StudentNineBox.objects.all()
    serializer_class = StudentNineBoxSerializer
