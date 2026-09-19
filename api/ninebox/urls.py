from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import api
from .exams_api import ExamViewSet

router = DefaultRouter()
router.register("classes", api.ClassViewSet, basename="class")
router.register("subjects", api.SubjectViewSet)
router.register("grids", api.GridViewSet)
router.register("activities", api.ActivityViewSet)
router.register("submissions", api.SubmissionViewSet, basename="submission")
router.register("placements", api.PlacementViewSet, basename="placement")
router.register("exams", ExamViewSet, basename="exam")

urlpatterns = [
    path("auth/token", TokenObtainPairView.as_view()),
    path("auth/refresh", TokenRefreshView.as_view()),
    path("auth/register", api.RegisterView.as_view()),
    path("auth/me", api.MeView.as_view()),
    path("auth/password", api.PasswordView.as_view()),
    path("students/<int:student_id>/timeline", api.TimelineView.as_view()),
    *router.urls,
]
