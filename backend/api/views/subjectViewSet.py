from rest_framework import viewsets
from api.models import Subject, Teacher
from api.serializers import SubjectSerializer
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = self.request.user
        try:
            teacher = Teacher.objects.get(user=user)
        except Teacher.DoesNotExist:
            return Response(
                {"detail": "Você não é um professor."}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Adicione a Subject ao professor que a criou
        subject = Subject.objects.get(id=serializer.data["id"])
        teacher.subjects.add(subject)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @action(detail=True, methods=["POST"])
    def add_to_teacher(self, request, pk=None):
        subject = self.get_object()

        # Obter o e-mail e o ID único da turma do corpo da requisição
        teacher_email = request.data.get("email", None)
        class_unique_id = request.data.get("class_id", None)

        if not teacher_email or not class_unique_id:
            return Response(
                {"detail": "E-mail ou ID único da turma não fornecidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Obter o professor com base no e-mail
        try:
            teacher = Teacher.objects.get(user__email=teacher_email)
        except Teacher.DoesNotExist:
            return Response(
                {"detail": "Professor com esse e-mail não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verificar se o professor está na mesma turma que a disciplina
        if not teacher.classes.filter(unique_id=class_unique_id).exists():
            return Response(
                {"detail": "Professor não está na mesma turma que a disciplina."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Adicionar a disciplina ao professor
        teacher.subjects.add(subject)
        return Response(
            {"detail": "Disciplina adicionada ao professor."}, status=status.HTTP_200_OK
        )
