from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from .forms import CustomUserCreationForm

def register(request):
    if request.user.is_authenticated:
        return redirect('products:catalog')
    
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to MED Computers, {user.first_name}!")
            return redirect('products:catalog')
        else:
            messages.error(request, "Registration failed. Please verify your inputs.")
    else:
        form = CustomUserCreationForm()
        
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        if request.user.is_admin():
            return redirect('dashboard:home')
        return redirect('products:catalog')
        
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                if user.is_admin():
                    messages.success(request, f"Welcome Admin, {user.first_name}!")
                    return redirect('dashboard:home')
                else:
                    messages.success(request, f"Logged in successfully. Welcome back!")
                    return redirect('products:catalog')
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid login credentials.")
    else:
        form = AuthenticationForm()
        
    return render(request, 'accounts/login.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('products:catalog')

