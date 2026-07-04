from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q
from .models import Category, Product, Review
from .forms import ReviewForm
from orders.models import Order

def catalog(request):
    products = Product.objects.filter(is_active=True).prefetch_related('images')
    categories = Category.objects.all()
    
    query = request.GET.get('q', '').strip()
    if query:
        products = products.filter(Q(name__icontains=query) | Q(description__icontains=query))
        
    category_slug = request.GET.get('category')
    current_category = None
    if category_slug:
        current_category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=current_category)
        
    return render(request, 'products/catalog.html', {
        'products': products,
        'categories': categories,
        'current_category': current_category,
        'query': query,
    })

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    reviews = product.reviews.all().select_related('user')
    
    is_verified_buyer = False
    has_reviewed = False
    form = None
    
    if request.user.is_authenticated:
        # Check if they have an order containing this product that is paid/shipped/delivered
        is_verified_buyer = Order.objects.filter(
            user=request.user, 
            status__in=[Order.STATUS_PAID, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED], 
            items__product=product
        ).exists()
        
        has_reviewed = Review.objects.filter(product=product, user=request.user).exists()
        
        if is_verified_buyer and not has_reviewed:
            if request.method == 'POST':
                form = ReviewForm(request.POST)
                if form.is_valid():
                    review = form.save(commit=False)
                    review.product = product
                    review.user = request.user
                    review.save()
                    from django.contrib import messages
                    messages.success(request, "Your review has been posted successfully! Thank you for your feedback.")
                    return redirect('products:product_detail', slug=product.slug)
            else:
                form = ReviewForm()
                
    return render(request, 'products/detail.html', {
        'product': product,
        'reviews': reviews,
        'is_verified_buyer': is_verified_buyer,
        'has_reviewed': has_reviewed,
        'form': form
    })


