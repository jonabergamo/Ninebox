from django.db import models


class NineBox(models.Model):
    name = models.CharField(max_length=150)
    parent = models.ForeignKey(
        "self", blank=True, null=True, related_name="children", on_delete=models.CASCADE
    )
    x_axis = models.CharField(max_length=150)
    y_axis = models.CharField(max_length=150)


class PersonalNineBox(models.Model):
    ninebox = models.ForeignKey(
        NineBox, related_name="personal-ninebox", on_delete=models.CASCADE
    )
    x_pos = models.IntegerField()
    y_pos = models.IntegerField()
