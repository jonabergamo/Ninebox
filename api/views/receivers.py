from django.dispatch import receiver
from django.db.models.signals import post_save
from api.models import Student, NineBox, StudentNineBox


@receiver(post_save, sender=Student)
def create_nine_boxes_for_aluno(sender, instance, created, **kwargs):
    if created:
        all_nine_boxes = NineBox.objects.all()
        for nine_box in all_nine_boxes:
            StudentNineBox.objects.create(student=instance, nine_box=nine_box)


@receiver(post_save, sender=NineBox)
def create_nine_box_for_all_alunos(sender, instance, created, **kwargs):
    if created:
        all_students = Student.objects.all()
        for student in all_students:
            StudentNineBox.objects.create(student=student, nine_box=instance)