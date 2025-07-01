from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from .models import Artisan, JobItem, Payslip
from .serializers import (
    ArtisanSerializer, 
    ArtisanDetailSerializer,
    JobItemSerializer,
    PayslipSerializer
)


class ArtisanPagination(PageNumberPagination):
    """Custom pagination for artisan lists"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ArtisanListCreateView(generics.ListCreateAPIView):
    """
    GET /api/artisans/
    POST /api/artisans/
    
    List all artisans with filtering, searching, and sorting.
    Create new artisan.
    """
    serializer_class = ArtisanSerializer
    pagination_class = ArtisanPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'created_date']
    ordering = ['-created_date']  # Default ordering

    def get_queryset(self):
        """
        Return queryset with optional filtering.
        By default, return only active artisans.
        """
        queryset = Artisan.objects.all()
        
        # Filter by active status (default to active only)
        is_active = self.request.query_params.get('is_active', 'true')
        if is_active.lower() in ['true', '1']:
            queryset = queryset.filter(is_active=True)
        elif is_active.lower() in ['false', '0']:
            queryset = queryset.filter(is_active=False)
        # If 'all' or any other value, return all artisans
        
        return queryset

    def perform_create(self, serializer):
        """Handle artisan creation"""
        serializer.save()


class ArtisanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/artisans/{id}/
    PUT /api/artisans/{id}/
    PATCH /api/artisans/{id}/
    DELETE /api/artisans/{id}/
    
    Retrieve, update, or soft delete a specific artisan.
    """
    queryset = Artisan.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """Use detailed serializer for GET requests"""
        if self.request.method == 'GET':
            return ArtisanDetailSerializer
        return ArtisanSerializer
    
    def get_object(self):
        """Get artisan object with optional related data"""
        obj = get_object_or_404(Artisan, pk=self.kwargs['pk'])
        
        # Check if we should include related data
        include_jobs = self.request.query_params.get('include_jobs', 'false').lower() == 'true'
        include_payslips = self.request.query_params.get('include_payslips', 'false').lower() == 'true'
        
        if include_jobs:
            obj.prefetch_jobs = True
        if include_payslips:
            obj.prefetch_payslips = True
            
        return obj
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete artisan by setting is_active=False.
        Check for dependencies before deletion.
        """
        artisan = self.get_object()
        
        # Check if artisan has active job items (due to PROTECT constraint)
        active_jobs = JobItem.objects.filter(artisan=artisan, job__status='IN_PROGRESS').exists()
        if active_jobs:
            return Response(
                {"error": "Cannot delete artisan with active job items. Complete or reassign jobs first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Soft delete
        artisan.is_active = False
        artisan.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class ArtisanJobsView(generics.ListAPIView):
    """
    GET /api/artisans/{id}/jobs/
    
    Retrieve jobs associated with the artisan.
    """
    serializer_class = JobItemSerializer
    pagination_class = ArtisanPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['job__status', 'job__service_category']
    ordering_fields = ['job__created_date', 'job__status']
    ordering = ['-job__created_date']

    def get_queryset(self):
        """Get jobs for specific artisan"""
        artisan_id = self.kwargs['pk']
        artisan = get_object_or_404(Artisan, pk=artisan_id)
        
        queryset = JobItem.objects.filter(artisan=artisan).select_related('job')
        
        # Optional date range filtering
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(job__created_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(job__created_date__lte=end_date)
            
        return queryset

    def get_serializer_context(self):
        """Add artisan to serializer context"""
        context = super().get_serializer_context()
        context['artisan_id'] = self.kwargs['pk']
        return context


class ArtisanPayslipsView(generics.ListAPIView):
    """
    GET /api/artisans/{id}/payslips/
    
    Retrieve payslips for the artisan.
    """
    serializer_class = PayslipSerializer
    pagination_class = ArtisanPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['generated_date', 'total_payment']
    ordering = ['-generated_date']  # Most recent first

    def get_queryset(self):
        """Get payslips for specific artisan"""
        artisan_id = self.kwargs['pk']
        artisan = get_object_or_404(Artisan, pk=artisan_id)
        
        queryset = Payslip.objects.filter(artisan=artisan)
        
        # Optional date range filtering
        period_start = self.request.query_params.get('period_start')
        period_end = self.request.query_params.get('period_end')
        
        if period_start:
            queryset = queryset.filter(period_start__gte=period_start)
        if period_end:
            queryset = queryset.filter(period_end__lte=period_end)
            
        return queryset


# Alternative function-based views for specific operations
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_artisan(request, pk):
    """
    POST /api/artisans/{id}/activate/
    
    Activate an artisan (set is_active=True).
    """
    try:
        artisan = Artisan.objects.get(pk=pk)
        artisan.is_active = True
        artisan.save()
        
        serializer = ArtisanSerializer(artisan)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Artisan.DoesNotExist:
        return Response(
            {"error": "Artisan not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_artisan(request, pk):
    """
    POST /api/artisans/{id}/deactivate/
    
    Deactivate an artisan (set is_active=False).
    """
    try:
        artisan = Artisan.objects.get(pk=pk)
        
        # Check for active jobs before deactivation
        active_jobs = JobItem.objects.filter(artisan=artisan, job__status='IN_PROGRESS').exists()
        if active_jobs:
            return Response(
                {"error": "Cannot deactivate artisan with active job items."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        artisan.is_active = False
        artisan.save()
        
        serializer = ArtisanSerializer(artisan)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Artisan.DoesNotExist:
        return Response(
            {"error": "Artisan not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
def artisan_metadata(request):
    """
    GET /api/artisans/metadata/
    
    Provide metadata for artisan-related operations.
    """
    metadata = {
        "status_choices": [
            {"value": True, "label": "Active"},
            {"value": False, "label": "Inactive"}
        ],
        "phone_format": "International format recommended (e.g., +1234567890)",
        "search_fields": ["name"],
        "filterable_fields": ["is_active"],
        "sortable_fields": ["name", "created_date"]
    }
    
    return Response(metadata, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def artisan_stats(request, pk):
    """
    GET /api/artisans/{id}/stats/
    
    Get statistics for a specific artisan.
    """
    try:
        artisan = Artisan.objects.get(pk=pk)
        
        # Calculate stats
        total_jobs = JobItem.objects.filter(artisan=artisan).count()
        completed_jobs = JobItem.objects.filter(artisan=artisan, job__status='COMPLETED').count()
        in_progress_jobs = JobItem.objects.filter(artisan=artisan, job__status='IN_PROGRESS').count()
        total_payslips = Payslip.objects.filter(artisan=artisan).count()
        
        # Calculate total earnings
        total_earnings = sum(
            payslip.total_payment for payslip in Payslip.objects.filter(artisan=artisan)
        )
        
        stats = {
            "artisan_id": artisan.id,
            "artisan_name": artisan.name,
            "total_jobs": total_jobs,
            "completed_jobs": completed_jobs,
            "in_progress_jobs": in_progress_jobs,
            "total_payslips": total_payslips,
            "total_earnings": total_earnings,
            "is_active": artisan.is_active,
            "member_since": artisan.created_date
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    except Artisan.DoesNotExist:
        return Response(
            {"error": "Artisan not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
