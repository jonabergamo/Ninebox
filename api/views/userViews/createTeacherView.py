from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from api.serializers import UserSerializer
from rest_framework import permissions


class CreateTeacherView(viewsets.ViewSet):
    """
    This class is exclusively for adding a user.
    """

    @swagger_auto_schema(
        operation_description="Create a new superuser.",
        request_body=UserSerializer,
        responses={
            201: "Superuser successfully created.",
            400: "Invalid request.",
        },
    )
    @action(detail=False, methods=["POST"])
    def create_teacher(self, request):
        """
        Create a new superuser.

        Expects a JSON containing 'username', 'email', and 'password'.
        """
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not (username and email and password):
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Make sure your User model has an 'is_teacher' field if you include it here
            user = User.objects.create_superuser(username, email, password)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"message": f"Superuser {user.username} successfully created!"},
            status=status.HTTP_201_CREATED,
        )
