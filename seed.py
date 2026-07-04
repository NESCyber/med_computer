import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category

def seed_categories():
    categories = [
        {
            'name': 'Laptops',
            'description': 'Portable personal computers including notebooks, ultrabooks, and high-performance gaming laptops.'
        },
        {
            'name': 'Desktops',
            'description': 'Pre-built tower configurations, custom gaming computers, workstations, and all-in-one desktop PCs.'
        },
        {
            'name': 'Accessories',
            'description': 'Keyboards, mice, headsets, webcams, and other peripheral tech devices.'
        },
        {
            'name': 'Components',
            'description': 'Internal PC components including graphics cards (GPUs), processors (CPUs), RAM modules, and storage SSDs/HDDs.'
        },
        {
            'name': 'Monitors',
            'description': 'High-resolution displays, ultra-wide desktop screens, and high refresh-rate gaming monitors.'
        }
    ]
    
    print("Seeding database categories...")
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Created category: {category.name}")
        else:
            print(f"Category already exists: {category.name}")
            
    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed_categories()
