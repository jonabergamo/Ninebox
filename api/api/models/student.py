from django.db import models
from .user import User
from .class_model import Class


class Student(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="student_profile", primary_key=True
    )
    classes = models.ManyToManyField(Class, related_name="students")
    nine_boxes = models.ManyToManyField("NineBox", through="StudentNineBox")

    def __str__(self):
        return self.user.email
