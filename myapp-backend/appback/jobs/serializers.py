from rest_framework import serializers
from .models import Job, JobItem
from artisans.models import Artisan
from products.models import Product
from artisans.serializers import ArtisanSerializer
from products.serializers import ProductSerializer


class JobItemSerializer(serializers.ModelSerializer):
    """Serializer for JobItem model with nested artisan and product data."""
    artisan = ArtisanSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    artisan_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = JobItem
        fields = [
            'id', 'artisan', 'product', 'artisan_id', 'product_id',
            'quantity_ordered', 'quantity_received', 'quantity_accepted',
            'original_amount', 'final_payment'
        ]

    def validate_artisan_id(self, value):
        """Validate that the artisan exists."""
        if not Artisan.objects.filter(id=value).exists():
            raise serializers.ValidationError("Artisan with this ID does not exist.")
        return value

    def validate_product_id(self, value):
        """Validate that the product exists."""
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Product with this ID does not exist.")
        return value


class JobItemLightSerializer(serializers.ModelSerializer):
    """Lightweight serializer for JobItem without full nested data."""
    artisan = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()

    class Meta:
        model = JobItem
        fields = [
            'id', 'artisan', 'product', 'quantity_ordered', 
            'quantity_received', 'quantity_accepted'
        ]

    def get_artisan(self, obj):
        return {"id": obj.artisan.id, "name": obj.artisan.name}

    def get_product(self, obj):
        return {
            "id": obj.product.id,
            "product_type": obj.product.product_type,
            "animal_type": getattr(obj.product, 'animal_type', None)
        }


class JobSerializer(serializers.ModelSerializer):
    """Main serializer for Job model."""
    total_cost = serializers.ReadOnlyField()
    total_final_payment = serializers.ReadOnlyField()
    items = JobItemLightSerializer(many=True, read_only=True)
    created_date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Job
        fields = [
            'job_id', 'created_date', 'created_by', 'status', 
            'service_category', 'notes', 'total_cost', 
            'total_final_payment', 'items'
        ]

    def validate_service_category(self, value):
        """Validate service category against Product.SERVICE_CATEGORIES."""
        from products.models import Product
        valid_categories = [choice[0] for choice in Product.SERVICE_CATEGORIES]
        if value not in valid_categories:
            raise serializers.ValidationError(
                f"Invalid service category. Must be one of: {valid_categories}"
            )
        return value


class JobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating jobs with nested items."""
    items = JobItemSerializer(many=True, required=False)
    total_cost = serializers.ReadOnlyField()
    total_final_payment = serializers.ReadOnlyField()

    class Meta:
        model = Job
        fields = [
            'job_id', 'created_by', 'service_category', 'notes', 
            'items', 'total_cost', 'total_final_payment'
        ]

    def create(self, validated_data):
        """Create job with nested items."""
        items_data = validated_data.pop('items', [])
        job = Job.objects.create(**validated_data)
        
        # Create job items
        for item_data in items_data:
            artisan_id = item_data.pop('artisan_id')
            product_id = item_data.pop('product_id')
            JobItem.objects.create(
                job=job,
                artisan_id=artisan_id,
                product_id=product_id,
                **item_data
            )
        
        # Update job status based on items
        job.update_status()
        return job

    def validate_service_category(self, value):
        """Validate service category against Product.SERVICE_CATEGORIES."""
        from products.models import Product
        valid_categories = [choice[0] for choice in Product.SERVICE_CATEGORIES]
        if value not in valid_categories:
            raise serializers.ValidationError(
                f"Invalid service category. Must be one of: {valid_categories}"
            )
        return value


class JobUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating jobs with nested items."""
    items = JobItemSerializer(many=True, required=False)
    status = serializers.CharField(read_only=True)  # Prevent manual status updates

    class Meta:
        model = Job
        fields = ['service_category', 'notes', 'items', 'status']

    def update(self, instance, validated_data):
        """Update job with nested items."""
        items_data = validated_data.pop('items', [])
        
        # Update job fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create job items
        for item_data in items_data:
            item_id = item_data.get('id')
            if item_id:
                # Update existing item
                try:
                    job_item = JobItem.objects.get(id=item_id, job=instance)
                    for attr, value in item_data.items():
                        if attr not in ['id', 'artisan_id', 'product_id']:
                            setattr(job_item, attr, value)
                    job_item.save()
                except JobItem.DoesNotExist:
                    pass
            else:
                # Create new item
                artisan_id = item_data.pop('artisan_id', None)
                product_id = item_data.pop('product_id', None)
                if artisan_id and product_id:
                    JobItem.objects.create(
                        job=instance,
                        artisan_id=artisan_id,
                        product_id=product_id,
                        **item_data
                    )
        
        # Update job status based on items
        instance.update_status()
        return instance

