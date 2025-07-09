from django.db import models
from customers.models import Customer
from products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    order_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT)
    created_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, null=True)
    
    def update_total_amount(self):
        self.total_amount = sum(item.subtotal for item in self.items.all())
        self.save()
    
    def __str__(self):
        return f"Order #{self.order_id} - {self.customer}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, limit_choices_to={'service_category': 'FINISHED'})
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    @property
    def subtotal(self):
        return self.quantity * self.unit_price
    
    def save(self, *args, **kwargs):
        # Set unit_price on creation
        if not self.pk:
            self.unit_price = self.product.base_price
        super().save(*args, **kwargs)
        
        # Update FinishedStock and Order total
        if self.order.status in ['PROCESSING', 'SHIPPED', 'DELIVERED']:
            from inventory.models import FinishedStock
            finished_stock = FinishedStock.objects.get(product=self.product)
            if finished_stock.quantity < self.quantity:
                raise ValueError(f"Insufficient stock for {self.product}: {finished_stock.quantity} available, {self.quantity} requested.")
            finished_stock.quantity -= self.quantity
            finished_stock.save()
        self.order.update_total_amount()
    
    def __str__(self):
        return f"{self.product} - Qty: {self.quantity}"