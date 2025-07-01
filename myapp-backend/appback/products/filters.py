import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = [
            'animal_type', 'product_type', 'service_category',
            'size_category', 'is_active'
        ]
