from rest_framework import serializers
from .models import Job, JobItem, JobDelivery

class JobSerializer(serializers.ModelSerializer):
    total_cost = serializers.ReadOnlyField()
    total_final_payment = serializers.ReadOnlyField()
    
    class Meta:
        model = Job
        fields = '__all__'

class JobItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobItem
        fields = '__all__'

class JobDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDelivery
        fields = '__all__'