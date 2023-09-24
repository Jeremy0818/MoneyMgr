# Generated by Django 4.2.5 on 2023-09-23 14:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('moneymanagerapp', '0003_expensecategory_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='incomecategory',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='income_category', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
