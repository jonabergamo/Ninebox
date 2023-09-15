from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


class UserNineBoxModel(models.Model):
    user = models.ForeignKey("UserModel", on_delete=models.CASCADE)  # Lazy Reference
    ninebox = models.ForeignKey(
        "NineBoxModel", on_delete=models.CASCADE
    )  # Lazy Reference
    x_position = models.IntegerField()
    y_position = models.IntegerField()

    def save(self, *args, **kwargs):
        if self.user.role != "STUDENT":
            raise ValidationError("Apenas alunos podem ter NineBoxes associadas.")
        super(UserNineBoxModel, self).save(*args, **kwargs)


class NineBoxModel(models.Model):
    name = models.CharField(max_length=150)
    parent = models.ForeignKey(
        "self", blank=True, null=True, related_name="children", on_delete=models.CASCADE
    )
    x_axis = models.CharField(max_length=150)
    y_axis = models.CharField(max_length=150)
