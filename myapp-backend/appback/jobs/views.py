from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Job, JobItem
from .serializers import (
    JobSerializer, JobCreateSerializer, JobUpdateSerializer, 
    JobItemSerializer, JobItemLightSerializer
)
from products.models import Product


class JobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Job model with full CRUD operations.
    """
    queryset = Job.objects.all().prefetch_related('items__artisan', 'items__product')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'service_category']
    search_fields = ['created_by']
    ordering_fields = ['job_id', 'created_date', 'status']
    ordering = ['-created_date']

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return JobCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return JobUpdateSerializer
        return JobSerializer

    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = super().get_queryset()
        
        # Search by created_by
        search_query = self.request.query_params.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(created_by__icontains=search_query)
            )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', '')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by service_category
        category_filter = self.request.query_params.get('service_category', '')
        if category_filter:
            queryset = queryset.filter(service_category=category_filter)
        
        return queryset

    def list(self, request, *args, **kwargs):
        """List jobs with optional filtering and searching."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get include_items parameter
        include_items = request.query_params.get('include_items', 'false').lower() == 'true'
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data = self.get_paginated_response(serializer.data)
            
            # Add summary statistics if requested
            if request.query_params.get('include_stats', 'false').lower() == 'true':
                total_cost = sum(job.total_cost for job in queryset)
                total_final_payment = sum(job.total_final_payment for job in queryset)
                response_data.data['stats'] = {
                    'total_cost': total_cost,
                    'total_final_payment': total_final_payment
                }
            
            return response_data
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single job with optional item details."""
        instance = self.get_object()
        include_items = request.query_params.get('include_items', 'false').lower() == 'true'
        
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Include detailed items if requested
        if include_items:
            items = JobItem.objects.filter(job=instance).select_related('artisan', 'product')
            data['items'] = JobItemSerializer(items, many=True).data
        
        return Response(data)

    def destroy(self, request, *args, **kwargs):
        """Delete a job with dependency checks."""
        instance = self.get_object()
        
        # Check if job has items with received or accepted quantities
        has_received_items = JobItem.objects.filter(
            job=instance,
            quantity_received__gt=0
        ).exists()
        
        has_accepted_items = JobItem.objects.filter(
            job=instance,
            quantity_accepted__gt=0
        ).exists()
        
        if has_received_items or has_accepted_items:
            return Response(
                {
                    'error': 'Cannot delete job with received or accepted items. '
                           'Please remove or reset item quantities first.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Get job items for a specific job."""
        job = self.get_object()
        queryset = JobItem.objects.filter(job=job).select_related('artisan', 'product')
        
        # Filter by artisan_id if provided
        artisan_id = request.query_params.get('artisan_id')
        if artisan_id:
            queryset = queryset.filter(artisan_id=artisan_id)
        
        # Filter by product_id if provided
        product_id = request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Sort by quantity_ordered or original_amount
        ordering = request.query_params.get('ordering', 'id')
        if ordering in ['quantity_ordered', 'original_amount', '-quantity_ordered', '-original_amount']:
            queryset = queryset.order_by(ordering)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = JobItemSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = JobItemSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Manually trigger status update for a job."""
        job = self.get_object()
        old_status = job.status
        job.update_status()
        
        serializer = self.get_serializer(job)
        return Response({
            'message': f'Status updated from {old_status} to {job.status}',
            'job': serializer.data
        })

    @action(detail=False, methods=['get'])
    def metadata(self, request):
        """Get metadata for frontend form rendering."""
        from products.models import Product
        
        return Response({
            'status_choices': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in Job.STATUS_CHOICES
            ],
            'service_categories': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in Product.SERVICE_CATEGORIES
            ],
            'search_fields': ['created_by'],
            'filterable_fields': ['status', 'service_category'],
            'sortable_fields': ['job_id', 'created_date', 'total_cost']
        })