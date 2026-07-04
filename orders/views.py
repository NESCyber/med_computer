from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from products.models import Product
from .cart import Cart
from .models import Order, OrderItem
from .forms import OrderCreateForm, PaymentConfirmationForm
from django.core.mail import send_mail
from django.utils import timezone

@require_POST
def cart_add(request, product_id):
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    quantity = int(request.POST.get('quantity', 1))
    override = request.POST.get('override', 'False') == 'True'
    
    if quantity > product.stock:
        messages.error(request, f"Sorry, only {product.stock} items are available in stock.")
        return redirect('products:product_detail', slug=product.slug)
        
    cart.add(product=product, quantity=quantity, override_quantity=override)
    messages.success(request, f"Added '{product.name}' to your cart.")
    return redirect('orders:cart_detail')

def cart_remove(request, product_id):
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart.remove(product)
    messages.info(request, f"Removed '{product.name}' from your cart.")
    return redirect('orders:cart_detail')

def cart_detail(request):
    cart = Cart(request)
    return render(request, 'orders/cart_detail.html', {'cart': cart})

@login_required(login_url='accounts:login')
def order_create(request):
    cart = Cart(request)
    if not cart:
        messages.error(request, "Your cart is empty. Please add products before checking out.")
        return redirect('products:catalog')
        
    if request.method == 'POST':
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # 1. Double check stock limits for all items first
                    for item in cart:
                        product = item['product']
                        # Lock product row in database to prevent race conditions during checkout
                        product = Product.objects.select_for_update().get(id=product.id)
                        if item['quantity'] > product.stock:
                            raise ValueError(f"Insufficient stock for '{product.name}'. Only {product.stock} remaining.")
                    
                    # 2. Save order header
                    order = form.save(commit=False)
                    order.user = request.user
                    order.total_price = cart.get_total_price()
                    order.save()
                    
                    # 3. Save order items and decrement product stock
                    for item in cart:
                        product = item['product']
                        # Re-query locked row
                        product = Product.objects.select_for_update().get(id=product.id)
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            price=item['price'],
                            quantity=item['quantity']
                        )
                        product.stock -= item['quantity']
                        product.save()
                        
                    # 4. Clear shopping cart session
                    cart.clear()
                    
                    # 5. Send order confirmation email
                    subject = f"MED Computers - Order #{order.id} Placed successfully"
                    message = (
                        f"Hello {request.user.first_name or request.user.username},\n\n"
                        f"Your order #{order.id} has been submitted successfully.\n"
                        f"Grand Total: GH₵{order.total_price}\n\n"
                        f"Manual Payment Required:\n"
                        f"Please call our billing desk at +233 54 912 8355 or submit your transaction reference "
                        f"details on the order tracking page to complete processing.\n\n"
                        f"Thank you for shopping with us!\n"
                        f"MED Computers & Tech Hub"
                    )
                    try:
                        send_mail(subject, message, 'billing@medcomputers.com', [request.user.email])
                    except Exception:
                        pass
                    
                messages.success(request, f"Order #{order.id} placed successfully! Thank you for shopping with us.")
                return redirect('orders:order_detail', order_id=order.id)
                
            except ValueError as e:
                messages.error(request, str(e))
                return redirect('orders:cart_detail')
            except Exception as e:
                messages.error(request, "An error occurred while placing your order. Please try again.")
                return redirect('orders:cart_detail')
        else:
            messages.error(request, "Failed to submit checkout details. Please verify your inputs.")
    else:
        # Pre-populate checkout address from user profile defaults
        form = OrderCreateForm(initial={
            'shipping_address': request.user.address,
            'billing_address': request.user.address
        })
        
    return render(request, 'orders/order_create.html', {'cart': cart, 'form': form})

@login_required(login_url='accounts:login')
def order_list(request):
    orders = Order.objects.filter(user=request.user)
    return render(request, 'orders/order_list.html', {'orders': orders})

@login_required(login_url='accounts:login')
def order_detail(request, order_id):
    order = get_object_or_404(Order.objects.prefetch_related('items__product__images'), id=order_id, user=request.user)
    if request.method == 'POST':
        form = PaymentConfirmationForm(request.POST, request.FILES, instance=order)
        if form.is_valid():
            order = form.save(commit=False)
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
                
            messages.success(request, "Payment reference and receipt screenshot submitted successfully! Our billing desk will verify it shortly.")
            return redirect('orders:order_detail', order_id=order.id)
        else:
            messages.error(request, "Failed to submit payment confirmation. Please check your inputs.")
    else:
        form = PaymentConfirmationForm(instance=order)
        
    return render(request, 'orders/order_detail.html', {'order': order, 'form': form})


