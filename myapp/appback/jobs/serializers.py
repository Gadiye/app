# jobs/serializers.py
from rest_framework import serializers
from .models import Job, JobItem, JobDelivery
from artisans.models import Artisan # Assuming Artisan app
from products.models import Product # Assuming Product app

# --- Lite Serializers for Nested Data ---

class ArtisanJobItemLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artisan
        fields = ['id', 'name']

class ProductJobItemLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'product_type', 'animal_type', 'base_price', 'service_category']


# --- JobItem Serializers ---

class JobItemDeliverySerializer(serializers.ModelSerializer):
    """Serializer for JobDelivery when creating/listing deliveries."""
    class Meta:
        model = JobDelivery
        fields = ['id', 'quantity_received', 'quantity_accepted', 'rejection_reason', 'delivery_date', 'notes']
        read_only_fields = ['delivery_date']

    def validate(self, data):
        # Additional validation can be added here, e.g., quantity_accepted <= quantity_received
        if data.get('quantity_accepted', 0) > data.get('quantity_received', 0):
            raise serializers.ValidationError("Quantity accepted cannot exceed quantity received.")
        return data


class JobItemCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating JobItems."""
    artisan = serializers.PrimaryKeyRelatedField(queryset=Artisan.objects.all())
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = JobItem
        fields = [
            'id', 'artisan', 'product', 'quantity_ordered', 'quantity_received',
            'quantity_accepted', 'rejection_reason', 'payslip_generated'
        ]
        read_only_fields = ['payslip_generated', 'quantity_received', 'quantity_accepted', 'rejection_reason'] # These are managed by deliveries
        extra_kwargs = {
            'quantity_ordered': {'min_value': 1}
        }

    def validate_product(self, value):
        # Optionally validate that product's service_category matches job's service_category if needed
        if 'job' in self.context:
            job = self.context['job']
            if value.service_category != job.service_category:
                 raise serializers.ValidationError(f"Product service category '{value.service_category}' does not match job service category '{job.service_category}'.")
        return value

    def create(self, validated_data):
        job = self.context['job'] # Job instance is passed from JobItemViewSet
        validated_data['job'] = job
        # original_amount and final_payment are set in model's save method
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent changing job for an existing job item
        if 'job' in validated_data and validated_data['job'] != instance.job:
            raise serializers.ValidationError({"job": "Job cannot be changed for an existing job item."})
        # Prevent changing artisan or product after creation if desired
        if 'artisan' in validated_data and validated_data['artisan'] != instance.artisan:
            raise serializers.ValidationError({"artisan": "Artisan cannot be changed for an existing job item."})
        if 'product' in validated_data and validated_data['product'] != instance.product:
            raise serializers.ValidationError({"product": "Product cannot be changed for an existing job item."})

        # Manual fields are quantity_ordered
        instance.quantity_ordered = validated_data.get('quantity_ordered', instance.quantity_ordered)
        # Other fields (quantity_received, quantity_accepted, rejection_reason, payslip_generated)
        # are updated by JobDelivery or Payslip logic, so they are read-only here.

        instance.save() # This will trigger the model's save and update job status
        return instance


class JobItemDetailListSerializer(serializers.ModelSerializer):
    """Serializer for listing and retrieving JobItems, with nested related data."""
    artisan = ArtisanJobItemLiteSerializer(read_only=True)
    product = ProductJobItemLiteSerializer(read_only=True)
    deliveries = JobItemDeliverySerializer(many=True, read_only=True) # Nested deliveries

    class Meta:
        model = JobItem
        fields = [
            'id', 'job', 'artisan', 'product', 'quantity_ordered',
            'quantity_received', 'quantity_accepted', 'rejection_reason',
            'original_amount', 'final_payment', 'payslip_generated', 'deliveries'
        ]
        read_only_fields = [
            'quantity_received', 'quantity_accepted', 'rejection_reason',
            'original_amount', 'final_payment', 'payslip_generated'
        ]


# --- Job Serializers ---

class JobListSerializer(serializers.ModelSerializer):
    """Serializer for listing Jobs."""
    service_category_display = serializers.CharField(source='get_service_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_cost = serializers.FloatField(read_only=True)
    total_final_payment = serializers.FloatField(read_only=True)

    class Meta:
        model = Job
        fields = [
            'job_id', 'created_date', 'created_by', 'status', 'status_display',
            'service_category', 'service_category_display', 'notes',
            'total_cost', 'total_final_payment', 'artisans_involved'
        ]
        read_only_fields = ['created_date', 'status', 'total_cost', 'total_final_payment', 'artisans_involved']


class JobDetailSerializer(JobListSerializer):
    """Serializer for retrieving a single Job, with nested JobItems."""
    items = JobItemDetailListSerializer(many=True, read_only=True) # Nested job items

    class Meta(JobListSerializer.Meta):
        fields = JobListSerializer.Meta.fields + ['items']


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating Jobs."""
    items = JobItemCreateUpdateSerializer(many=True, write_only=True)
    created_by = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Job
        fields = [
            'job_id', 'created_date', 'created_by', 'status', 
            'service_category', 'notes', 'items'
        ]
        read_only_fields = ['job_id', 'created_date']

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("A job must have at least one item.")
        
        # Check for service category consistency
        service_category = self.initial_data.get('service_category')
        for item_data in value:
            product = item_data.get('product')
            if product and product.service_category != service_category:
                raise serializers.ValidationError(
                    f"Product '{product.product_type}' has a different service category "
                    f"than the one specified for the job ('{service_category}')."
                )
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        job = Job.objects.create(**validated_data)
        for item_data in items_data:
            JobItem.objects.create(job=job, **item_data)
        return job

    def update(self, instance, validated_data):
        # Basic job fields update
        instance.service_category = validated_data.get('service_category', instance.service_category)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()

        # For updating items, it's better to use the dedicated JobItem endpoints
        # as handling nested updates here can be complex (e.g., identifying which item to update).
        # If full nested updates are needed, this logic would need to be expanded significantly.
        
        return instance

    def validate_service_category(self, value):
        if value not in [choice[0] for choice in Product.SERVICE_CATEGORIES]:
            raise serializers.ValidationError("Invalid service category.")
        return value