from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .nineBoxModel import NineBoxModel, UserNineBoxModel


# UserModel.py
class UserModel(User):
    ROLE_CHOICES = [
        ("STUDENT", "Student"),
        ("TEACHER", "Teacher"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    nine_boxes = models.ManyToManyField(
        NineBoxModel, related_name="users", through=UserNineBoxModel, blank=True
    )
