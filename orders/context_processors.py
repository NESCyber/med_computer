from .cart import Cart

def cart(request):
    """
    Template context processor to expose the cart instance in all rendering contexts.
    """
    return {'cart': Cart(request)}
