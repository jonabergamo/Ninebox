from rest_framework import viewsets, serializers, status
from api.models import StudentActivity, Activity, Evaluation, Student, StudentNineBox
from api.serializers import StudentActivitySerializer
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema


class GradeInputSerializer(serializers.Serializer):
    criteria_id = serializers.IntegerField()
    grade = serializers.ChoiceField(choices=["E", "G", "A", "P"])


class CorrectStudentActivityInput(serializers.Serializer):
    grades = GradeInputSerializer(many=True)


class StudentActivityViewSet(viewsets.ModelViewSet):
    queryset = StudentActivity.objects.all()
    serializer_class = StudentActivitySerializer

    @swagger_auto_schema(
        method="post",
        request_body=CorrectStudentActivityInput,
        operation_description="Corrige a atividade de um aluno.",
    )
    @action(detail=True, methods=["POST"], url_path="corrigir_prova")
    def corrigir_prova(self, request, pk=None):
        grades = request.data.get("grades", [])

        try:
            student_activity = StudentActivity.objects.get(id=pk)
            activity = student_activity.activity
            student = student_activity.student
            student_ninebox_instance = StudentNineBox.objects.get(
                student=student, nine_box=activity.nine_boxes.first()
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
        student_activity.correction_date = timezone.now()
        student_activity.update_final_grade()  # Adicione essa linha
        student_ninebox_instance.update_student_ninebox(student_activity.final_grade)
        student_activity.save()

        return Response(
            {"status": "Prova corrigida com sucesso."},
            status=status.HTTP_200_OK,
        )
