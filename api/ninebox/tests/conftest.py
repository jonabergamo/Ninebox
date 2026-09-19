import pytest
from rest_framework.test import APIClient

from ninebox.models import Class, User


@pytest.fixture
def teacher(db):
    return User.objects.create_user("t@x.com", "password123", name="Teacher", role="teacher")


@pytest.fixture
def other_teacher(db):
    return User.objects.create_user("t2@x.com", "password123", name="Other", role="teacher")


@pytest.fixture
def student(db):
    return User.objects.create_user("s@x.com", "password123", name="Student", role="student")


@pytest.fixture
def klass(teacher):
    return Class.objects.create(name="7B", code="ABC234", teacher=teacher)


@pytest.fixture
def as_(db):
    def login(user):
        c = APIClient()
        c.force_authenticate(user)
        return c

    return login
