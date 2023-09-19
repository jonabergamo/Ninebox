from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.routers import DefaultRouter
from api.views import (
    UserViewSet,
    ActivityViewSet,
    ClassViewSet,
    CriteriaViewSet,
    EvaluationViewSet,
    NineBoxViewSet,
    StudentViewSet,
    StudentNineBoxViewSet,
    SubjectViewSet,
    TeacherViewSet,
    StudentActivityViewSet,
)


router = DefaultRouter()
router.register("users", UserViewSet)
router.register("teachers", TeacherViewSet)
router.register("classes", ClassViewSet)
router.register("students", StudentViewSet)
router.register("student_activities", StudentActivityViewSet)
router.register("subjects", SubjectViewSet)
router.register("activities", ActivityViewSet)
router.register("nineboxes", NineBoxViewSet)
router.register("student_nineboxes", StudentNineBoxViewSet)
router.register("criterias", CriteriaViewSet)
router.register("evaluates", EvaluationViewSet)


# Initialize the schema view for the Swagger documentation
schema_view = get_schema_view(
    # Provide the basic information about the API.
    # This information will be displayed at the top of the Swagger UI.
    openapi.Info(
        title="NINEBOX API",  # The title of your API
        default_version="v1.0",  # The default version of your API
    ),
    public=True,  # Determines if the API docs should be publicly accessible.
    # Setting this to True allows any user to see the docs without authentication.
    # Set the permission classes for accessing the API documentation.
    # Here, permissions.AllowAny means any user can access, even if not authenticated.
    permission_classes=(permissions.AllowAny,),
)

# Defining the URL patterns for the project
urlpatterns = [
    # The admin panel will be accessible via the '/admin/' URL
    path("admin/", admin.site.urls),
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("", include(router.urls)),
]
