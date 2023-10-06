from rest_framework import serializers
from api.models import Activity
from api.serializers.subjectSerializer import SubjectSerializer
from api.serializers.nineBoxSerializer import NineBoxSerializer
from api.serializers.criteriaSerializer import CriteriaSerializer
from django.db.models import Avg, StdDev, F
import numpy as np


class ActivitySerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True)
    nine_boxes = NineBoxSerializer(many=True)
    criteria = CriteriaSerializer(many=True)
    average_grade = serializers.SerializerMethodField()
    median_grade = serializers.SerializerMethodField()
    percentile_25 = serializers.SerializerMethodField()
    percentile_75 = serializers.SerializerMethodField()
    std_dev_grade = serializers.SerializerMethodField()
    total_students_with_activity = serializers.SerializerMethodField()
    total_corrected_activities = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = "__all__"  # Atualize essa lista para incluir os novos campos

    def get_average_grade(self, obj):
        grades = [sa.final_grade for sa in obj.activity_student_activities.all() if sa.final_grade is not None]
        return np.round(np.mean(grades), 2) if grades else None

    def get_median_grade(self, obj):
        grades = [sa.final_grade for sa in obj.activity_student_activities.all() if sa.final_grade is not None]
        return np.round(np.median(grades), 2) if grades else None

    def get_percentile_25(self, obj):
        grades = [sa.final_grade for sa in obj.activity_student_activities.all() if sa.final_grade is not None]
        return np.round(np.percentile(grades, 25),2) if grades else None

    def get_percentile_75(self, obj):
        grades = [sa.final_grade for sa in obj.activity_student_activities.all() if sa.final_grade is not None]
        return np.round(np.percentile(grades, 75),2) if grades else None

    def get_std_dev_grade(self, obj):
        grades = [sa.final_grade for sa in obj.activity_student_activities.all() if sa.final_grade is not None]
        return np.round(np.std(grades),2) if grades else None

    def get_total_students_with_activity(self, obj):
        return obj.activity_student_activities.count()

    def get_total_corrected_activities(self, obj):
        return obj.activity_student_activities.filter(final_grade__isnull=False).count()