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
        fields = ('account_name', 'balance')
