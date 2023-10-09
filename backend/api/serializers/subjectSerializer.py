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


class StudentSubjectDetailSerializer(serializers.ModelSerializer):
    total_activities = serializers.SerializerMethodField()
    total_delivered_activities = serializers.SerializerMethodField()
    average_grade = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ["name", "total_activities", "total_delivered_activities", "average_grade"]

    def get_total_activities(self, obj):
        return Activity.objects.filter(subjects=obj).count()

    def get_total_delivered_activities(self, obj):
        student_id = self.context.get('student_id')
        return StudentActivity.objects.filter(activity__subjects=obj, student__id=student_id, activity_link__isnull=False).count()

    def get_average_grade(self, obj):
        student_id = self.context.get('student_id')
        student_activities = StudentActivity.objects.filter(activity__in=obj.activities.all(), student_id=student_id)
        grades = [activity.final_grade for activity in student_activities if activity.final_grade is not None]
        return np.round(np.mean(grades), 2) if grades else 0