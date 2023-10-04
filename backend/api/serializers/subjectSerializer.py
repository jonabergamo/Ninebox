from rest_framework import serializers
from api.models import Subject, Activity, StudentActivity, Teacher
import api.serializers as apiSerializer
from django.db.models import Avg, StdDev
import numpy as np


class SubjectSerializer(serializers.ModelSerializer):
    average_activity_grade = serializers.SerializerMethodField()
    std_dev_activity_grade = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "class_obj",
            "average_activity_grade",
            "std_dev_activity_grade",
            "activities",
        ]
        read_only_fields = ["activities"]

    def get_average_activity_grade(self, obj):
        activities = Activity.objects.filter(subjects=obj)
        student_activities = StudentActivity.objects.filter(activity__in=activities)
        grades = [
            activity.final_grade
            for activity in student_activities
            if activity.final_grade is not None
        ]
        return np.round(np.mean(grades), 2) if grades else 0

    def get_std_dev_activity_grade(self, obj):
        activities = Activity.objects.filter(subjects=obj)
        student_activities = StudentActivity.objects.filter(activity__in=activities)
        grades = [
            activity.final_grade
            for activity in student_activities
            if activity.final_grade is not None
        ]
        return np.round(np.std(grades), 2) if grades else 0
