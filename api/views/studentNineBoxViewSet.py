from rest_framework import viewsets, status
from api.models import StudentNineBox
from api.serializers import StudentNineBoxSerializer
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

class StudentNineBoxViewSet(viewsets.ModelViewSet):
    queryset = StudentNineBox.objects.all()
    serializer_class = StudentNineBoxSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = "__all__"
    permission_classes = [IsAuthenticated]


    @action(detail=False, methods=['POST'], url_path='get_student_nine_boxes_for_class')
    def get_student_nine_boxes_for_class(self, request):
        student_id = request.data.get('student_id')
        class_obj_id = request.data.get('class_obj')
        
        # Verificação dos campos fornecidos
        if not student_id or not class_obj_id:
            return Response({'error': 'student_id e class_obj são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)

        # Filtrando as StudentNineBox pelo student_id e pela classe via NineBox
        nine_boxes = StudentNineBox.objects.filter(student=student_id, nine_box__class_obj=class_obj_id)
        
        # Serializando os dados
        serialized_data = StudentNineBoxSerializer(nine_boxes, many=True).data
        
        return Response(serialized_data, status=status.HTTP_200_OK)
