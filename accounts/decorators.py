from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps

def admin_required(view_func):
    """
    Decorator to restrict view access to authenticated admin users only.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Please log in to access this page.")
            return redirect('accounts:login')
        if not request.user.is_admin():
            messages.error(request, "You are not authorized to view this page.")
            return redirect('products:catalog')
        return view_func(request, *args, **kwargs)
    return _wrapped_view
