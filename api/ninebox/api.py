from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from . import services
from .models import (
    Activity,
    Class,
    Criterion,
    Grid,
    Mark,
    Placement,
    PlacementHistory,
    Subject,
    Submission,
    User,
)
from .permissions import IsStudent, IsTeacher

# ---- serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["name", "email", "password", "role"]

    def create(self, data):
        return User.objects.create_user(**data)


class ClassSerializer(serializers.ModelSerializer):
    students_count = serializers.IntegerField(source="students.count", read_only=True)
    teacher_name = serializers.CharField(source="teacher.name", read_only=True)

    class Meta:
        model = Class
        fields = ["id", "name", "code", "teacher_name", "students_count", "created_at"]
        read_only_fields = ["code", "created_at"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "classroom", "name"]


class GridSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grid
        fields = ["id", "classroom", "name"]


class CriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criterion
        fields = ["id", "description", "weight"]


class ActivitySerializer(serializers.ModelSerializer):
    criteria = CriterionSerializer(many=True)
    submitted = serializers.SerializerMethodField()
    graded = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ["id", "classroom", "name", "description", "level", "due_at", "subjects", "grids", "criteria", "created_at", "submitted", "graded"]
        read_only_fields = ["created_at"]

    def get_submitted(self, a):
        return a.submissions.filter(submitted_at__isnull=False).count()

    def get_graded(self, a):
        return a.submissions.filter(graded_at__isnull=False).count()

    def validate(self, data):
        if not data.get("criteria"):
            raise ValidationError({"criteria": "add at least one criterion"})
        if not data.get("grids"):
            raise ValidationError({"grids": "pick at least one grid"})
        return data

    def create(self, data):
        criteria = data.pop("criteria")
        subjects = data.pop("subjects", [])
        grids = data.pop("grids")
        activity = Activity.objects.create(created_by=self.context["request"].user, **data)
        activity.subjects.set(subjects)
        activity.grids.set(grids)
        Criterion.objects.bulk_create([Criterion(activity=activity, **c) for c in criteria])
        services.open_activity(activity)
        return activity

    def update(self, activity, data):
        criteria = data.pop("criteria", None)
        subjects = data.pop("subjects", None)
        grids = data.pop("grids", None)
        for k, v in data.items():
            setattr(activity, k, v)
        activity.save()
        if subjects is not None:
            activity.subjects.set(subjects)
        if grids is not None:
            activity.grids.set(grids)
        if criteria is not None and not activity.submissions.filter(graded_at__isnull=False).exists():
            activity.criteria.all().delete()
            Criterion.objects.bulk_create([Criterion(activity=activity, **c) for c in criteria])
        return activity


class MarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mark
        fields = ["criterion", "grade", "feedback"]


class SubmissionSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    marks = MarkSerializer(many=True, read_only=True)
    activity_name = serializers.CharField(source="activity.name", read_only=True)
    activity_level = serializers.IntegerField(source="activity.level", read_only=True)
    due_at = serializers.DateTimeField(source="activity.due_at", read_only=True)

    class Meta:
        model = Submission
        fields = ["id", "activity", "activity_name", "activity_level", "due_at", "student", "link", "submitted_at", "graded_at", "final_grade", "marks"]


class MarkInput(serializers.Serializer):
    criterion_id = serializers.IntegerField()
    grade = serializers.ChoiceField(choices=Mark.Grade.choices)
    feedback = serializers.CharField(allow_blank=True, required=False, default="")


class GradeInput(serializers.Serializer):
    marks = MarkInput(many=True)


class PlacementSerializer(serializers.ModelSerializer):
    grid_name = serializers.CharField(source="grid.name", read_only=True)
    student = UserSerializer(read_only=True)

    class Meta:
        model = Placement
        fields = ["id", "grid", "grid_name", "student", "level", "x", "y", "fail_streak"]


class HistorySerializer(serializers.ModelSerializer):
    activity = serializers.CharField(source="submission.activity.name", read_only=True)

    class Meta:
        model = PlacementHistory
        fields = ["level", "x", "y", "grade", "at", "activity"]


# ---- helpers


def classes_of(user):
    if user.is_teacher:
        return Class.objects.filter(teacher=user)
    return Class.objects.filter(enrollment__student=user)


def teacher_owns(user, class_):
    if class_.teacher_id != user.id:
        raise PermissionDenied("not your class")


# ---- auth


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = s.save()
        refresh = RefreshToken.for_user(user)
        return Response({"user": UserSerializer(user).data, "access": str(refresh.access_token), "refresh": str(refresh)}, status=201)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ---- classes


class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer

    def get_queryset(self):
        return classes_of(self.request.user).order_by("name")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "heatmap", "export", "students"):
            return [IsTeacher()]
        if self.action == "join":
            return [IsStudent()]
        return [IsAuthenticated()]

    def perform_create(self, s):
        s.save(teacher=self.request.user)

    @action(detail=False, methods=["post"], url_path="join")
    def join(self, request):
        code = str(request.data.get("code", "")).strip().upper()
        class_ = Class.objects.filter(code=code).first()
        if not class_:
            raise ValidationError({"code": "no class with that code"})
        services.enroll(request.user, class_)
        return Response(ClassSerializer(class_).data)

    @action(detail=True, methods=["get"])
    def students(self, request, pk=None):
        class_ = self.get_object()
        return Response(UserSerializer(class_.students.order_by("name"), many=True).data)

    @action(detail=True, methods=["delete"], url_path=r"students/(?P<student_id>\d+)")
    def remove_student(self, request, pk=None, student_id=None):
        class_ = self.get_object()
        teacher_owns(request.user, class_)
        class_.enrollment_set.filter(student_id=student_id).delete()
        return Response(status=204)

    # every student's cell on every grid of the class, the thing the class page draws
    @action(detail=True, methods=["get"])
    def heatmap(self, request, pk=None):
        class_ = self.get_object()
        out = []
        for grid in class_.grids.order_by("name"):
            placements = grid.placements.select_related("student").order_by("student__name")
            out.append({"grid": GridSerializer(grid).data, "placements": PlacementSerializer(placements, many=True).data})
        return Response(out)

    @action(detail=True, methods=["get"], url_path="export.csv")
    def export(self, request, pk=None):
        class_ = self.get_object()
        res = HttpResponse(services.grades_csv(class_), content_type="text/csv")
        res["Content-Disposition"] = f'attachment; filename="{class_.name}.csv"'
        return res


class ClassScoped(viewsets.ModelViewSet):
    """subjects, grids and activities all hang off a class the user can see"""

    filterset_fields = ["classroom"]

    def get_queryset(self):
        return self.queryset.filter(classroom__in=classes_of(self.request.user))

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsTeacher()]
        return [IsAuthenticated()]

    def perform_create(self, s):
        teacher_owns(self.request.user, s.validated_data["classroom"])
        s.save()

    def perform_update(self, s):
        teacher_owns(self.request.user, s.instance.classroom)
        s.save()

    def perform_destroy(self, obj):
        teacher_owns(self.request.user, obj.classroom)
        obj.delete()


class SubjectViewSet(ClassScoped):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class GridViewSet(ClassScoped):
    queryset = Grid.objects.all()
    serializer_class = GridSerializer

    def perform_create(self, s):
        teacher_owns(self.request.user, s.validated_data["classroom"])
        s.instance = services.open_grid(s.validated_data["classroom"], s.validated_data["name"])


class ActivityViewSet(ClassScoped):
    queryset = Activity.objects.prefetch_related("criteria", "subjects", "grids")
    serializer_class = ActivitySerializer

    @action(detail=True, methods=["get"], permission_classes=[IsTeacher])
    def submissions(self, request, pk=None):
        activity = self.get_object()
        subs = activity.submissions.select_related("student").prefetch_related("marks").order_by("student__name")
        return Response(SubmissionSerializer(subs, many=True).data)


class SubmissionViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = SubmissionSerializer
    filterset_fields = ["activity", "activity__classroom"]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related("student", "activity").prefetch_related("marks")
        if user.is_teacher:
            return qs.filter(activity__classroom__teacher=user)
        return qs.filter(student=user).order_by("-activity__created_at")

    @action(detail=True, methods=["post"], permission_classes=[IsStudent])
    def submit(self, request, pk=None):
        sub = self.get_object()
        link = request.data.get("link", "").strip()
        if not link:
            raise ValidationError({"link": "paste the link to your work"})
        if sub.graded_at:
            raise ValidationError({"link": "already graded"})
        sub.link = link
        sub.submitted_at = timezone.now()
        sub.save()
        return Response(SubmissionSerializer(sub).data)

    @action(detail=True, methods=["post"], permission_classes=[IsTeacher])
    def grade(self, request, pk=None):
        sub = self.get_object()
        s = GradeInput(data=request.data)
        s.is_valid(raise_exception=True)
        try:
            services.grade(sub, s.validated_data["marks"])
        except ValueError as e:
            raise ValidationError({"marks": str(e)})
        return Response(SubmissionSerializer(sub).data)


class PlacementViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = PlacementSerializer
    filterset_fields = ["grid", "student"]

    def get_queryset(self):
        user = self.request.user
        qs = Placement.objects.select_related("grid", "student")
        if user.is_teacher:
            return qs.filter(grid__classroom__teacher=user)
        return qs.filter(student=user)


class TimelineView(APIView):
    """how one student moved on one grid, oldest first"""

    def get(self, request, student_id):
        grid_id = request.query_params.get("grid")
        user = request.user
        if not user.is_teacher and user.id != int(student_id):
            raise PermissionDenied()
        placement = get_object_or_404(Placement, student_id=student_id, grid_id=grid_id)
        if user.is_teacher:
            teacher_owns(user, placement.grid.classroom)
        return Response(
            {
                "placement": PlacementSerializer(placement).data,
                "history": HistorySerializer(placement.history.select_related("submission__activity"), many=True).data,
            }
        )
