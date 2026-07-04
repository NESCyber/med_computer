from django.urls import path
from . import api

app_name = 'orders_api'

urlpatterns = [
    path('', api.api_orders_list, name='orders_list'),
    path('create/', api.api_order_create, name='order_create'),
    path('<int:order_id>/', api.api_order_detail, name='order_detail'),
    path('<int:order_id>/confirm/', api.api_order_confirm_payment, name='order_confirm_payment'),
]
