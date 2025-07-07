from rest_framework import serializers
from django.core.validators import RegexValidator
import re

from .models import Artisan
from jobs.models import JobItem, Job
from payslips.models import Payslip


class ArtisanSerializer(serializers.ModelSerializer):
    """
    Basic serializer for Artisan model.
    Used for list views and basic CRUD operations.
    """
    
    # Phone number validation
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    phone = serializers.CharField(
        validators=[phone_validator],
        required=False,
        allow_blank=True,
        help_text="Phone number in international format"
    )
    
    class Meta:
        model = Artisan
        fields = ['id', 'name', 'phone', 'is_active', 'created_date']
        read_only_fields = ['id', 'created_date']
    
    def validate_name(self, value):
        """Validate that name is not empty and is reasonable length"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        
        if len(value) > 100:
            raise serializers.ValidationError("Name cannot exceed 100 characters.")
        
        return value.strip()
    
    def validate_phone(self, value):
        """Additional phone number validation"""
        if value:
            # Remove spaces and dashes for validation
            cleaned_phone = re.sub(r'[\s-]', '', value)
            if not re.match(r'^\+?1?\d{9,15}$', cleaned_phone):
                raise serializers.ValidationError(
                    "Invalid phone number format. Use international format like +1234567890"
                )
        return value


class JobSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for job information in artisan details.
    """
    job_id = serializers.IntegerField(source='job.id', read_only=True)
    status = serializers.CharField(source='job.status', read_only=True)
    service_category = serializers.CharField(source='job.service_category', read_only=True)
    created_date = serializers.DateTimeField(source='job.created_date', read_only=True)
    
    class Meta:
        model = JobItem
        fields = ['job_id', 'status', 'service_category', 'created_date']


class PayslipSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for payslip information in artisan details.
    """
    
    class Meta:
        model = Payslip
        fields = ['id', 'generated_date', 'total_payment', 'period_start', 'period_end']


class ArtisanDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Artisan model.
    Includes related jobs and payslips when requested.
    """
    
    jobs = serializers.SerializerMethodField()
    payslips = serializers.SerializerMethodField()
    
    class Meta:
        model = Artisan
        fields = ['id', 'name', 'phone', 'is_active', 'created_date', 'jobs', 'payslips']
        read_only_fields = ['id', 'created_date', 'jobs', 'payslips']
    
    def get_jobs(self, obj):
        """
        Return job summary if requested, otherwise None.
        """
        if hasattr(obj, 'prefetch_jobs') and obj.prefetch_jobs:
            job_items = JobItem.objects.filter(artisan=obj).select_related('job')[:10]  # Limit to 10 most recent
            return JobSummarySerializer(job_items, many=True).data
        return None
    
    def get_payslips(self, obj):
        """
        Return payslip summary if requested, otherwise None.
        """
        if hasattr(obj, 'prefetch_payslips') and obj.prefetch_payslips:
            payslips = Payslip.objects.filter(artisan=obj).order_by('-generated_date')[:10]  # Limit to 10 most recent
            return PayslipSummarySerializer(payslips, many=True).data
        return None


class JobItemSerializer(serializers.ModelSerializer):
    """
    Serializer for JobItem model when viewed from artisan context.
    """
    job_id = serializers.IntegerField(source='job.id', read_only=True)
    status = serializers.CharField(source='job.status', read_only=True)
    service_category = serializers.CharField(source='job.service_category', read_only=True)
    created_date = serializers.DateTimeField(source='job.created_date', read_only=True)
    customer_name = serializers.CharField(source='job.customer.name', read_only=True)
    description = serializers.CharField(source='job.description', read_only=True)
    
    class Meta:
        model = JobItem
        fields = [
            'id', 'job_id', 'status', 'service_category', 
            'created_date', 'customer_name', 'description',
            'quantity', 'unit_price', 'total_price'
        ]


class PayslipSerializer(serializers.ModelSerializer):
    """
    Serializer for Payslip model when viewed from artisan context.
    """
    artisan_name = serializers.CharField(source='artisan.name', read_only=True)
    
    class Meta:
        model = Payslip
        fields = [
            'id', 'artisan_name', 'generated_date', 'total_payment',
            'period_start', 'period_end', 'notes'
        ]


class ArtisanCreateSerializer(serializers.ModelSerializer):
    """
    Specialized serializer for creating artisans with enhanced validation.
    """
    
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    phone = serializers.CharField(
        validators=[phone_validator],
        required=False,
        allow_blank=True,
        help_text="Phone number in international format"
    )
    
    class Meta:
        model = Artisan
        fields = ['name', 'phone', 'is_active']
    
    def validate(self, data):
        """
        Validate that artisan name is unique among active artisans.
        """
        name = data.get('name', '').strip()
        if name:
            # Check for existing active artisan with same name
            existing = Artisan.objects.filter(
                name__iexact=name, 
                is_active=True
            ).exists()
            
            if existing:
                raise serializers.ValidationError({
                    'name': 'An active artisan with this name already exists.'
                })
        
        return data
    
    def create(self, validated_data):
        """
        Create artisan with default active status.
        """
        validated_data.setdefault('is_active', True)
        return super().create(validated_data)


class ArtisanUpdateSerializer(serializers.ModelSerializer):
    """
    Specialized serializer for updating artisans.
    """
    
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    phone = serializers.CharField(
        validators=[phone_validator],
        required=False,
        allow_blank=True,
        help_text="Phone number in international format"
    )
    
    class Meta:
        model = Artisan
        fields = ['name', 'phone', 'is_active']
    
    def validate_name(self, value):
        """
        Validate name change doesn't conflict with existing active artisans.
        """
        if value:
            name = value.strip()
            # Check for existing active artisan with same name (excluding current instance)
            existing = Artisan.objects.filter(
                name__iexact=name, 
                is_active=True
            ).exclude(id=self.instance.id).exists()
            
            if existing:
                raise serializers.ValidationError(
                    'An active artisan with this name already exists.'
                )
        
        return value
    
    def validate_is_active(self, value):
        """
        Validate that artisan can be deactivated (no active jobs).
        """
        if not value and self.instance.is_active:
            # Check for active jobs before allowing deactivation
            active_jobs = JobItem.objects.filter(
                artisan=self.instance, 
                job__status='IN_PROGRESS'
            ).exists()
            
            if active_jobs:
                raise serializers.ValidationError(
                    'Cannot deactivate artisan with active job items.'
                )
        
        return value