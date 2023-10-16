from django.db import models


class Class(models.Model):
    name = models.CharField(max_length=100)
    unique_id = models.CharField(
        max_length=6, unique=True, primary_key=True
    )  # This is the unique 6-digit ID

    def __str__(self):
        return self.name
