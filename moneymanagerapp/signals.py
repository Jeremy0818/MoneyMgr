# signals.py (create this file if it doesn't exist)
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import *
from decimal import Decimal

@receiver(post_save, sender=User)
def create_expense_category(sender, instance, created, **kwargs):
    if created:
        user = instance
        # Create an instance of ExpenseCategory when a new User is created
        ExpenseCategory.objects.create(category_name="Groceries", user=user)
        ExpenseCategory.objects.create(category_name="Utilities", user=user)
        ExpenseCategory.objects.create(category_name="Transportation", user=user)
        ExpenseCategory.objects.create(category_name="Dining", user=user)
        ExpenseCategory.objects.create(category_name="Entertainment", user=user)
        ExpenseCategory.objects.create(category_name="Housing", user=user)
        ExpenseCategory.objects.create(category_name="Travel", user=user)
        ExpenseCategory.objects.create(category_name="Communication", user=user)
        ExpenseCategory.objects.create(category_name="Gift", user=user)
        ExpenseCategory.objects.create(category_name="Medical", user=user)
        ExpenseCategory.objects.create(category_name="Shopping", user=user)
        ExpenseCategory.objects.create(category_name="Miscellaneous", user=user)
        IncomeCategory.objects.create(category_name="Salary", user=user)
        IncomeCategory.objects.create(category_name="Bonus", user=user)
        IncomeCategory.objects.create(category_name="Business", user=user)
        IncomeCategory.objects.create(category_name="Extra", user=user)
        TransferCategory.objects.create(category_name="Credit Card Bill", user=user)
        TransferCategory.objects.create(category_name="Saving", user=user)
        TransferCategory.objects.create(category_name="Other", user=user)
        Account.objects.create(user=user, account_name="Cash", balance=0.00)
