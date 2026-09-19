from django.db import models
from api.models import Class


class NineBox(models.Model):
    description = models.CharField(max_length=100)
    class_obj = models.ForeignKey(
        Class, related_name="nineboxes", on_delete=models.CASCADE
    )

    def __str__(self):
        return self.description
