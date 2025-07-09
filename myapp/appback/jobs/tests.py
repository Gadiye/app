from django.test import TestCase
from jobs.models import Job, JobItem
from products.models import Product
from artisans.models import Artisan

class ArtisanSpecialtyTest(TestCase):
    def setUp(self):
        # Create or get a product with a valid service_category
        self.product = Product.objects.create(
            product_type="TestType",
            animal_type="TestAnimal",
            service_category="Plumbing",
            size_category="MEDIUM",
            base_price=10.0,
            is_active=True,
            last_price_update="2025-07-08T00:00:00Z"
        )
        self.artisan = Artisan.objects.create(name="Test Artisan")

    def test_specialties_includes_product_service_category(self):
        job = Job.objects.create(
            created_by="Test User",
            service_category=self.product.service_category,
            status="IN_PROGRESS"
        )
        job_item = JobItem.objects.create(
            job=job,
            artisan=self.artisan,
            product=self.product,
            quantity_ordered=10
        )
        self.assertIn(self.product.service_category, self.artisan.specialties)