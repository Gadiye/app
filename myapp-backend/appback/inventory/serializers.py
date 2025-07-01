from rest_framework import serializers
from .models import Inventory, FinishedStock

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class FinishedStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinishedStock
        fields = '__all__'