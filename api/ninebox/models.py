import secrets

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

# no 0, o, 1, i or l so a code read out loud can't be mistyped
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def new_code():
    return "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("email required")
        user = self.model(email=self.normalize_email(email), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("role", User.Role.TEACHER)
        user = self.create_user(email, password, **extra)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        TEACHER = "teacher"
        STUDENT = "student"

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    def __str__(self):
        return self.email


class Class(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=6, unique=True, default=new_code)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="classes_taught")
    students = models.ManyToManyField(User, through="Enrollment", related_name="classes_joined")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "classes"

    def __str__(self):
        return self.name


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE, db_column="class_id")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "classroom")


class Subject(models.Model):
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="subjects", db_column="class_id")
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# a grid is one 9 box board a class keeps, e.g. "Maths" or "Teamwork". students have a placement per grid
class Grid(models.Model):
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="grids", db_column="class_id")
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Activity(models.Model):
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="activities", db_column="class_id")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    level = models.PositiveSmallIntegerField(default=0)
    due_at = models.DateTimeField(null=True, blank=True)
    subjects = models.ManyToManyField(Subject, blank=True, related_name="activities")
    grids = models.ManyToManyField(Grid, related_name="activities")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Criterion(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name="criteria")
    description = models.CharField(max_length=140)
    weight = models.PositiveSmallIntegerField(default=1)


class Submission(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submissions")
    link = models.URLField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    final_grade = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("activity", "student")


class Mark(models.Model):
    class Grade(models.TextChoices):
        EXCELLENT = "E"
        GOOD = "G"
        AVERAGE = "A"
        POOR = "P"

    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name="marks")
    criterion = models.ForeignKey(Criterion, on_delete=models.CASCADE)
    grade = models.CharField(max_length=1, choices=Grade.choices)
    feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ("submission", "criterion")


class Placement(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="placements")
    grid = models.ForeignKey(Grid, on_delete=models.CASCADE, related_name="placements")
    level = models.PositiveSmallIntegerField(default=0)
    x = models.PositiveSmallIntegerField(default=2)  # performance, 1..3
    y = models.PositiveSmallIntegerField(default=1)  # potential, 1..3
    fail_streak = models.PositiveSmallIntegerField(default=0)

    class Meta:
        unique_together = ("student", "grid")


class PlacementHistory(models.Model):
    placement = models.ForeignKey(Placement, on_delete=models.CASCADE, related_name="history")
    submission = models.ForeignKey(Submission, null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    attempt = models.ForeignKey("Attempt", null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    label = models.CharField(max_length=140, blank=True)
    level = models.PositiveSmallIntegerField()
    x = models.PositiveSmallIntegerField()
    y = models.PositiveSmallIntegerField()
    grade = models.FloatField()
    at = models.DateTimeField()

    class Meta:
        ordering = ["at"]


# a timed multiple choice test. the server owns the clock, students only render it
class Exam(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft"
        OPEN = "open"
        CLOSED = "closed"

    classroom = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="exams", db_column="class_id")
    title = models.CharField(max_length=140)
    instructions = models.TextField(blank=True)
    duration_minutes = models.PositiveSmallIntegerField(default=30)
    level = models.PositiveSmallIntegerField(default=0)
    grids = models.ManyToManyField(Grid, related_name="exams")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    opened_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Question(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    points = models.PositiveSmallIntegerField(default=1)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=300)
    is_correct = models.BooleanField(default=False)


class Attempt(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="attempts")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attempts")
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    answers = models.JSONField(default=dict)  # {question_id: choice_id}
    score = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("exam", "student")
