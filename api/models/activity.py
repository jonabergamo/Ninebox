from django.db import models
from .subject import Subject


class Activity(models.Model):
    name = models.CharField(max_length=100)
    level = models.IntegerField()
    subjects = models.ManyToManyField(Subject, related_name="activities")
    nine_boxes = models.ManyToManyField("NineBox")
    criteria = models.ManyToManyField("Criteria")
    class_obj = models.ForeignKey(
        "Class", related_name="activities", on_delete=models.CASCADE
    )
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)  # Campo de data de criação
    created_by = models.ForeignKey('User', related_name='teacher', on_delete=models.CASCADE)
    delivery_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
