from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.middleware import csrf
from django.shortcuts import render
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import TemplateView
from django import forms
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated

from decimal import Decimal
import json

from .models import *
from .serializers import *
from .utils import ocr

class InvalidTransactionTypeError(Exception):
    pass

JWTAuthentication.USER_ID_CLAIM = 'user_id'

class Index(TemplateView):
    template_name = 'moneymanagerapp/index.html'

class Manifest(TemplateView):
    template_name = 'moneymanagerapp/manifest.json'

@api_view(['GET'])
def get_csrf_token_api(request):
    csrf_token = csrf.get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

# Login API Endpoint
@api_view(['POST'])
def login_api(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required.'}, status=400)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        # Generate JWT access and refresh tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        serializer = CustomUserSerializer(user)
        serialized_data = serializer.data

        return JsonResponse({'message': 'Login successful.', 'access': access_token, 'refresh': str(refresh), 'user': serialized_data})
    else:
        return JsonResponse({'error': 'Login failed. Please check your credentials.'}, status=401)

# Logout API Endpoint
@api_view(['POST'])
def logout_api(request):
    logout(request)
    return JsonResponse({'message': 'Logout successful.'})

CustomUser = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, error_messages={
        'required': 'Email is required.',
        'invalid': 'Enter a valid email address.',
    }, help_text='<ul><li>Enter your valid email address.</li><li>We will use this email to communicate with you and send important notifications.</li></ul>')

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password1", "password2")
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError('Email address is already in use.')
        return email

# Register API Endpoint
@api_view(['GET', 'POST'])
def register_api(request):
    if request.method == 'POST':
        # Parse the JSON data from the request body
        data = json.loads(request.body)
        form = CustomUserCreationForm(data)
        print(form)
        if form.is_valid():
            user = form.save()
            login(request, user)  # Log the user in after registration
            return JsonResponse({'message': 'Registration successful.'})
        else:
            # Handle password validation errors
            errors = form.errors.get_json_data()
            help_text = {
                'username': form.fields['username'].help_text,
                'email': form.fields['email'].help_text,
                'password1': form.fields['password1'].help_text,
                'password2': form.fields['password2'].help_text,
            }

            if errors:
                return JsonResponse({'error': errors, 'help': help_text}, status=400)
            else:
                return JsonResponse({'error': 'Registration failed. Please check your input.'}, status=400)
    elif request.method == "GET":
        form = CustomUserCreationForm()
        print(form.fields['username'].help_text)
        help_text = {
            'username': form.fields['username'].help_text,
            'email': form.fields['email'].help_text,
            'password1': form.fields['password1'].help_text,
            'password2': form.fields['password2'].help_text,
        }
        return JsonResponse({'help': help_text})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_api(request):
    try:
        authorization_header = request.META.get('HTTP_AUTHORIZATION')

        if authorization_header and authorization_header.startswith('Bearer '):
            # Extract the token part (remove 'Bearer ')
            token = authorization_header.split(' ')[1]
            
        # Decode the access token
        decoded_token = AccessToken(token)
        
        # Extract the user ID from the token
        user_id = decoded_token[JWTAuthentication.USER_ID_CLAIM]

        # Get the user object using the user ID
        user = User.objects.get(pk=user_id)

        if user is not None:
            # You have the user object
            print(f'User ID: {user.id}, Username: {user.username}')
            serializer = CustomUserSerializer(user)
            serialized_data = serializer.data
            return JsonResponse({'user': serialized_data})
        else:
            # Token is invalid or user doesn't exist
            print('Invalid token or user not found.')
            return JsonResponse({'error': 'User not found'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except TokenError:
        return JsonResponse({'error': 'Token is invalid or expired'}, status=403)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ocr_api(request):
    image_data = request.FILES.get('image')

    if not image_data:
        return JsonResponse({'error': 'No image provided'}, status=400)

    try:
        response_data = ocr(image_data)
        user = request.user
        exp_categories = list(user.expense_category.all().values_list('category_name', flat=True))
        inc_categories = list(user.income_category.all().values_list('category_name', flat=True))
        trn_categories = list(user.transfer_category.all().values_list('category_name', flat=True))
        accounts = list(user.accounts.all().values_list('account_name', flat=True))
        for i in range(len(response_data['data'])):
            response_data['data'][i]['category'] = exp_categories[0]
            response_data['data'][i]['account'] = accounts[0]
            response_data['data'][i]['type'] = "Expense"
        response_data['expense_categories'] = exp_categories
        response_data['income_categories'] = inc_categories
        response_data['transfer_categories'] = trn_categories
        response_data['accounts'] = accounts
        return JsonResponse(response_data)

    except Exception as e:
        print(e)
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transaction_api(request):
    try:
        user = request.user
        data = json.loads(request.body)
        for item in data:
            with transaction.atomic():
                transaction_obj = Transaction(title=item['title'], date=item['date'], total_amount=item['total_amount'])
                transaction_obj.save()
                if item['type'] == "Expense":
                    category = ExpenseCategory.objects.get(user=user, category_name=item['category'])
                    account = Account.objects.get(user=user, account_name=item['account'])
                    account.balance -= Decimal(item['total_amount'])
                    account.save()
                    expense = Expense(user=user, transaction=transaction_obj, category=category, withdrawed_account=account)
                    expense.save()
                elif item['type'] == "Income":
                    category = IncomeCategory.objects.get(user=user, category_name=item['category'])
                    account = Account.objects.get(user=user, account_name=item['account'])
                    account.balance += Decimal(item['total_amount'])
                    account.save()
                    income = Income(user=user, transaction=transaction_obj, category=category, deposited_account=account)
                    income.save()
                elif item['type'] == "Transfer":
                    pass
                else:
                    raise InvalidTransactionTypeError(f"Invalid transaction type received: %s".format(item['type']))
        return JsonResponse({"status": "success"})
    except Exception as e:
        print(e)
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def transaction_id_api(request, id):
    if request.method == 'POST':
        try:
            user = request.user
            data = json.loads(request.body)
            transaction_obj = Transaction.objects.get(id=id)

            with transaction.atomic():
                if data['type'] == "Expense":
                    expense = Expense.objects.get(user=user, transaction=transaction_obj)
                    if data['account'] != expense.withdrawed_account.account_name:
                        # Undo previous calculation
                        account = expense.withdrawed_account
                        account.balance += transaction_obj.total_amount
                        account.save()
                        # Update account balance
                        account = Account.objects.get(user=user, account_name=data['account'])
                        account.balance -= Decimal(data['total_amount'])
                        account.save()
                    else:
                        # Undo previous calculation
                        expense.withdrawed_account.balance += transaction_obj.total_amount
                        # Update account balance
                        expense.withdrawed_account.balance -= Decimal(data['total_amount'])
                    # Update Income fields
                    category = ExpenseCategory.objects.get(user=user, category_name=data['category'])
                    expense.category = category
                    expense.withdrawed_account = Account.objects.get(user=user, account_name=data['account'])
                    expense.save()
                elif data['type'] == "Income":
                    income = Income.objects.get(user=user, transaction=transaction_obj)
                    if data['account'] != income.deposited_account.account_name:
                        # Undo previous calculation
                        account = income.deposited_account
                        account.balance -= transaction_obj.total_amount
                        account.save()
                        # Update account balance
                        account = Account.objects.get(user=user, account_name=data['account'])
                        account.balance += Decimal(data['total_amount'])
                        account.save()
                    else:
                        # Undo previous calculation
                        income.deposited_account.balance -= transaction_obj.total_amount
                        # Update account balance
                        income.deposited_account.balance += Decimal(data['total_amount'])
                    # Update Income fields
                    category = IncomeCategory.objects.get(user=user, category_name=data['category'])
                    income.category = category
                    income.deposited_account = Account.objects.get(user=user, account_name=data['account'])
                    income.save()
                elif data['type'] == "Transfer":
                    pass
                else:
                    raise InvalidTransactionTypeError(f"Invalid transaction type received: %s".format(data['type']))
                
                # Update transaction field
                transaction_obj.title = data['title']
                transaction_obj.date = data['date']
                transaction_obj.total_amount = data['total_amount']
                transaction_obj.save() # update the object in the database
            return JsonResponse({"status": "success"})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)
    elif request.method == 'DELETE':
        try:
            user = request.user
            data = request.data
            print(data)
            transaction_obj = Transaction.objects.get(id=id)
            # TODO: udpate account balance
            with transaction.atomic():
                if data['type'] == "Expense":
                    expense = Expense.objects.get(user=user, transaction=transaction_obj)
                    expense.withdrawed_account.balance += transaction_obj.total_amount
                    expense.withdrawed_account.save()
                    expense.delete()
                elif data['type'] == "Income":
                    income = Income.objects.get(user=user, transaction=transaction_obj)
                    income.deposited_account.balance -= transaction_obj.total_amount
                    income.deposited_account.save()
                    income.delete()
                elif data['type'] == "Transfer":
                    pass
                else:
                    raise InvalidTransactionTypeError(f'Invalid transaction type received: %s' % (data['type']))
                transaction_obj.delete() # update the object in the database
            return JsonResponse({"status": "success"})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def account_api(request):
    if request.method == "GET":
        try:
            user = request.user
            accounts = user.accounts.all()
            serializer = AccountSerializer(accounts, many=True)
            serialized_data = serializer.data
            print(serialized_data)
            return JsonResponse({"data": serialized_data})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)
    elif request.method == "POST":
        try:
            user = request.user
            data = json.loads(request.body)
            account_obj = Account(user=user, account_name=data['account_name'], balance=data['balance'])
            account_obj.save()
            return JsonResponse({"status": "success"})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def account_id_api(request, id):
    if request.method == "GET":
        try:
            user = request.user
            account = user.accounts.get(pk=id)
            print(account)
            expenses = account.acc_expense.all().order_by('transaction__date')
            incomes = account.acc_income.all().order_by('transaction__date')
            acc_serializer = AccountSerializer(account)
            acc_serialized_data = acc_serializer.data
            exp_serializer = ExpenseSerializer(expenses, many=True)
            exp_serialized_data = exp_serializer.data
            inc_serializer = IncomeSerializer(incomes, many=True)
            inc_serialized_data = inc_serializer.data
            user = request.user
            exp_categories = list(user.expense_category.all().values_list('category_name', flat=True))
            inc_categories = list(user.income_category.all().values_list('category_name', flat=True))
            trn_categories = list(user.transfer_category.all().values_list('category_name', flat=True))
            accounts = list(user.accounts.all().values_list('account_name', flat=True))
            return JsonResponse({
                "data": {
                    "account": acc_serialized_data,
                    "expenses": exp_serialized_data,
                    "incomes": inc_serialized_data,
                    'expense_categories': exp_categories,
                    'income_categories':inc_categories,
                    'transfer_categories': trn_categories,
                    'accounts': accounts,
                }
            })
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)
    elif request.method == "PUT":
        try:
            user = request.user
            data = json.loads(request.body)
            account = user.accounts.get(pk=id)
            account.account_name = data['account_name']
            account.balance = data['balance']
            account.save()
            return JsonResponse({"status": "success"})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)
    elif request.method == "DELETE":
        try:
            user = request.user
            account = user.accounts.get(pk=id)
            print(account)
            account.delete()
            return JsonResponse({"status": "success"})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)
