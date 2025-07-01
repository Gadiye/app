# products/serializers.py
from rest_framework import serializers
from .models import Product, PriceHistory

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'animal_type', 'product_type', 'service_category',
            'size_category', 'base_price', 'last_price_update',
            'is_active',
        ]

class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'animal_type', 'product_type', 'service_category',
            'size_category', 'base_price', 'is_active'
        ]

class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = [
            'id', 'product', 'old_price', 'new_price',
            'effective_date', 'changed_by', 'reason'
        ]

class ProductMetadataSerializer(serializers.Serializer):
    product_types = serializers.ListField(child=serializers.DictField())
    service_categories = serializers.ListField(child=serializers.DictField())
    size_categories = serializers.ListField(child=serializers.DictField())

