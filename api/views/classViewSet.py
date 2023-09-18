from rest_framework import viewsets, serializers, status
from api.models import Class, Student
from api.serializers import ClassSerializer
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.response import Response


class AddStudentBody(serializers.Serializer):
    student_email = serializers.EmailField()


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    @swagger_auto_schema(
        method="post",
        operation_description="Adiciona um student à class usando seu e-mail.",
        request_body=AddStudentBody,  # <--- Indicamos que o corpo da requisição deve ser conforme definido em AddstudentBody
    )
    @action(detail=True, methods=["POST"], url_path="add_student")
    def add_student_to_class(self, request, pk=None):
        class_model = self.get_object()
        student_email = request.data.get("student_email", None)

        if not student_email:
            return Response(
                {"error": "O e-mail do student é necessário"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            student = Student.objects.get(user__email=student_email)
        except student.DoesNotExist:
            return Response(
                {"error": "student com este e-mail não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        class_model.students.add(student)
        class_model.save()

        return Response(
            {"status": f"student com e-mail {student_email} foi adicionado à class"},
            status=status.HTTP_200_OK,
        )
