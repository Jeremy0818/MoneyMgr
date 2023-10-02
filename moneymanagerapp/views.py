from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.db import IntegrityError
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

import json

from .utils import ocr
from .serializers import CustomUserSerializer

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
        response_data['expense_categories'] = exp_categories
        response_data['income_categories'] = inc_categories
        response_data['transfer_categories'] = trn_categories
        response_data['accounts'] = accounts
        return JsonResponse(response_data)

    except Exception as e:
        print(e)
        return JsonResponse({'error': str(e)}, status=500)
