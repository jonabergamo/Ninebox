from rest_framework import viewsets, status
from api.serializers import UserSerializer
from api.models import User, Student, Teacher
from api.serializers import TeacherSerializer, StudentSerializer
from rest_framework.response import Response
from django_filters import rest_framework as filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]


    def create(self, request):
        """
        Create a new user.

        Parameters:
            self (UserViewSet): The instance of this class.
            request (HttpRequest): The HTTP request object containing user data.

        Returns:
            Response: A JSON response indicating success or failure.
        """

        # Initialize the serializer and populate it with data from the request
        serializer = UserSerializer(data=request.data)

        # Check if the provided data is valid
        if serializer.is_valid():
            if (
                serializer.validated_data["is_student"] == True
                and serializer.validated_data["is_teacher"] == True
            ):
                return Response(
                    {
                        "detail": {
                            "error": "Um usuário não pode ser um professor e um aluno simultaneamente"
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create the user
            user = User.objects.create_user(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )
            user.is_student = serializer.validated_data["is_student"]  # Mudança aqui
            user.is_teacher = serializer.validated_data["is_teacher"]
            user.name = serializer.validated_data.get("name", "")
            user.save()
            if user.is_student:
                Student.objects.create(user=user)
            elif user.is_teacher:
                Teacher.objects.create(user=user)

            # Return a JSON response with the new user's data and a success status code
            return Response(
                {"id": user.id, "name": user.name, "email": user.email},
                status=status.HTTP_201_CREATED,
            )

        # If the data is not valid, return a 400 Bad Request status and the validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["POST"], url_path="create_superuser")
    def create_superuser(self, request, pk=None):
        """
        Create a new superuser.

        Parameters:
            self (UserViewSet): The instance of this class.
            request (HttpRequest): The HTTP request object containing user data.

        Returns:
            Response: A JSON response indicating success or failure.
        """

        # Initialize the serializer and populate it with data from the request
        serializer = UserSerializer(data=request.data)

        # Check if the provided data is valid
        if serializer.is_valid():
            if (
                serializer.validated_data["is_aluno"] == True
                and serializer.validated_data["is_professor"] == True
            ):
                return Response(
                    {
                        "detail": {
                            "error": "Um usuário não pode ser um professor e um aluno simultaneamente"
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create the user
            user = User.objects.create_superuser(
                serializer.validated_data["username"],
                serializer.validated_data["email"],
                serializer.validated_data["password"],
                first_name=serializer.validated_data["first_name"],
                last_name=serializer.validated_data["last_name"],
            )
            user.is_aluno = serializer.validated_data["is_aluno"]
            user.is_professor = serializer.validated_data[
                "is_professor"
            ]  # fixed this line
            user.save()

            if user.is_aluno:
                Student.objects.create(user=user)
            elif user.is_professor:
                Teacher.objects.create(user=user)

            # Return a JSON response with the new user's data and a success status code
            return Response(
                {"id": user.id, "username": user.username, "email": user.email},
                status=status.HTTP_201_CREATED,
            )

        # If the data is not valid, return a 400 Bad Request status and the validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
