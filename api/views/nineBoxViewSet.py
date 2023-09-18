from rest_framework import viewsets
from api.models import NineBox
from api.serializers import NineBoxSerializer


class NineBoxViewSet(viewsets.ModelViewSet):
    queryset = NineBox.objects.all()
    serializer_class = NineBoxSerializer
