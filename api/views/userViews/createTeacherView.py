from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from api.models import (
    UserModel,
)  # Certifique-se de importar o seu modelo de usuário personalizado
from api.serializers import UserSerializer
from rest_framework import permissions


class CreateTeacherView(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Create a new teacher.",
        request_body=UserSerializer,
        responses={201: "Teacher successfully created.", 400: "Invalid request."},
    )
    @action(detail=False, methods=["POST"])
    def create_teacher(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.validated_data["username"]
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            # Create a new user
            user = UserModel.objects.create_superuser(
                username=username, email=email, password=password
            )

            # Since this view is for teachers, set role to 'TEACHER'
            user.role = "TEACHER"
            user.save()

            return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": "TEACHER",
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
