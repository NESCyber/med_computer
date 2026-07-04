from django import forms
from .models import Category, Product, ProductImage, Review

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ('name', 'description')
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ('category', 'name', 'description', 'price', 'stock', 'is_active')
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }

class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ('image', 'is_featured')


class ReviewForm(forms.ModelForm):
    RATING_CHOICES = [(i, f"{i} Star{'s' if i > 1 else ''}") for i in range(5, 0, -1)]
    rating = forms.ChoiceField(choices=RATING_CHOICES, widget=forms.Select(attrs={'class': 'form-control'}))

    class Meta:
        model = Review
        fields = ('rating', 'comment')
        widgets = {
            'comment': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Write your verified purchase review here...'}),
        }
