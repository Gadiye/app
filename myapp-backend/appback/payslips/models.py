from django.db import models
from artisans.models import Artisan
from products.models import Product

class Payslip(models.Model):
    artisan = models.ForeignKey(Artisan, on_delete=models.PROTECT)
    service_category = models.CharField(max_length=50, choices=Product.SERVICE_CATEGORIES, blank=True, null=True)
    generated_date = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(upload_to='payslips/')
    total_payment = models.DecimalField(max_digits=12, decimal_places=2)
    period_start = models.DateField()
    period_end = models.DateField()
    
    def __str__(self):
        return f"Payslip for {self.artisan} - {self.generated_date.strftime('%Y-%m-%d')}"