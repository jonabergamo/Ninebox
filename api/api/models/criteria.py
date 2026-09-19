from django.db import models


class Criteria(models.Model):
    description = models.CharField(max_length=100)
    weight = models.IntegerField()
    

    def __str__(self):
        return self.description
