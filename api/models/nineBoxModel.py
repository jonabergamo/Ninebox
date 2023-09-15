from django.db import models
from api.models import UserModel


class NineBoxModel(models.Model):
    name = models.CharField(max_length=150)
    parent = models.ForeignKey(
        "self", blank=True, null=True, related_name="children", on_delete=models.CASCADE
    )
    x_axis = models.CharField(max_length=150)
    y_axis = models.CharField(max_length=150)


class PersonalNineBoxModel(models.Model):
    ninebox = models.ForeignKey(
        NineBoxModel, related_name="personal_ninebox", on_delete=models.CASCADE
    )
    user = models.ForeignKey(UserModel, related_name="user", on_delete=models.CASCADE)
    x_pos = models.IntegerField()
    y_pos = models.IntegerField()
