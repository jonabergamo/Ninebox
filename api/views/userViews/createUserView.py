from rest_framework import status, viewsets
from api.serializers import UserSerializer
from drf_yasg.utils import swagger_auto_schema
from django.contrib.auth.models import User
from rest_framework.response import Response


class CreateUserView(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Creates a new user.",
        request_body=UserSerializer,
        responses={201: UserSerializer(many=False), 400: "Bad request"},
    )
    def create(self, request):
        """
        Create a new user.

        Parameters:
            self (CreateUserView): The instance of this class.
            request (HttpRequest): The HTTP request object containing user data.

        Returns:
            Response: A JSON response indicating success or failure.
        """

        # Initialize the serializer and populate it with data from the request
        serializer = UserSerializer(data=request.data)

        # Check if the provided data is valid
        if serializer.is_valid():
            # Create a new user using the validated data
            user = User.objects.create_user(
                serializer.validated_data["username"],
                serializer.validated_data["email"],
                serializer.validated_data["password"],
            )

            # Return a JSON response with the new user's data and a success status code
            return Response(
                {"id": user.id, "username": user.username, "email": user.email},
                status=status.HTTP_201_CREATED,
            )

        # If the data is not valid, return a 400 Bad Request status and the validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
