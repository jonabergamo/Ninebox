from rest_framework import serializers
from api.models import StudentNineBox
from api.serializers.nineBoxSerializer import NineBoxSerializer


class StudentNineBoxSerializer(serializers.ModelSerializer):
    rank = serializers.SerializerMethodField()
    nine_box = NineBoxSerializer()

    class Meta:
        model = StudentNineBox
        fields = "__all__"

    def get_rank(self, obj):
        rank_map = {
            (1, 1): 1,
            (2, 1): 2,
            (3, 1): 3,
            (1, 2): 4,
            (2, 2): 5,
            (3, 2): 6,
            (1, 3): 7,
            (2, 3): 8,
            (3, 3): 9,
        }
        return rank_map.get((obj.x, obj.y), "Unknown")
