from rest_framework import viewsets, serializers, status
from api.models import StudentActivity, Activity, Evaluation, Student, StudentNineBox
from api.serializers import StudentActivitySerializer
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from api.permissions import IsTeacherPermission
from datetime import timedelta


class SubmitActivityInput(serializers.Serializer):
    activity_link = serializers.URLField()


class GradeInputSerializer(serializers.Serializer):
    criteria_id = serializers.IntegerField()
    grade = serializers.ChoiceField(choices=["E", "G", "A", "P"])


class CorrectStudentActivityInput(serializers.Serializer):
    grades = GradeInputSerializer(many=True)


class StudentActivityViewSet(viewsets.ModelViewSet):
    queryset = StudentActivity.objects.all()
    serializer_class = StudentActivitySerializer
    filter_backends = (filters.DjangoFilterBackend,OrderingFilter)
    filterset_fields = "__all__"
    
    
    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [IsAuthenticated,]
        elif self.action == 'submit_activity':
            self.permission_classes = [IsAuthenticated,]
        else:
            self.permission_classes = [IsTeacherPermission,]
        return [permission() for permission in self.permission_classes]


    @swagger_auto_schema(
        method="post",
        request_body=CorrectStudentActivityInput,
        operation_description="Corrige a atividade de um aluno.",
    )
    @action(detail=True, methods=["POST"], url_path="grade_exam")
    def grade_exam(self, request, pk=None):
        grades = request.data.get("grades", [])

        try:
            student_activity = StudentActivity.objects.get(id=pk)
            activity = student_activity.activity
            student = student_activity.student
            student_ninebox_instances = StudentNineBox.objects.filter(
                student=student, nine_box__in=activity.nine_boxes.all()
            )
        except StudentActivity.DoesNotExist:
            return Response(
                {"error": "Atividade ou aluno não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        criteria = activity.criteria.all()
        evaluations = []

        for crit in criteria:
            grade = next(
                (item["grade"] for item in grades if item["criteria_id"] == crit.id),
                None,
            )

            if grade is None:
                return Response(
                    {"error": f"Nota para o critério {crit.id} não fornecida."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            evaluation = Evaluation.objects.create(
                student=student,
                activity=activity,
                criteria=crit,
                grade=grade,
            )
            evaluations.append(evaluation)

        # Atualizando o StudentActivity
        student_activity.evaluations.set(evaluations)
        student_activity.correction_date = timezone.now() + timedelta(days=1)
        student_activity.update_final_grade()  # Adicione essa linha
        # Atualizando todas as StudentNineBoxes associadas
        for student_ninebox_instance in student_ninebox_instances:
            student_ninebox_instance.update_student_ninebox(
                student_activity.final_grade, activity.level
            )
        student_activity.save()

        return Response(
            {
                "status": "Prova corrigida com sucesso.",
                "grade": student_activity.final_grade,
            },
            status=status.HTTP_200_OK,
        )
        
    @swagger_auto_schema(
        method="patch",
        request_body=SubmitActivityInput,
        operation_description="Envia o link da atividade de um aluno.",
    )
    @action(detail=True, methods=["PATCH"], url_path="submit_activity")
    def submit_activity(self, request, pk=None):
        student_activity = get_object_or_404(StudentActivity, id=pk)
        
        # Verifique se o usuário tem permissão para atualizar essa atividade específica
        # (Por exemplo, verificar se request.user == student_activity.student)
        
        activity_link = request.data.get("activity_link")
        if activity_link:
            student_activity.activity_link = activity_link
            student_activity.save()
            return Response({"status": "Link da atividade atualizado com sucesso."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Link da atividade não fornecido."}, status=status.HTTP_400_BAD_REQUEST)
