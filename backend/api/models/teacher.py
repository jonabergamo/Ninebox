from django.db import models
from .user import User


class Teacher(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="teacher_profile", primary_key=True
    )
    # Other relevant fields
    classes = models.ManyToManyField("Class", related_name="teachers")
    subjects = models.ManyToManyField("Subject", related_name="subjects")
