import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Category, Product

def seed_products():
    print("Beginning product catalog database seeding...")
    
    # Grab categories (ensure they exist)
    categories = {
        'Laptops': Category.objects.filter(name='Laptops').first(),
        'Desktops': Category.objects.filter(name='Desktops').first(),
        'Accessories': Category.objects.filter(name='Accessories').first(),
        'Components': Category.objects.filter(name='Components').first(),
        'Monitors': Category.objects.filter(name='Monitors').first(),
    }

    # If categories are missing, create defaults
    for name, cat in categories.items():
        if not cat:
            categories[name] = Category.objects.create(
                name=name,
                description=f"High-quality {name.lower()} retail configurations."
            )
            print(f"Created category: {name}")

    product_data = [
        # Laptops
        {
            'category': 'Laptops',
            'name': 'HP EliteBook 840 G8',
            'price': 12500.00,
            'stock': 8,
            'description': (
                "Processor: Intel Core i7-1185G7 (11th Gen)\n"
                "Memory: 16 GB DDR4 SDRAM\n"
                "Storage: 512 GB PCIe NVMe SSD\n"
                "Display: 14-inch Full HD (1920x1080) Anti-glare\n"
                "Graphics: Intel Iris Xe Graphics\n"
                "OS: Windows 11 Pro\n"
                "Connectivity: Intel Wi-Fi 6, Bluetooth 5.0\n"
                "Security: Fingerprint reader, TPM 2.0"
            )
        },
        {
            'category': 'Laptops',
            'name': 'MacBook Pro 16" M2 Max',
            'price': 38000.00,
            'stock': 3,
            'description': (
                "Processor: Apple M2 Max chip with 12-core CPU and 38-core GPU\n"
                "Memory: 32 GB Unified Memory\n"
                "Storage: 1 TB Superfast SSD\n"
                "Display: 16.2-inch Liquid Retina XDR screen (3456x2234)\n"
                "OS: macOS Ventura (Upgrade available)\n"
                "Battery: Up to 22 hours runtime\n"
                "Ports: 3x Thunderbolt 4, HDMI, SDXC slot, MagSafe 3"
            )
        },
        {
            'category': 'Laptops',
            'name': 'Lenovo ThinkPad X1 Carbon Gen 10',
            'price': 16500.00,
            'stock': 5,
            'description': (
                "Processor: Intel Core i7-1260P (12th Gen vPro)\n"
                "Memory: 16 GB LPDDR5\n"
                "Storage: 512 GB SSD PCIe Gen 4\n"
                "Display: 14-inch WUXGA (1920x1200) IPS Low Blue Light\n"
                "Chassis: Carbon-fiber weave top cover, magnesium alloy bottom\n"
                "OS: Windows 11 Pro\n"
                "Security: IR Camera, Fingerprint sensor, dTPM 2.0"
            )
        },
        {
            'category': 'Laptops',
            'name': 'ASUS ROG Zephyrus G14 Gaming',
            'price': 22000.00,
            'stock': 4,
            'description': (
                "Processor: AMD Ryzen 9 7940HS (8 Cores, 16 Threads)\n"
                "Graphics: NVIDIA GeForce RTX 4060 8GB GDDR6 Dedicated\n"
                "Memory: 16 GB DDR5 4800MHz Dual Channel\n"
                "Storage: 1 TB PCIe 4.0 NVMe SSD\n"
                "Display: 14-inch QHD+ (2560x1600) 165Hz IPS Rog Nebula\n"
                "Weight: 1.72 kg (Ultraportable gaming)"
            )
        },
        
        # Desktops
        {
            'category': 'Desktops',
            'name': 'MED Titan Custom Gaming Tower',
            'price': 42500.00,
            'stock': 2,
            'description': (
                "Processor: Intel Core i9-13900K liquid cooled\n"
                "Graphics: NVIDIA GeForce RTX 4080 16GB GDDR6X\n"
                "Memory: 32 GB Corsair Vengeance RGB DDR5 6000MHz\n"
                "Storage: 2 TB Samsung 990 Pro Gen4 SSD\n"
                "Power Supply: Corsair RM1000x 1000W 80+ Gold\n"
                "Case: Lian Li O11 Dynamic EVO Glass Custom Tower\n"
                "Cooling: Custom water loop design with RGB radiator fans"
            )
        },
        {
            'category': 'Desktops',
            'name': 'Dell OptiPlex 7000 Micro',
            'price': 6800.00,
            'stock': 12,
            'description': (
                "Processor: Intel Core i5-12500T (6 Cores)\n"
                "Memory: 8 GB DDR4 RAM\n"
                "Storage: 256 GB NVMe PCIe M.2 SSD\n"
                "Graphics: Intel UHD Graphics 770\n"
                "Chassis: Ultra-small form factor (Micro)\n"
                "OS: Windows 11 Pro\n"
                "Includes: Dell Wired Keyboard & Mouse bundle"
            )
        },
        {
            'category': 'Desktops',
            'name': 'HP Pavilion All-in-One PC',
            'price': 11200.00,
            'stock': 6,
            'description': (
                "Processor: AMD Ryzen 7 5700U\n"
                "Memory: 16 GB DDR4 RAM\n"
                "Storage: 512 GB PCIe NVMe M.2 SSD + 1 TB SATA HDD\n"
                "Display: 27-inch diagonal Full HD micro-edge IPS touchscreen\n"
                "OS: Windows 11 Home\n"
                "Features: Pop-up 5MP IR Privacy Camera, Bang & Olufsen audio"
            )
        },

        # Accessories
        {
            'category': 'Accessories',
            'name': 'Logitech MX Master 3S Mouse',
            'price': 1200.00,
            'stock': 25,
            'description': (
                "Tracking: 8K DPI track-on-glass sensor\n"
                "Scroll: MagSpeed Electromagnetic scrolling wheels\n"
                "Switches: Quiet clicks tactile response\n"
                "Battery: Rechargeable USB-C, up to 70 days capacity\n"
                "Connectivity: Bluetooth & Logi Bolt USB Receiver\n"
                "Design: Ergonomic shape sculpted for palm support"
            )
        },
        {
            'category': 'Accessories',
            'name': 'Keychron K2 Mechanical Keyboard',
            'price': 1500.00,
            'stock': 15,
            'description': (
                "Layout: 75% Compact layout mechanical keyboard\n"
                "Switches: Gateron G Pro Hot-Swappable Brown switches\n"
                "Backlight: RGB Backlit aluminum frame\n"
                "Connectivity: Bluetooth wireless / Type-C wired\n"
                "Battery: 4000mAh capacity\n"
                "OS Support: macOS & Windows dedicated layouts included"
            )
        },
        {
            'category': 'Accessories',
            'name': 'Razer BlackShark V2 Pro Headset',
            'price': 1800.00,
            'stock': 10,
            'description': (
                "Drivers: Razer TriForce Titanium 50mm Drivers\n"
                "Microphone: HyperClear Super Wideband Mic\n"
                "Wireless: Razer HyperSpeed 2.4GHz Wireless technology\n"
                "Sound: THX Spatial Audio 7.1 surround profiles\n"
                "Earpads: FlowKnit ultra-soft memory foam cushion\n"
                "Battery: Up to 70 hours lifespan"
            )
        },

        # Components
        {
            'category': 'Components',
            'name': 'NVIDIA GeForce RTX 4070 Ti GPU',
            'price': 11500.00,
            'stock': 4,
            'description': (
                "Architecture: NVIDIA Ada Lovelace architecture\n"
                "VRAM: 12 GB GDDR6X 192-bit Memory\n"
                "Cores: 7680 CUDA Cores\n"
                "Speed: Boost Clock 2.61 GHz\n"
                "Ray Tracing: 3rd Gen RT Cores, DLSS 3 support\n"
                "Output: 3x DisplayPort 1.4a, 1x HDMI 2.1a"
            )
        },
        {
            'category': 'Components',
            'name': 'Samsung 990 Pro SSD 2TB',
            'price': 2200.00,
            'stock': 30,
            'description': (
                "Form Factor: M.2 NVMe (2280)\n"
                "Interface: PCIe Gen 4.0 x4\n"
                "Read Speed: Up to 7450 MB/s sequential read\n"
                "Write Speed: Up to 6900 MB/s sequential write\n"
                "Controller: Samsung in-house controller\n"
                "Heatsink: Dynamic Thermal Guard design (nickel plated)"
            )
        },

        # Monitors
        {
            'category': 'Monitors',
            'name': 'ASUS TUF Gaming 27" 165Hz Monitor',
            'price': 4500.00,
            'stock': 7,
            'description': (
                "Display Size: 27-inch widescreen\n"
                "Resolution: WQHD (2560x1440) IPS panel\n"
                "Refresh Rate: 165Hz rapid refresh rate\n"
                "Response Time: 1ms MPRT response\n"
                "Sync Tech: NVIDIA G-Sync compatible, FreeSync Premium\n"
                "Inputs: 2x HDMI 2.0, 1x DisplayPort 1.2"
            )
        },
        {
            'category': 'Monitors',
            'name': 'LG UltraFine 32" 4K Ergo Display',
            'price': 8900.00,
            'stock': 4,
            'description': (
                "Display Size: 31.5-inch widescreen\n"
                "Resolution: UHD 4K (3840x2160) IPS panel\n"
                "Color: DCI-P3 95% color spectrum, HDR10\n"
                "Stand: Ergonomic C-Clamp arm mount (extend/retract/swivel)\n"
                "Ports: USB Type-C (60W power delivery), 2x HDMI, 1x DisplayPort"
            )
        }
    ]

    for p_info in product_data:
        cat_obj = categories[p_info['category']]
        product, created = Product.objects.get_or_create(
            name=p_info['name'],
            category=cat_obj,
            defaults={
                'price': p_info['price'],
                'stock': p_info['stock'],
                'description': p_info['description'],
                'is_active': True
            }
        )
        if created:
            print(f"Created product: {product.name} (Category: {p_info['category']})")
        else:
            print(f"Product already exists: {product.name}")

    print("Product catalog database seeding completed successfully.")

if __name__ == '__main__':
    seed_products()
