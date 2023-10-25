from django.test import TestCase
from api.models import User, Student, Teacher
from rest_framework.test import APITestCase
from rest_framework import status
from django.core import mail



class CustomUserManagerTestCase(TestCase):
    
    def test_create_user(self):
        user = User.objects.create_user(email="teste@example.com", password="senha123")
        self.assertIsInstance(user, User)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        user = User.objects.create_superuser(email="super@example.com", password="senha123")
        self.assertIsInstance(user, User)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        
class StudentTeacherModelTestCase(TestCase):
    
    def setUp(self):
        self.user1 = User.objects.create_user(email="aluno@example.com", password="senha123")
        self.user2 = User.objects.create_user(email="professor@example.com", password="senha123")

    def test_create_student(self):
        student = Student.objects.create(user=self.user1)
        self.assertIsInstance(student, Student)

    def test_create_teacher(self):
        teacher = Teacher.objects.create(user=self.user2)
        self.assertIsInstance(teacher, Teacher)
        
    
class UserViewSetTestCase(APITestCase):
    
    def setUp(self):
        # Criar um usuário que tem a permissão para criar outros usuários
        self.user = User.objects.create_superuser(email='admin@example.com', password='senha123')
        self.client.force_authenticate(user=self.user)

    def test_create_user(self):
        data = {
              "name": "Test",
              "email": "test@gmail.com",
              "is_active": "true",
              "is_student": "false",
              "is_teacher": "true",
              "password": "passtest"
                }
        response = self.client.post("/users/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)

    def test_create_invalid_user(self):
        data = {
            "email": "",
            "password": "senha123"
        }
        response = self.client.post("/users/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        
class UserCreateWithRandomPasswordTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_superuser(email='admin@example.com', password='senha123')
        self.client.force_authenticate(user=self.user)

    def test_create_student_user(self):
        data = {
              "name": "Student Test",
              "email": "studenttest@gmail.com",
              "is_active": "true",
              "is_student": "true",
              "is_teacher": "false",
              "password": "passtest"
                }
        response = self.client.post("/users/create_with_random_password/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)
        self.assertEqual(Student.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)  # Verifica se um e-mail foi enviado

    def test_create_teacher_user(self):
        data = {
              "name": "Teacher Test",
              "email": "teachertest@gmail.com",
              "is_active": "true",
              "is_student": "false",
              "is_teacher": "true",
              "password": "passtest"
                }
        response = self.client.post("/users/create_with_random_password/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)
        self.assertEqual(Teacher.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)  # Verifica se um e-mail foi enviado

    def test_create_invalid_user(self):
        data = {
            "email": "bademail",
            "is_student": True
        }
        response = self.client.post("/users/create_with_random_password/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 2)  # Apenas o usuário do setUp
        self.assertEqual(len(mail.outbox), 0)  # Nenhum e-mail deve ser enviado

    def test_cannot_be_student_and_teacher(self):
        data = {
            "email": "confused@example.com",
            "is_student": True,
            "is_teacher": True
        }
        response = self.client.post("/users/create_with_random_password/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 2)  # Apenas o usuário do setUp
        self.assertEqual(len(mail.outbox), 0)  # Nenhum e-mail deve ser enviado
        
        
class UserResetPasswordTestCase(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_superuser(email='admin@example.com', password='senha123')
        self.user2 = User.objects.create_user(email='user@example.com', password='senha123')
        self.client.force_authenticate(user=self.user1)

    def test_reset_password_valid_user(self):
        response = self.client.post(f"/users/{self.user2.id}/reset_password/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)  # Verifica se um e-mail foi enviado

    def test_reset_password_invalid_user(self):
        response = self.client.post("/users/999/reset_password/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(len(mail.outbox), 0)  # Nenhum e-mail deve ser enviado