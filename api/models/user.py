from django.contrib.auth.models import User
from django.db import models


class User(User):
    is_aluno = models.BooleanField(default=False)
    is_professor = models.BooleanField(default=False)
