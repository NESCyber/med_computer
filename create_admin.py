import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Create admin if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123', role='admin')
    print("Admin user created successfully.")
else:
    # Synchronize password and role
    u = User.objects.get(username='admin')
    u.set_password('admin123')
    u.role = 'admin'
    u.is_staff = True
    u.is_superuser = True
    u.save()
    print("Admin user password/role synchronized.")
