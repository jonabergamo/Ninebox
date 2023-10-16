from django.db import models
from api.models import (
    Student,
    Activity,
    Class,
    Evaluation,
)  # Importa seus outros modelos aqui
from django.utils import timezone
import numpy as np

class StudentActivity(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="activities"
    )
    activity = models.ForeignKey(
        Activity, on_delete=models.CASCADE, related_name="activity_student_activities"
    )
    class_obj = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name="student_activity_class"
    )
    evaluations = models.ManyToManyField(
        "Evaluation", related_name="student_activity_evaluations"
    )
    post_date = models.DateTimeField(default=timezone.now)
    correction_date = models.DateField(null=True, blank=True)
    final_grade = models.FloatField(null=True, blank=True)
    activity_link = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student} - {self.activity} - {self.class_obj}"

    def convert_grade_to_number(self, grade):
        grade_to_number = {
            "E": 100,
            "G": 75,
            "A": 50,
            "P": 25,
        }
        return grade_to_number.get(grade, 0)

    def update_final_grade(self):
        evaluations = self.evaluations.all()
        total_weighted_grade = 0.0
        total_weight = 0

        if evaluations.count() == 0:
            self.final_grade = None
        else:
            for evaluation in evaluations:
                numerical_grade = self.convert_grade_to_number(evaluation.grade)
                weight = (
                    evaluation.criteria.weight
                )  # Assume que o campo 'weight' está no modelo Evaluation
                total_weighted_grade += numerical_grade * weight
                total_weight += weight

            self.final_grade = np.round((
                total_weighted_grade / total_weight if total_weight > 0 else None
            ), 2)

        self.save()
