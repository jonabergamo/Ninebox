from django.db import models
from .student import Student
from .activity import Activity
from .criteria import Criteria


class Evaluation(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    criteria = models.ForeignKey(Criteria, on_delete=models.CASCADE)
    GRADE_CHOICES = [("E", "Excellent"), ("G", "Good"), ("A", "Average"), ("P", "Poor")]
    grade = models.CharField(choices=GRADE_CHOICES, max_length=1)

    def __str__(self):
        return f"{self.student} - {self.activity} - {self.criteria}"
