from rest_framework import status, viewsets
from api.serializers import UserSerializer
from drf_yasg.utils import swagger_auto_schema
from api.models import UserModel  # Importe o seu UserModel aqui
from rest_framework.response import Response

class CreateUserView(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Creates a new student user.",
        request_body=UserSerializer,
        responses={201: UserSerializer(many=False), 400: "Bad request"},
    )
    def create(self, request):
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            username = serializer.validated_data["username"]
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]
            
            # Crie um novo usuário com as informações fornecidas
            user = UserModel.objects.create_user(username=username, email=email, password=password)
            
            # Como esta view é exclusiva para estudantes, defina o campo 'role' como 'STUDENT'
            user.role = 'STUDENT'
            user.save()
            
            return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": "STUDENT"
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)