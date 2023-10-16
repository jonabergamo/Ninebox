from django.dispatch import receiver
from django.db.models.signals import post_save, m2m_changed
from api.models import (
    Student,
    NineBox,
    StudentNineBox,
    Activity,
    StudentActivity,
    Class,
    Evaluation,
    Activity,
)
from django.core.mail import EmailMessage
from django.core.exceptions import ObjectDoesNotExist
from io import BytesIO
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors


@receiver(post_save, sender=NineBox)
def create_nine_box_for_all_students(sender, instance, created, **kwargs):
    if created:
        class_obj = instance.class_obj
        students_of_class = Student.objects.filter(classes=class_obj)
        for student in students_of_class:
            StudentNineBox.objects.create(student=student, nine_box=instance)


# @receiver(post_save, sender=Activity)
# def create_activity_for_all_students(sender, instance, created, **kwargs):
#     if created and not hasattr(instance, "skip_signal"):
#         class_obj = instance.class_obj
#         students_of_class = Student.objects.filter(classes=class_obj)
#         for student in students_of_class:
#             StudentActivity.objects.create(
#                 student=student, activity=instance, class_obj=class_obj
#             )
