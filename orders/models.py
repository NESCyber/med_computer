from django.db import models
from django.conf import settings
from products.models import Product

class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_SHIPPED = 'shipped'
    STATUS_DELIVERED = 'delivered'
    
    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID, 'Paid'),
        (STATUS_SHIPPED, 'Shipped'),
        (STATUS_DELIVERED, 'Delivered'),
    )
    
    NETWORK_CHOICES = (
        ('mtn', 'MTN Mobile Money'),
        ('telecel', 'Telecel Cash'),
        ('at', 'AT Money'),
        ('bank', 'Bank Transfer / GCB / EcoBank'),
        ('other', 'Other manual payment option'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    billing_address = models.TextField()
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    payment_network = models.CharField(max_length=50, choices=NETWORK_CHOICES, blank=True, null=True)
    payment_receipt = models.ImageField(upload_to='receipts/%Y/%m/%d/', blank=True, null=True)
    payment_submitted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

    def get_total_cost(self):
        return sum(item.get_cost() for item in self.items.all())

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Item #{self.id} - Order #{self.order.id}"

    def get_cost(self):
        return self.price * self.quantity

