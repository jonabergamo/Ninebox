from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.response import Response
from api.models import UserModel
from rest_framework.permissions import IsAuthenticated

class DeleteUserView(viewsets.ViewSet):
    """
    Esta classe é exclusivamente para deletar um usuário.
    """

    @swagger_auto_schema(
        operation_description="Deleta um usuário existente pelo ID",
        responses={
            200: "OK, usuário deletado",
            404: "Not Found, usuário não encontrado",
        },
    )
    def destroy(self, request, pk=None):
        """
        Delete an existing user.

        Parameters:
            self (DeleteUserView): The instance of this class.
            request (HttpRequest): The HTTP request object.
            pk (int, optional): The primary key (ID) of the user to delete.

        Returns:
            Response: A JSON response indicating success or failure.
        """
        try:
            # Try to fetch the user instance using the provided primary key (ID)
            instance = UserModel.objects.get(pk=pk)
        except UserModel.DoesNotExist:
            # If the user is not found, return a 404 Not Found status and an error message
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Delete the user instance
        instance.delete()

        # Return a 200 OK status and a success message
        return Response({"message": "Success"}, status=status.HTTP_200_OK)
