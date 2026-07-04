from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from products.models import Product
from .models import Order, OrderItem
from django.core.mail import send_mail

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_orders_list(request):
    orders = Order.objects.filter(user=request.user)
    data = [{
        'id': order.id,
        'status': order.status,
        'total_price': float(order.total_price),
        'shipping_address': order.shipping_address,
        'billing_address': order.billing_address,
        'created_at': order.created_at.strftime('%Y-%m-%d %H:%M')
    } for order in orders]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_order_detail(request, order_id):
    try:
        order = Order.objects.prefetch_related('items__product__images').get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    items = [{
        'id': item.id,
        'product_id': item.product.id,
        'product_name': item.product.name,
        'product_slug': item.product.slug,
        'price': float(item.price),
        'quantity': item.quantity,
        'cost': float(item.get_cost()),
        'image': item.product.images.first().image.url if item.product.images.exists() else None
    } for item in order.items.all()]
    
    data = {
        'id': order.id,
        'status': order.status,
        'total_price': float(order.total_price),
        'shipping_address': order.shipping_address,
        'billing_address': order.billing_address,
        'payment_reference': order.payment_reference,
        'payment_network': order.payment_network,
        'payment_network_display': order.get_payment_network_display() if order.payment_network else None,
        'payment_receipt': order.payment_receipt.url if order.payment_receipt else None,
        'payment_submitted_at': order.payment_submitted_at.strftime('%Y-%m-%d %H:%M') if order.payment_submitted_at else None,
        'created_at': order.created_at.strftime('%Y-%m-%d %H:%M')
    }
    return Response({'order': data, 'items': items})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_order_create(request):
    data = request.data
    shipping_address = data.get('shipping_address', '').strip()
    billing_address = data.get('billing_address', '').strip()
    items_data = data.get('items', []) # expect array of {'product_id': X, 'quantity': Y}
    
    if not shipping_address or not billing_address:
        return Response({'error': 'Shipping and billing addresses are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if not items_data:
        return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        with transaction.atomic():
            # 1. Double check stock limits first and compute total
            total_price = 0
            verified_items = []
            
            for item in items_data:
                product_id = item.get('product_id')
                quantity = int(item.get('quantity', 1))
                
                # Lock row in database
                try:
                    product = Product.objects.select_for_update().get(id=product_id, is_active=True)
                except Product.DoesNotExist:
                    raise ValueError(f"Product ID {product_id} is not available in catalog.")
                    
                if quantity > product.stock:
                    raise ValueError(f"Insufficient stock for '{product.name}'. Only {product.stock} items remaining.")
                    
                total_price += product.price * quantity
                verified_items.append((product, quantity))
                
            # 2. Create order header
            order = Order.objects.create(
                user=request.user,
                total_price=total_price,
                shipping_address=shipping_address,
                billing_address=billing_address
            )
            
            # 3. Create items and decrement stock
            for product, quantity in verified_items:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    price=product.price,
                    quantity=quantity
                )
                product.stock -= quantity
                product.save()
                
            # 4. Trigger order confirmation email alert
            subject = f"MED Computers - Order #{order.id} Placed successfully"
            message = (
                f"Hello {request.user.first_name or request.user.username},\n\n"
                f"Your order #{order.id} has been submitted successfully.\n"
                f"Grand Total: GH₵{order.total_price}\n\n"
                f"Manual Payment Required:\n"
                f"Please call our billing desk at +233 54 912 8355 or submit your payment reference details on our website to complete processing.\n\n"
                f"Thank you for shopping with us!\n"
                f"MED Computers & Tech Hub"
            )
            try:
                send_mail(subject, message, 'billing@medcomputers.com', [request.user.email])
            except Exception:
                pass
                
        return Response({
            'message': 'Order placed successfully.',
            'order_id': order.id,
            'total_price': float(order.total_price)
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'An error occurred while creating your order. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_order_confirm_payment(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    payment_network = request.data.get('payment_network')
    payment_reference = request.data.get('payment_reference', '').strip()
    payment_receipt = request.FILES.get('payment_receipt')
    
    if not payment_network or not payment_reference:
        return Response({'error': 'Payment network and reference ID are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    # Check if network is a valid choice
    valid_networks = [network[0] for network in Order.NETWORK_CHOICES]
    if payment_network not in valid_networks:
        return Response({'error': 'Invalid payment network choice.'}, status=status.HTTP_400_BAD_REQUEST)
        
    order.payment_network = payment_network
    order.payment_reference = payment_reference
    if payment_receipt:
        order.payment_receipt = payment_receipt
    order.payment_submitted_at = timezone.now()
    order.save()
    
    # Send email notification about receipt submission
    subject = f"MED Computers - Payment Confirmation Submitted (Order #{order.id})"
    message = (
        f"Hello {request.user.first_name or request.user.username},\n\n"
        f"We have received your payment reference details (Network: {order.get_payment_network_display()}, Ref: {order.payment_reference}) for Order #{order.id}.\n"
        f"Our team is verifying the transfer and will update your order status shortly.\n\n"
        f"Best regards,\n"
        f"MED Computers & Tech Hub"
    )
    try:
        send_mail(subject, message, 'billing@medcomputers.com', [request.user.email])
    except Exception:
        pass
        
    return Response({'message': 'Payment confirmation details submitted successfully.'})
