from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import viewsets, status
from rest_framework.response import Response
from api.serializers import UserSerializer
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAuthenticated


class UpdateUserView(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Fully or partially updates an existing user.",
        request_body=UserSerializer(partial=True),
        responses={
            200: UserSerializer(many=False),
            400: "Bad request",
            404: "User not found",
        },
    )
    def update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            # Check if 'password' is in the validated data
            if "password" in serializer.validated_data:
                serializer.validated_data["password"] = make_password(
                    serializer.validated_data["password"]
                )

            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
