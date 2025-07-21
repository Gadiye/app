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

class ServiceRate(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='payslip_service_rates', help_text="The product this service rate applies to.")
    service_category = models.CharField(
        max_length=50,
        choices=Product.SERVICE_CATEGORIES,
        help_text="The stage/service category this rate is for (e.g., CARVING, PAINTING)."
    )
    rate_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="The rate paid to an artisan per unit of this product for this service category."
    )
    is_active = models.BooleanField(default=True, help_text="Whether this service rate is currently active.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'service_category')
        verbose_name = "Service Rate"
        verbose_name_plural = "Service Rates"
        ordering = ['product__product_type', 'product__animal_type', 'service_category']

    def __str__(self):
        return f"{self.product.product_type} ({self.product.animal_type}) - {self.service_category}: ${self.rate_per_unit}/unit"
