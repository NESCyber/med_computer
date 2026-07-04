from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import sys
        # Avoid running during management commands like makemigrations, collectstatic, etc.
        if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate', 'collectstatic', 'test']):
            return

        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Create admin if it doesn't exist
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser('admin', 'admin@example.com', 'admin123', role='admin')
                print("Admin user created successfully on startup.")
            else:
                u = User.objects.get(username='admin')
                needs_update = False
                if not u.is_staff:
                    u.is_staff = True
                    needs_update = True
                if not u.is_superuser:
                    u.is_superuser = True
                    needs_update = True
                if u.role != 'admin':
                    u.role = 'admin'
                    needs_update = True
                if needs_update:
                    u.save()
                    print("Admin user elevated to staff/superuser on startup.")
        except Exception as e:
            # Fall back silently if database tables are not ready yet
            pass
