# filepath: /home/gadmor/projects/myapp-backend/appback/products/admin.py
from django.contrib import admin
from .models import Product, PriceHistory

admin.site.register(Product)
admin.site.register(PriceHistory)