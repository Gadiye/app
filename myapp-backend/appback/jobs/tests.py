from django.test import TestCase

# Create your tests here.
from jobs.models import Job, JobItem
from products.models import Product
artisan = Artisan.objects.get(id=<artisan_id>)
product = Product.objects.get(id=<product_id>)  # Ensure product exists with a valid service_category
job = Job.objects.create(
    created_by="Test User",
    service_category=product.service_category,  # e.g., "Plumbing"
    status="IN_PROGRESS"
)
job_item = JobItem.objects.create(
    job=job,
    artisan=artisan,
    product=product,
    quantity_ordered=10
)
print(artisan.specialties)  # Should include product.service_category, e.g., ["Plumbing"]