from products.models import Product

def low_stock_alert_context(request):
    """
    Context processor to return the count of products that are running low on stock (<= 5 items).
    """
    try:
        count = Product.objects.filter(stock__lte=5, is_active=True).count()
    except Exception:
        count = 0
    return {
        'low_stock_count': count
    }
