from rest_framework import serializers
from api.models import Activity
from api.serializers.subjectSerializer import SubjectSerializer
from api.serializers.nineBoxSerializer import NineBoxSerializer
from api.serializers.criteriaSerializer import CriteriaSerializer


class ActivitySerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True)
    nine_boxes = NineBoxSerializer(many=True)
    criteria = CriteriaSerializer(many=True)


    class Meta:
        model = Activity
        fields = "__all__"
