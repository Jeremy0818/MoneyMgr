# Generated by Django 4.2.5 on 2023-10-19 13:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('moneymanagerapp', '0007_alter_expense_expense_category_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='expense',
            old_name='expense_category',
            new_name='category',
        ),
        migrations.RenameField(
            model_name='income',
            old_name='income_category',
            new_name='category',
        ),
        migrations.RenameField(
            model_name='transfer',
            old_name='transfer_category',
            new_name='category',
        ),
    ]