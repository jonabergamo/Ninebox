from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.tokens import RefreshToken
from api.serializers import ValidateUserSerializer
from rest_framework.permissions import AllowAny


class ValidateUserView(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Validate the user and return the access and refresh tokens.",
        request_body=ValidateUserSerializer,
        responses={
            200: "Successfully authenticated",
            400: "Bad Request",
            401: "Unauthorized",
        },
    )
    @action(detail=False, methods=["POST"])
    def validate(self, request, pk=None):
        """
        Validate the user and return the token and refresh token.

        Expects a JSON containing 'username' and 'password'.
        """
        username = request.data.get("username")
        password = request.data.get("password")

        if not (username and password):
            return Response(
                {"error": "Both username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)

        if user is not None:
            # User is authenticated, create the tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {"token": str(refresh.access_token), "refresh_token": str(refresh)},
                status=status.HTTP_200_OK,
            )

        else:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
