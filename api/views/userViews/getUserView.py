from rest_framework import viewsets, status
from rest_framework.response import Response
from api.models import UserModel
from api.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated


class GetUserView(viewsets.ViewSet):
    # This class is exclusively for displaying either all users or a single user

    def list(self, request):
        """
        List all users.

        Parameters:
            self (GetUserView): The instance of this class.
            request (HttpRequest): The HTTP request object containing user data.

        Returns:
            Response: A JSON response containing all users and a success status code.
        """

        # Fetch all User instances and store them in the variable "queryset"
        queryset = UserModel.objects.all()

        # Serialize the queryset (convert to JSON-compatible format)
        serializer = UserSerializer(queryset, many=True)

        # Return a JSON response with all the users and a 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        """
        Retrieve a single user.

        Parameters:
            self (GetUserView): The instance of this class.
            request (HttpRequest): The HTTP request object, not used in this function but present due to standard signature.
            pk (int, optional): The primary key (ID) of the user to retrieve.

        Returns:
            Response: A JSON response containing the requested user or an error message.
        """

        try:
            # Try to fetch the User instance using the provided primary key (ID)
            user = UserModel.objects.get(pk=pk)
        except User.DoesNotExist:
            # If the user is not found, return a 404 Not Found status and an error message
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Serialize the user instance (convert to JSON-compatible format)
        serializer = UserSerializer(user)

        # Return a JSON response with the requested user and a 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)
