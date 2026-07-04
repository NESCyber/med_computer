from django.urls import path
from . import api

app_name = 'products_api'

urlpatterns = [
    path('', api.api_products, name='products_list'),
    path('categories/', api.api_categories, name='categories_list'),
    path('active-ad/', api.api_active_ad, name='active_ad'),
    path('settings/', api.api_site_settings, name='site_settings'),
    path('<slug:slug>/', api.api_product_detail, name='product_detail'),
    path('<slug:slug>/review/', api.api_post_review, name='post_review'),
]
