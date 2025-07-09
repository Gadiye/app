from django.db import models
from django.core.validators import MinValueValidator
from products.models import Product

class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    service_category = models.CharField(max_length=50, choices=[(sc[0], sc[1]) for sc in Product.SERVICE_CATEGORIES if sc[0] != 'FINISHED'])
    quantity = models.PositiveIntegerField(default=0)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.product} - Qty: {self.quantity}"
    
    class Meta:
        verbose_name_plural = "Inventories"

class FinishedStock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT, limit_choices_to={'service_category': 'FINISHED'})
    quantity = models.PositiveIntegerField(default=0)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.product} - Stock: {self.quantity}"
    
    class Meta:
        verbose_name_plural = "Finished Stock"