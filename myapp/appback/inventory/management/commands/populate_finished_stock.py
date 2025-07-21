from django.core.management.base import BaseCommand
from inventory.models import FinishedStock
from products.models import Product
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Populates the database with sample FinishedStock data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Populating FinishedStock data...'))

        # Clear existing data to avoid duplicates on re-run
        FinishedStock.objects.all().delete()

        products = Product.objects.all()
        if not products.exists():
            self.stdout.write(self.style.WARNING('No products found. Please create some products first.'))
            return

        for product in products:
            quantity = random.randint(10, 100)
            average_cost = Decimal(random.uniform(5.0, 50.0)).quantize(Decimal('0.01'))
            
            FinishedStock.objects.create(
                product=product,
                quantity=quantity,
                average_cost=average_cost
            )
            self.stdout.write(self.style.SUCCESS(f'Created FinishedStock for {product.product_type} - {product.animal_type} (Qty: {quantity}, Cost: {average_cost})'))
        
        self.stdout.write(self.style.SUCCESS('FinishedStock population complete.'))
