from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date, timedelta
from artisans.models import Artisan
from products.models import Product
from jobs.models import Job, JobItem, ServiceRate
from payslips.models import Payslip

class PayslipGenerationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.artisan = Artisan.objects.create(name="Test Artisan")
        self.product = Product.objects.create(
            product_type="TestType",
            animal_type="TestAnimal",
            size_category="MEDIUM",
            base_price=10.00,
            is_active=True,
        )
        self.service_rate = ServiceRate.objects.create(
            product=self.product,
            service_category="CARVING",
            rate_per_unit=5.00
        )
        self.job = Job.objects.create(
            created_by="Test User",
            service_category="CARVING",
            status="COMPLETED"
        )
        self.job_item = JobItem.objects.create(
            job=self.job,
            artisan=self.artisan,
            product=self.product,
            quantity_ordered=10,
            quantity_accepted=5,
            original_amount=50.00,
            final_payment=25.00, # 5 accepted * 5.00 rate
            payslip_generated=False
        )
        self.period_start = date.today() - timedelta(days=30)
        self.period_end = date.today()

    def test_generate_individual_payslip_success(self):
        url = reverse('payslip-generate')
        data = {
            "artisan_id": self.artisan.id,
            "period_start": self.period_start.strftime('%Y-%m-%d'),
            "period_end": self.period_end.strftime('%Y-%m-%d')
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payslip.objects.count(), 1)
        payslip = Payslip.objects.first()
        self.assertEqual(payslip.artisan, self.artisan)
        self.assertEqual(payslip.total_payment, self.job_item.final_payment)
        self.assertTrue(Payslip.objects.filter(id=payslip.id, pdf_file__isnull=False).exists())
        self.job_item.refresh_from_db()
        self.assertTrue(self.job_item.payslip_generated)

    def test_generate_individual_payslip_no_job_items(self):
        JobItem.objects.all().delete() # Remove existing job items
        url = reverse('payslip-generate')
        data = {
            "artisan_id": self.artisan.id,
            "period_start": self.period_start.strftime('%Y-%m-%d'),
            "period_end": self.period_end.strftime('%Y-%m-%d')
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Payslip.objects.count(), 0)

    def test_generate_bulk_payslip_success(self):
        # Create another artisan and job item for bulk generation
        artisan2 = Artisan.objects.create(name="Test Artisan 2")
        job_item2 = JobItem.objects.create(
            job=self.job,
            artisan=artisan2,
            product=self.product,
            quantity_ordered=20,
            quantity_accepted=10,
            original_amount=100.00,
            final_payment=50.00, # 10 accepted * 5.00 rate
            payslip_generated=False
        )

        url = reverse('payslip-generate')
        data = {
            "service_category": "CARVING",
            "period_start": self.period_start.strftime('%Y-%m-%d'),
            "period_end": self.period_end.strftime('%Y-%m-%d')
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payslip.objects.count(), 2) # One for each artisan
        self.job_item.refresh_from_db()
        job_item2.refresh_from_db()
        self.assertTrue(self.job_item.payslip_generated)
        self.assertTrue(job_item2.payslip_generated)

    def test_generate_bulk_payslip_no_job_items(self):
        JobItem.objects.all().delete() # Remove existing job items
        url = reverse('payslip-generate')
        data = {
            "service_category": "CARVING",
            "period_start": self.period_start.strftime('%Y-%m-%d'),
            "period_end": self.period_end.strftime('%Y-%m-%d')
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Payslip.objects.count(), 0)

    def test_generate_payslip_invalid_data(self):
        url = reverse('payslip-generate')
        data = {
            "period_start": self.period_end.strftime('%Y-%m-%d'), # End date before start date
            "period_end": self.period_start.strftime('%Y-%m-%d')
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('period_start', response.data)

        data = { # Missing artisan_id and service_category
            "period_start": self.period_start.strftime('%Y-%m-%d'),
            "period_end": self.period_end.strftime('%Y-%m-%d')
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

        data = { # Both artisan_id and service_category
            "artisan_id": self.artisan.id,
            "service_category": "CARVING",
            "period_start": self.period_start.strftime('%Y-%m-%d'),
            "period_end": self.period_end.strftime('%Y-%m-%d')
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
