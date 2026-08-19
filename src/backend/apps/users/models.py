import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_USER = 'user'
    ROLE_ADMIN = 'admin'
    ROLE_CHOICES = [(ROLE_USER, 'User'), (ROLE_ADMIN, 'Admin')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)
    occupation = models.CharField(max_length=100)
    insurance_info = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_USER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'

    def __str__(self):
        return self.username
