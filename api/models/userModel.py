from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class UserModel(User):
    is_teacher = models.BooleanField(default=False)
