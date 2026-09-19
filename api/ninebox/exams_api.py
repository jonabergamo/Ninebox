from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .api import UserSerializer, classes_of, teacher_owns
from .models import Attempt, Choice, Exam, Question
from .permissions import IsStudent, IsTeacher


def broadcast(exam_id: int, payload: dict):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(f"exam_{exam_id}", {"type": "exam.event", "payload": payload})


def exam_state(exam: Exam):
    return {
        "kind": "state",
        "status": exam.status,
        "opened_at": exam.opened_at.isoformat() if exam.opened_at else None,
        "ends_at": exam.ends_at.isoformat() if exam.ends_at else None,
        "server_now": timezone.now().isoformat(),
        "submitted": exam.attempts.filter(submitted_at__isnull=False).count(),
        "started": exam.attempts.count(),
    }


def settle(exam: Exam):
    """an open exam whose time ran out with nobody connected closes on the next touch"""
    if exam.status == Exam.Status.OPEN and exam.ends_at and timezone.now() >= exam.ends_at:
        services.close_exam(exam)
        broadcast(exam.id, exam_state(exam))
    return exam


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "text", "points", "order", "choices"]

    def validate_choices(self, choices):
        if len(choices) < 2:
            raise ValidationError("two choices at least")
        if sum(1 for c in choices if c.get("is_correct")) != 1:
            raise ValidationError("mark exactly one correct choice")
        return choices


class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    my_attempt = serializers.SerializerMethodField()
    question_count = serializers.IntegerField(source="questions.count", read_only=True)

    class Meta:
        model = Exam
        fields = [
            "id",
            "classroom",
            "title",
            "instructions",
            "duration_minutes",
            "level",
            "grids",
            "status",
            "opened_at",
            "ends_at",
            "created_at",
            "questions",
            "question_count",
            "my_attempt",
        ]
        read_only_fields = ["status", "opened_at", "ends_at", "created_at"]

    def get_my_attempt(self, exam):
        user = self.context["request"].user
        if user.is_teacher:
            return None
        a = exam.attempts.filter(student=user).first()
        return AttemptSerializer(a).data if a else None

    def to_representation(self, exam):
        data = super().to_representation(exam)
        user = self.context["request"].user
        # students only learn the right answers once the exam is closed
        if not user.is_teacher and exam.status != Exam.Status.CLOSED:
            for q in data["questions"]:
                for c in q["choices"]:
                    c.pop("is_correct", None)
        return data

    def validate(self, data):
        if "questions" in data and not data["questions"]:
            raise ValidationError({"questions": "add at least one question"})
        if "grids" in data and not data["grids"]:
            raise ValidationError({"grids": "pick at least one grid"})
        return data

    def _write_questions(self, exam, questions):
        exam.questions.all().delete()
        for i, q in enumerate(questions):
            choices = q.pop("choices")
            question = Question.objects.create(exam=exam, order=i, **{k: v for k, v in q.items() if k != "order"})
            Choice.objects.bulk_create([Choice(question=question, **c) for c in choices])

    def create(self, data):
        questions = data.pop("questions")
        grids = data.pop("grids")
        exam = Exam.objects.create(created_by=self.context["request"].user, **data)
        exam.grids.set(grids)
        self._write_questions(exam, questions)
        return exam

    def update(self, exam, data):
        if exam.status != Exam.Status.DRAFT:
            raise ValidationError("only a draft can be edited")
        questions = data.pop("questions", None)
        grids = data.pop("grids", None)
        for k, v in data.items():
            setattr(exam, k, v)
        exam.save()
        if grids is not None:
            exam.grids.set(grids)
        if questions is not None:
            self._write_questions(exam, questions)
        return exam


class AttemptSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)

    class Meta:
        model = Attempt
        fields = ["id", "student", "started_at", "submitted_at", "answers", "score"]


class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    filterset_fields = ["classroom", "status"]

    def get_queryset(self):
        return Exam.objects.filter(classroom__in=classes_of(self.request.user)).prefetch_related("questions__choices", "grids")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "open", "close", "results"):
            return [IsTeacher()]
        if self.action in ("answer", "submit", "start"):
            return [IsStudent()]
        return [IsAuthenticated()]

    def get_object(self):
        return settle(super().get_object())

    def perform_create(self, s):
        teacher_owns(self.request.user, s.validated_data["classroom"])
        s.save()

    def perform_update(self, s):
        teacher_owns(self.request.user, s.instance.classroom)
        s.save()

    def perform_destroy(self, exam):
        teacher_owns(self.request.user, exam.classroom)
        exam.delete()

    @action(detail=True, methods=["post"])
    def open(self, request, pk=None):
        exam = self.get_object()
        teacher_owns(request.user, exam.classroom)
        if exam.status != Exam.Status.DRAFT:
            raise ValidationError("already opened")
        if not exam.questions.exists():
            raise ValidationError("add questions first")
        services.open_exam(exam)
        broadcast(exam.id, exam_state(exam))
        return Response(self.get_serializer(exam).data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        exam = self.get_object()
        teacher_owns(request.user, exam.classroom)
        if exam.status != Exam.Status.OPEN:
            raise ValidationError("not open")
        services.close_exam(exam)
        broadcast(exam.id, exam_state(exam))
        return Response(self.get_serializer(exam).data)

    @action(detail=True, methods=["get"])
    def results(self, request, pk=None):
        exam = self.get_object()
        teacher_owns(request.user, exam.classroom)
        attempts = exam.attempts.select_related("student").order_by("student__name")
        return Response(AttemptSerializer(attempts, many=True).data)

    # a student's first look at an open exam starts their attempt and the teacher sees them arrive
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        exam = self.get_object()
        if exam.status != Exam.Status.OPEN:
            raise ValidationError("exam is not open")
        attempt, created = Attempt.objects.get_or_create(exam=exam, student=request.user)
        if created:
            broadcast(exam.id, {**exam_state(exam), "joined": request.user.name})
        return Response(AttemptSerializer(attempt).data)

    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        exam = self.get_object()
        attempt = self._live_attempt(exam, request.user)
        q = str(request.data.get("question"))
        c = request.data.get("choice")
        if not exam.questions.filter(id=q, choices__id=c).exists():
            raise ValidationError("that choice does not belong to that question")
        attempt.answers[q] = c
        attempt.save(update_fields=["answers"])
        return Response(AttemptSerializer(attempt).data)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        exam = self.get_object()
        attempt = self._live_attempt(exam, request.user)
        services.submit_attempt(attempt)
        broadcast(exam.id, {**exam_state(exam), "submitted_by": request.user.name})
        return Response(AttemptSerializer(attempt).data)

    def _live_attempt(self, exam, user):
        if exam.status != Exam.Status.OPEN:
            raise ValidationError("exam is not open")
        attempt = exam.attempts.filter(student=user).first()
        if not attempt:
            raise PermissionDenied("start the exam first")
        if attempt.submitted_at:
            raise ValidationError("already submitted")
        return attempt

    def retrieve(self, request, *args, **kwargs):
        exam = self.get_object()
        if request.user.is_teacher:
            teacher_owns(request.user, exam.classroom)
        return Response(self.get_serializer(exam).data, status=status.HTTP_200_OK)
