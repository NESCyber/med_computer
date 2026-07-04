from django import forms
from .models import Order

class OrderCreateForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ('shipping_address', 'billing_address')
        widgets = {
            'shipping_address': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Enter your shipping address...'}),
            'billing_address': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Enter your billing address...'}),
        }

class PaymentConfirmationForm(forms.ModelForm):
    NETWORK_CHOICES = (
        ('mtn', 'MTN Mobile Money'),
        ('telecel', 'Telecel Cash'),
        ('at', 'AT Money'),
        ('bank', 'Bank Transfer / GCB / EcoBank'),
        ('other', 'Other manual payment option'),
    )
    payment_network = forms.ChoiceField(choices=NETWORK_CHOICES, widget=forms.Select(attrs={'class': 'form-control'}))

    class Meta:
        model = Order
        fields = ('payment_network', 'payment_reference', 'payment_receipt')
        widgets = {
            'payment_reference': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Momo Txn ID or Bank Ref ID...'}),
            'payment_receipt': forms.FileInput(attrs={'class': 'form-control'}),
        }

