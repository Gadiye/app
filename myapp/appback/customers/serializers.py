from rest_framework import serializers
from .models import Customer
from orders.models import Order


class CustomerSerializer(serializers.ModelSerializer):
    """
    Serializer for Customer model with validation
    """
    # Make created_date read-only
    created_date = serializers.DateTimeField(read_only=True)
    
    # Add computed fields that might be useful
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    last_order_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'email', 'phone', 'address', 
            'is_active', 'created_date', 'total_orders', 
            'total_spent', 'last_order_date'
        ]
        
    def get_total_orders(self, obj):
        """Get total number of orders for this customer"""
        return obj.order_set.count() if hasattr(obj, 'order_set') else 0
    
    def get_total_spent(self, obj):
        """Get total amount spent by this customer"""
        if hasattr(obj, 'order_set'):
            total = sum(
                order.total_amount for order in obj.order_set.all() 
                if hasattr(order, 'total_amount') and order.total_amount
            )
            return round(total, 2)
        return 0.0
    
    def get_last_order_date(self, obj):
        """Get the date of the customer's last order"""
        if hasattr(obj, 'order_set'):
            last_order = obj.order_set.order_by('-created_date').first()
            if last_order and last_order.created_date:
                return last_order.created_date.date()
        return None
    
    def validate_email(self, value):
        """Validate email format"""
        if value:
            # Additional email validation can be added here
            # The basic validation is handled by Django's EmailField
            pass
        return value
    
    def validate_name(self, value):
        """Validate name field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required and cannot be empty")
        return value.strip()
    
    def validate_phone(self, value):
        """Validate phone number format (optional)"""
        if value:
            # Remove common separators and spaces
            cleaned_phone = ''.join(char for char in value if char.isdigit() or char == '+')
            # Basic validation - adjust regex based on your requirements
            import re
            if not re.match(r'^\+?[\d\s\-\(\)]{7,}$', value):
                raise serializers.ValidationError("Invalid phone number format")
        return value


class CustomerBasicSerializer(serializers.ModelSerializer):
    """
    Basic serializer for Customer model (used for nested representations)
    """
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'is_active']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order model (adjust based on your actual Order model)
    """
    customer = CustomerBasicSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'  # Adjust based on your Order model fields


class CustomerWithOrdersSerializer(serializers.ModelSerializer):
    """
    Customer serializer that includes related orders
    """
    orders = serializers.SerializerMethodField()
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'email', 'phone', 'address', 
            'is_active', 'created_date', 'orders', 
            'total_orders', 'total_spent'
        ]
    
    def get_orders(self, obj):
        """Get customer orders with summary information"""
        orders = obj.order_set.order_by('-created_date')[:10]  # Limit to recent 10 orders
        return [
            {
                'order_id': order.id,
                'status': order.status,
                'total_amount': float(order.total_amount) if hasattr(order, 'total_amount') else 0,
                'created_date': order.created_date.isoformat() if order.created_date else None
            }
            for order in orders
        ]
    
    def get_total_orders(self, obj):
        """Get total number of orders for this customer"""
        return obj.order_set.count()
    
    def get_total_spent(self, obj):
        """Get total amount spent by this customer"""
        total = sum(
            order.total_amount for order in obj.order_set.all() 
            if hasattr(order, 'total_amount') and order.total_amount
        )
        return round(total, 2)


class CustomerStatsSerializer(serializers.Serializer):
    """
    Serializer for customer statistics
    """
    total_customers = serializers.IntegerField()
    active_customers = serializers.IntegerField()
    inactive_customers = serializers.IntegerField()
    total_revenue = serializers.FloatField()
    total_orders = serializers.IntegerField()
    avg_order_value = serializers.FloatField()
    new_customers_this_month = serializers.IntegerField()