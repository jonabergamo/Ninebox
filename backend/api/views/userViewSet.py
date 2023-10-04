from rest_framework import viewsets, status
from api.serializers import UserSerializer
from api.models import User, Student, Teacher
from api.serializers import TeacherSerializer, StudentSerializer
from rest_framework.response import Response
from django_filters import rest_framework as filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
import secrets
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives


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

    custom_schema = openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "name": openapi.Schema(
                type=openapi.TYPE_STRING, description="Nome do usuário"
            ),
            "email": openapi.Schema(
                type=openapi.TYPE_STRING, description="Endereço de e-mail do usuário"
            ),
        },
        required=["name", "email"],
    )

    @swagger_auto_schema(
        operation_description="Cria um novo usuário com uma senha aleatória e envia um e-mail com as credenciais de login.",
        request_body=custom_schema,
        responses={201: "Usuário criado com sucesso", 400: "Requisição inválida"},
    )
    @action(detail=False, methods=["POST"], permission_classes=[IsAuthenticated])
    def create_with_random_password(self, request):
        # Inicializa o serializer e o preenche com dados da requisição
        serializer = UserSerializer(data=request.data)

        # Verifica se os dados fornecidos são válidos
        if serializer.is_valid():
            is_student = serializer.validated_data.get("is_student", True)
            is_teacher = serializer.validated_data.get("is_teacher", False)

            if is_student == True and is_teacher == True:
                return Response(
                    {
                        "detail": {
                            "error": "Um usuário não pode ser um professor e um aluno simultaneamente"
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Gerar uma senha aleatória
            random_password = secrets.token_hex(8)  # Senha de 16 caracteres

            # Criar o usuário
            user = User.objects.create_user(
                email=serializer.validated_data["email"],
                password=random_password,
            )
            user.is_student = is_student
            user.is_teacher = is_teacher
            user.name = serializer.validated_data.get("name", "")
            user.save()

            # Criar o perfil do Student ou Teacher, se necessário
            if user.is_student:
                Student.objects.create(user=user)
            elif user.is_teacher:
                Teacher.objects.create(user=user)

            # Carrega o template de e-mail e preenche com as credenciais
            html_content = render_to_string(
                "register.html", {"email": user.email, "password": random_password}
            )

            # Configura o e-mail
            subject, from_email, to = (
                "Suas credenciais de login",
                "from_email@example.com",
                user.email,
            )
            text_content = f"Olá, suas credenciais de login são:\nEmail: {user.email}\nSenha: {random_password}"

            msg = EmailMultiAlternatives(subject, text_content, from_email, [to])

            # Anexa o logo
            msg.attach_alternative(html_content, "text/html")

            # Envia o e-mail
            msg.send()

            return Response(
                {"id": user.id, "name": user.name, "email": user.email},
                status=status.HTTP_201_CREATED,
            )

        # Se os dados não forem válidos, retorne um status 400 Bad Request e os erros de validação
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
