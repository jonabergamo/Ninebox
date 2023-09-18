from django.db import models
from .student import Student
from .nineBox import NineBox


class StudentNineBox(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    nine_box = models.ForeignKey(NineBox, on_delete=models.CASCADE)
    level = models.IntegerField(default=0)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)

    def __str__(self):
        return str(self.student)
