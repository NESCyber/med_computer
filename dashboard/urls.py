from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.home, name='home'),
    
    # Product CRUD URLs
    path('products/', views.product_list, name='product_list'),
    path('products/create/', views.product_create, name='product_create'),
    path('products/<int:pk>/edit/', views.product_edit, name='product_edit'),
    path('products/<int:pk>/delete/', views.product_delete, name='product_delete'),
    
    # Category CRUD URLs
    path('categories/', views.category_list, name='category_list'),
    path('categories/create/', views.category_create, name='category_create'),
    path('categories/<int:pk>/edit/', views.category_edit, name='category_edit'),
    path('categories/<int:pk>/delete/', views.category_delete, name='category_delete'),
    
    # Order Fulfillment URLs
    path('orders/', views.admin_order_list, name='admin_order_list'),
    path('orders/<int:order_id>/', views.admin_order_detail, name='admin_order_detail'),
    path('orders/<int:order_id>/status/', views.admin_order_status_update, name='admin_order_status_update'),
    
    # Reviews Management
    path('reviews/', views.review_list, name='review_list'),
    path('reviews/<int:pk>/delete/', views.review_delete, name='review_delete'),
    
    # Store Configuration Settings
    path('settings/', views.site_settings_edit, name='site_settings_edit'),
]
