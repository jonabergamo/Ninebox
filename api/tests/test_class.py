from django.test import TestCase
from api.models import Class, User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class ClassManagerTestCase(APITestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(email='admin@example.com', password='senha123', is_teacher=True, is_student=False)
        self.client.force_authenticate(user=self.user)
        self.class_instance = Class.objects.create(name='Teste', unique_id='123412')
    
    def test_class_create(self):
        data = {
            "name":'Teste'
        }
        response = self.client.post('/classes/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_class_list(self):
        response = self.client.get('/classes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        
    def test_class_retrieve(self):
        response = self.client.get(f'/classes/{self.class_instance.unique_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_class_update(self):
        data = {
            "name":"New Name"
        }
        response = self.client.put(f'/classes/{self.class_instance.unique_id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_class_add_user(self):
        data = {
            "user_email":self.user.email
        }
        response = self.client.post(f'/classes/{self.class_instance.unique_id}/add_user/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)