from django.urls import path
from . import api

app_name = 'accounts_api'

urlpatterns = [
    path('register/', api.api_register, name='register'),
    path('login/', api.api_login, name='login'),
    path('user/', api.api_user_detail, name='user'),
]
