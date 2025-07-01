from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Product, PriceHistory
from .serializers import (
    ProductSerializer, 
    ProductDetailSerializer, 
    ProductCreateUpdateSerializer,
    PriceHistorySerializer,
    ProductMetadataSerializer
)
from .filters import ProductFilter


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations with additional functionality.
    
    Provides:
    - List products with filtering, searching, and sorting
    - Retrieve individual product details
    - Create new products
    - Update existing products (with price history tracking)
    - Soft delete products
    - Get price history for a product
    """
    
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['animal_type', 'product_type', 'service_category']
    ordering_fields = ['base_price', 'last_price_update', 'product_type', 'created_at']
    ordering = ['-last_price_update']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    def get_queryset(self):
        """Filter queryset to show only active products by default."""
        queryset = Product.objects.all()
        
        # Show only active products by default unless explicitly requested
        if self.request.query_params.get('is_active') is None:
            queryset = queryset.filter(is_active=True)
            
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single product with optional price history.
        
        Query Parameters:
        - include_price_history: Include price history in response
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Include price history if requested
        if request.query_params.get('include_price_history', '').lower() == 'true':
            price_history = PriceHistory.objects.filter(
                product=instance
            ).order_by('-effective_date')
            data['price_history'] = PriceHistorySerializer(
                price_history, many=True
            ).data
            
        return Response(data)
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Update product and create price history record if price changes.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_price = instance.base_price
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Check if price is being updated
        new_price = serializer.validated_data.get('base_price')
        if new_price and new_price != old_price:
            # Create price history record
            PriceHistory.objects.create(
                product=instance,
                old_price=old_price,
                new_price=new_price,
                effective_date=timezone.now(),
                changed_by=request.user.username if request.user.is_authenticated else 'system',
                reason=request.data.get('reason', 'Price update')
            )
        
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete product by setting is_active=False.
        
        Only allows hard deletion if no dependencies exist.
        """
        instance = self.get_object()
        
        # Check for dependencies (you may need to adjust based on your models)
        has_dependencies = (
            hasattr(instance, 'jobitem_set') and instance.jobitem_set.exists()
        ) or (
            hasattr(instance, 'orderitem_set') and instance.orderitem_set.exists()
        )
        
        force_delete = request.query_params.get('force_delete', '').lower() == 'true'
        
        if has_dependencies and not force_delete:
            # Soft delete
            instance.is_active = False
            instance.save()
            return Response(
                {'message': 'Product deactivated successfully'}, 
                status=status.HTTP_200_OK
            )
        elif not has_dependencies and force_delete:
            # Hard delete
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        elif has_dependencies and force_delete:
            return Response(
                {'error': 'Cannot delete product with existing dependencies'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Default soft delete
            instance.is_active = False
            instance.save()
            return Response(
                {'message': 'Product deactivated successfully'}, 
                status=status.HTTP_200_OK
            )
    
    @action(detail=True, methods=['get'], url_path='price-history')
    def price_history(self, request, pk=None):
        """
        Get price history for a specific product.
        
        Query Parameters:
        - start_date: Filter from this date (YYYY-MM-DD)
        - end_date: Filter to this date (YYYY-MM-DD)
        """
        product = self.get_object()
        queryset = PriceHistory.objects.filter(product=product).order_by('-effective_date')
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                from datetime import datetime
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(effective_date__date__gte=start_date)
            except ValueError:
                return Response(
                    {'error': 'Invalid start_date format. Use YYYY-MM-DD'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date:
            try:
                from datetime import datetime
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(effective_date__date__lte=end_date)
            except ValueError:
                return Response(
                    {'error': 'Invalid end_date format. Use YYYY-MM-DD'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Paginate the results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PriceHistorySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PriceHistorySerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='metadata')
    def metadata(self, request):
        """
        Provide metadata for product choices to populate frontend dropdowns.
        """
        from .models import PRODUCT_TYPES, SERVICE_CATEGORIES, SIZE_CATEGORIES
        
        data = {
            'product_types': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in PRODUCT_TYPES
            ],
            'service_categories': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in SERVICE_CATEGORIES
            ],
            'size_categories': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in SIZE_CATEGORIES
            ]
        }
        
        return Response(data)


# Alternative function-based views if you prefer them over ViewSets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination

class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100

@api_view(['GET'])
def product_list(request):
    """Alternative function-based view for listing products."""
    queryset = Product.objects.filter(is_active=True)
    
    # Apply filters
    product_type = request.GET.get('product_type')
    animal_type = request.GET.get('animal_type')
    service_category = request.GET.get('service_category')
    size_category = request.GET.get('size_category')
    search = request.GET.get('search')
    
    if product_type:
        queryset = queryset.filter(product_type=product_type)
    if animal_type:
        queryset = queryset.filter(animal_type__icontains=animal_type)
    if service_category:
        queryset = queryset.filter(service_category=service_category)
    if size_category:
        queryset = queryset.filter(size_category=size_category)
    if search:
        queryset = queryset.filter(animal_type__icontains=search)
    
    # Apply ordering
    ordering = request.GET.get('ordering', '-last_price_update')
    queryset = queryset.order_by(ordering)
    
    # Paginate
    paginator = ProductPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    serializer = ProductSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def product_detail(request, pk):
    """Alternative function-based view for product detail."""
    product = get_object_or_404(Product, pk=pk)
    
    serializer = ProductDetailSerializer(product)
    data = serializer.data
    
    if request.GET.get('include_price_history', '').lower() == 'true':
        price_history = PriceHistory.objects.filter(
            product=product
        ).order_by('-effective_date')
        data['price_history'] = PriceHistorySerializer(
            price_history, many=True
        ).data
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def product_create(request):
    """Alternative function-based view for creating products."""
    serializer = ProductCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def product_update(request, pk):
    """Alternative function-based view for updating products."""
    product = get_object_or_404(Product, pk=pk)
    old_price = product.base_price
    
    serializer = ProductCreateUpdateSerializer(
        product, 
        data=request.data, 
        partial=request.method == 'PATCH'
    )
    
    if serializer.is_valid():
        new_price = serializer.validated_data.get('base_price')
        if new_price and new_price != old_price:
            PriceHistory.objects.create(
                product=product,
                old_price=old_price,
                new_price=new_price,
                effective_date=timezone.now(),
                changed_by=request.user.username,
                reason=request.data.get('reason', 'Price update')
            )
        
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def product_delete(request, pk):
    """Alternative function-based view for deleting products."""
    product = get_object_or_404(Product, pk=pk)
    
    # Soft delete by default
    product.is_active = False
    product.save()
    
    return Response(
        {'message': 'Product deactivated successfully'}, 
        status=status.HTTP_200_OK
    )