from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Category, Product, Review, ProductImage, Advertisement, SiteSetting
from orders.models import Order

@api_view(['GET'])
@permission_classes([AllowAny])
def api_categories(request):
    categories = Category.objects.all()
    data = [{
        'id': cat.id,
        'name': cat.name,
        'slug': cat.slug,
        'description': cat.description
    } for cat in categories]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_products(request):
    products = Product.objects.filter(is_active=True).prefetch_related('images')
    
    # Search filter
    q = request.GET.get('q', '').strip()
    if q:
        products = products.filter(Q(name__icontains=q) | Q(description__icontains=q))
        
    # Category filter
    category_slug = request.GET.get('category')
    if category_slug:
        products = products.filter(category__slug=category_slug)
        
    data = []
    for prod in products:
        # Get featured or first image url
        featured_image = prod.images.filter(is_featured=True).first() or prod.images.first()
        image_url = featured_image.image.url if featured_image else None
        
        data.append({
            'id': prod.id,
            'name': prod.name,
            'description': prod.description,
            'slug': prod.slug,
            'price': float(prod.price),
            'stock': prod.stock,
            'average_rating': prod.average_rating,
            'image': image_url
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_product_detail(request, slug):
    try:
        product = Product.objects.prefetch_related('images', 'reviews__user').get(slug=slug, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    # All images
    images = [img.image.url for img in product.images.all()]
    
    # Reviews
    reviews_data = [{
        'id': rev.id,
        'username': rev.user.username,
        'first_name': rev.user.first_name,
        'rating': rev.rating,
        'comment': rev.comment,
        'created_at': rev.created_at.strftime('%Y-%m-%d %H:%M')
    } for rev in product.reviews.all()]
    
    # Verification check (for current authenticated user)
    is_verified_buyer = False
    has_reviewed = False
    if request.user.is_authenticated:
        is_verified_buyer = Order.objects.filter(
            user=request.user,
            status__in=[Order.STATUS_PAID, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED],
            items__product=product
        ).exists()
        has_reviewed = product.reviews.filter(user=request.user).exists()
        
    data = {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'slug': product.slug,
        'price': float(product.price),
        'stock': product.stock,
        'average_rating': product.average_rating,
        'images': images,
        'reviews': reviews_data,
        'is_verified_buyer': is_verified_buyer,
        'has_reviewed': has_reviewed
    }
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_post_review(request, slug):
    try:
        product = Product.objects.get(slug=slug, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    # Check if verified buyer
    is_verified_buyer = Order.objects.filter(
        user=request.user,
        status__in=[Order.STATUS_PAID, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED],
        items__product=product
    ).exists()
    
    if not is_verified_buyer:
        return Response({'error': 'Only verified buyers can review products.'}, status=status.HTTP_403_FORBIDDEN)
        
    if product.reviews.filter(user=request.user).exists():
        return Response({'error': 'You have already reviewed this product.'}, status=status.HTTP_400_BAD_REQUEST)
        
    rating = request.data.get('rating')
    comment = request.data.get('comment', '').strip()
    
    if not rating:
        return Response({'error': 'Rating is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            raise ValueError
    except ValueError:
        return Response({'error': 'Rating must be an integer between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)
        
    review = Review.objects.create(
        product=product,
        user=request.user,
        rating=rating,
        comment=comment
    )
    
    return Response({
        'id': review.id,
        'username': review.user.username,
        'first_name': review.user.first_name,
        'rating': review.rating,
        'comment': review.comment,
        'created_at': review.created_at.strftime('%Y-%m-%d %H:%M')
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_active_ad(request):
    ad = Advertisement.objects.filter(is_active=True).order_by('-created_at').first()
    if not ad:
        return Response(None, status=status.HTTP_200_OK)
    return Response({
        'id': ad.id,
        'title': ad.title,
        'image': ad.image.url,
        'link': ad.link
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_site_settings(request):
    settings = SiteSetting.get_settings()
    return Response({
        'store_name': settings.store_name,
        'location': settings.location,
        'phone_1': settings.phone_1,
        'phone_2': settings.phone_2,
        'whatsapp_number': settings.whatsapp_number,
        'momo_number': settings.momo_number,
        'momo_name': settings.momo_name,
    })
