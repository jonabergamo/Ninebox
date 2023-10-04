from django.db import models



class Subject(models.Model):
    name = models.CharField(max_length=100)
    class_obj = models.ForeignKey(
        'Class', related_name="subjects", on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name
