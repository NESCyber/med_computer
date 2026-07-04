from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ADMIN = 'admin'
    CUSTOMER = 'customer'
    ROLE_CHOICES = (
        (ADMIN, 'Admin'),
        (CUSTOMER, 'Customer'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=CUSTOMER)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def is_admin(self):
        return self.role == self.ADMIN or self.is_superuser

    def is_customer(self):
        return self.role == self.CUSTOMER

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

