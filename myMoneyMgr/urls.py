"""
URL configuration for myMoneyMgr project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import RedirectView
from moneymanagerapp.views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Manifest url
    path('manifest.json', Manifest.as_view(content_type='application/json'), name='manifest'),
    path('admin/', admin.site.urls),
    
    # API urls
    path('api/get-csrf-token/', get_csrf_token_api, name='get-csrf-token'),
    path('api/get-user/', get_user_api, name='get-user'),
    path('api/login/', login_api, name='api-login'),
    path('api/logout/', logout_api, name='api-logout'),
    path('api/ocr/', ocr_api, name='api-ocr'),
    path('api/register/', register_api, name='api-register'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
    path('api/transaction/', transaction_api, name='api-transaction'),
    path('api/account/', account_api, name='api-account'),
    
    # Views urls
    path('', Index.as_view(), name='index'),
    # Redirect the root URL to the 'index' view
    # path('', RedirectView.as_view(pattern_name='index', permanent=False), name='root'),
    re_path(r'^(?:.*)/?$', Index.as_view()) # this has to be the last one
]
