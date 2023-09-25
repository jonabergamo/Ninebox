from rest_framework import serializers
from api.models import NineBox


class NineBoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = NineBox
        fields = "__all__"
