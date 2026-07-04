from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from accounts.decorators import admin_required
from products.models import Category, Product, ProductImage
from products.forms import CategoryForm, ProductForm
from orders.models import Order, OrderItem
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.core.mail import send_mail
import datetime

@admin_required
def home(request):
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_sales = Order.objects.aggregate(Sum('total_price'))['total_price__sum'] or 0.00
    low_stock_products = Product.objects.filter(stock__lte=5)
    recent_orders = Order.objects.order_by('-created_at')[:5]
    
    # Generate daily sales chart metrics (last 7 days)
    today = timezone.now().date()
    seven_days_ago = today - datetime.timedelta(days=6)
    daily_sales_query = Order.objects.filter(
        created_at__date__range=[seven_days_ago, today]
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        daily_sum=Sum('total_price')
    ).order_by('date')
    
    sales_data_dict = {(seven_days_ago + datetime.timedelta(days=i)).strftime('%Y-%m-%d'): 0.0 for i in range(7)}
    for entry in daily_sales_query:
        d_val = entry['date']
        if isinstance(d_val, datetime.date):
            d_str = d_val.strftime('%Y-%m-%d')
        elif isinstance(d_val, str):
            d_str = d_val[:10]  # Take YYYY-MM-DD prefix if full datetime string
        else:
            d_str = str(d_val)[:10]
            
        if d_str in sales_data_dict:
            sales_data_dict[d_str] = float(entry['daily_sum'] or 0.0)
            
    sales_dates = []
    for d_str in sales_data_dict.keys():
        d_obj = datetime.datetime.strptime(d_str, '%Y-%m-%d').date()
        sales_dates.append(d_obj.strftime('%b %d'))
        
    sales_amounts = list(sales_data_dict.values())
    
    # Generate category volume metrics (units sold per category)
    category_popularity = OrderItem.objects.values(
        'product__category__name'
    ).annotate(
        units_sold=Sum('quantity')
    ).order_by('-units_sold')
    
    cat_labels = [item['product__category__name'] or 'Uncategorized' for item in category_popularity]
    cat_counts = [int(item['units_sold'] or 0) for item in category_popularity]
    
    return render(request, 'dashboard/home.html', {
        'total_products': total_products,
        'total_orders': total_orders,
        'total_sales': total_sales,
        'low_stock_products': low_stock_products,
        'recent_orders': recent_orders,
        'sales_dates': sales_dates,
        'sales_amounts': sales_amounts,
        'cat_labels': cat_labels,
        'cat_counts': cat_counts,
    })

@admin_required
def admin_order_list(request):
    orders = Order.objects.all().select_related('user').order_by('-created_at')
    return render(request, 'dashboard/order_list.html', {'orders': orders})

@admin_required
def admin_order_status_update(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in [Order.STATUS_PENDING, Order.STATUS_PAID, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED]:
            order.status = new_status
            order.save()
            
            # Send status update email notification
            subject = f"MED Computers - Order #{order.id} Status Update"
            message = (
                f"Hello {order.user.first_name or order.user.username},\n\n"
                f"Your order #{order.id} status has been updated to '{order.status.upper()}'.\n\n"
                f"You can track your order live on the store page under the 'My Orders' section.\n\n"
                f"Best regards,\n"
                f"MED Computers & Tech Hub"
            )
            try:
                send_mail(subject, message, 'billing@medcomputers.com', [order.user.email])
            except Exception:
                pass
                
            messages.success(request, f"Order #{order.id} status updated to '{new_status.capitalize()}' and email notification sent!")
        else:
            messages.error(request, "Invalid status choice selected.")
    # Smart redirect back to the page they came from (list vs detail)
    referer = request.META.get('HTTP_REFERER')
    if referer and 'orders/' in referer and str(order.id) in referer:
        return redirect('dashboard:admin_order_detail', order_id=order.id)
    return redirect('dashboard:admin_order_list')


@admin_required
def product_list(request):
    products = Product.objects.all().select_related('category').prefetch_related('images')
    return render(request, 'dashboard/product_list.html', {'products': products})

@admin_required
def product_create(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            product = form.save()
            image_file = request.FILES.get('image')
            if image_file:
                ProductImage.objects.create(product=product, image=image_file, is_featured=True)
            messages.success(request, f"Product '{product.name}' created successfully!")
            return redirect('dashboard:product_list')
        else:
            messages.error(request, "Failed to create product. Check form details.")
    else:
        form = ProductForm()
    return render(request, 'dashboard/product_form.html', {'form': form, 'title': 'Add Product'})

@admin_required
def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            product = form.save()
            image_file = request.FILES.get('image')
            if image_file:
                ProductImage.objects.filter(product=product).update(is_featured=False)
                ProductImage.objects.create(product=product, image=image_file, is_featured=True)
            messages.success(request, f"Product '{product.name}' updated successfully!")
            return redirect('dashboard:product_list')
        else:
            messages.error(request, "Failed to update product. Check form details.")
    else:
        form = ProductForm(instance=product)
    return render(request, 'dashboard/product_form.html', {'form': form, 'product': product, 'title': 'Edit Product'})

@admin_required
def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.delete()
        messages.success(request, "Product deleted successfully!")
        return redirect('dashboard:product_list')
    return render(request, 'dashboard/confirm_delete.html', {'item': product, 'type': 'Product', 'cancel_url': 'dashboard:product_list'})

@admin_required
def category_list(request):
    categories = Category.objects.all()
    return render(request, 'dashboard/category_list.html', {'categories': categories})

@admin_required
def category_create(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            category = form.save()
            messages.success(request, f"Category '{category.name}' created successfully!")
            return redirect('dashboard:category_list')
        else:
            messages.error(request, "Failed to create category. Check form details.")
    else:
        form = CategoryForm()
    return render(request, 'dashboard/category_form.html', {'form': form, 'title': 'Add Category'})

@admin_required
def category_edit(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            category = form.save()
            messages.success(request, f"Category '{category.name}' updated successfully!")
            return redirect('dashboard:category_list')
        else:
            messages.error(request, "Failed to update category. Check form details.")
    else:
        form = CategoryForm(instance=category)
    return render(request, 'dashboard/category_form.html', {'form': form, 'category': category, 'title': 'Edit Category'})

@admin_required
def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        category.delete()
        messages.success(request, "Category deleted successfully!")
        return redirect('dashboard:category_list')
    return render(request, 'dashboard/confirm_delete.html', {'item': category, 'type': 'Category', 'cancel_url': 'dashboard:category_list'})


@admin_required
def admin_order_detail(request, order_id):
    order = get_object_or_404(Order.objects.prefetch_related('items__product__images'), id=order_id)
    return render(request, 'dashboard/order_detail.html', {'order': order})



