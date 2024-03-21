from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *
from datetime import date

class CustomDateField(serializers.ReadOnlyField):
    def to_representation(self, value):
        # Convert a datetime object to a date object, extracting the date part only
        if value is not None:
            return date(value.year, value.month, value.day)
        return None

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class TransactionSerializer(serializers.ModelSerializer):
    date = CustomDateField()
    
    class Meta:
        model = Transaction
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'account_name', 'balance')

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ('category_name',)

class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = ('category_name',)

class ExpenseSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer()
    category = ExpenseCategorySerializer()

    class Meta:
        model = Expense
        fields = '__all__'

class IncomeSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer()
    category = IncomeCategorySerializer()

    class Meta:
        model = Income
        fields = '__all__'

class BudgetSerializer(serializers.ModelSerializer):
    expense_category = ExpenseCategorySerializer()

    class Meta:
        model = Budget
        fields = ('id', 'expense_category', 'budget', 'balance')
