import os
from django.db import migrations

class Migration(migrations.Migration):
    # migration to create a default superuser at app startup, using environment variables
    
    dependencies = [
        ('api', '0001_initial'),
    ]

    def generate_superuser(apps, schema_editor):
        from ..models import User

        username = os.getenv("SUPERUSER_USERNAME", "admin")
        first_name = os.getenv("SUPERUSER_FIRST_NAME", "admin")
        last_name = os.getenv("SUPERUSER_LAST_NAME", "")
        email = os.getenv("SUPERUSER_EMAIL", "admin@gmail.com")
        password = os.getenv("SUPERUSER_PASSWORD", "admin")

        superuser = User.objects.create_superuser(
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            password=password
        )

        superuser.save()

    operations = [
        migrations.RunPython(generate_superuser),
    ]