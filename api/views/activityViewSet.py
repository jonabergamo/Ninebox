from rest_framework import viewsets
from api.serializers import ActivitySerializer, StudentActivityWithStudentSerializer
from api.models import Activity, StudentActivity
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from rest_framework.decorators import action
from rest_framework.response import Response



class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    filter_backends = (filters.DjangoFilterBackend, OrderingFilter)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]

    ordering_fields = ['id', 'name', 'level', 'student__user__name']
    ordering = ['id']  # Opcional: ordena por 'id' por padrão
    
    @action(detail=True, methods=['GET'])
    def student_activities(self, request, pk=None):
        activity = self.get_object()
        student_activities = StudentActivity.objects.filter(activity=activity).order_by('student__user__name')

        # Usando o serializer ajustado para trazer os detalhes do usuário
        serializer = StudentActivityWithStudentSerializer(student_activities, many=True)
        return Response(serializer.data)