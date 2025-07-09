from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator
from django.utils.dateparse import parse_date
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re
from datetime import datetime

from .models import Customer
from orders.models import Order  # Adjust import based on your models location
from .serializers import CustomerSerializer, OrderSerializer  # Adjust import based on your serializers location


class CustomerPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def customer_list(request):
    """
    List all customers or create a new customer.
    
    GET: Retrieve paginated list of customers with filtering, sorting, and searching
    POST: Create a new customer (requires authentication)
    """
    if request.method == 'GET':
        # Get all customers, filter by active status by default
        customers = Customer.objects.all()
        
        # Filter by is_active (default to True)
        is_active = request.GET.get('is_active', 'true').lower()
        if is_active == 'false':
            customers = customers.filter(is_active=False)
        elif is_active != 'all':
            customers = customers.filter(is_active=True)
        
        # Search functionality
        search = request.GET.get('search', '')
        if search:
            customers = customers.filter(
                Q(name__icontains=search) | Q(email__icontains=search)
            )
        
        # Sorting
        sort_by = request.GET.get('sort_by', 'created_date')
        if sort_by in ['name', 'email', 'created_date', '-name', '-email', '-created_date']:
            customers = customers.order_by(sort_by)
        else:
            customers = customers.order_by('-created_date')
        
        # Pagination
        paginator = CustomerPagination()
        paginated_customers = paginator.paginate_queryset(customers, request)
        
        serializer = CustomerSerializer(paginated_customers, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    elif request.method == 'POST':
        # Create new customer (requires authentication)
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            # Validate email format if provided
            email = serializer.validated_data.get('email')
            if email:
                try:
                    validate_email(email)
                except ValidationError:
                    return Response(
                        {'error': 'Invalid email format'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def customer_detail(request, customer_id):
    """
    Retrieve, update, or delete a specific customer.
    
    GET: Fetch customer details (optionally with orders)
    PUT/PATCH: Update customer (requires authentication)
    DELETE: Soft delete customer (requires authentication)
    """
    customer = get_object_or_404(Customer, id=customer_id)
    
    if request.method == 'GET':
        # Check if orders should be included
        include_orders = request.GET.get('include_orders', 'false').lower() == 'true'
        
        serializer = CustomerSerializer(customer)
        data = serializer.data
        
        if include_orders:
            # Get customer orders with summary information
            orders = Order.objects.filter(customer=customer).order_by('-created_date')
            order_data = []
            for order in orders:
                order_data.append({
                    'order_id': order.id,
                    'status': order.status,
                    'total_amount': float(order.total_amount) if hasattr(order, 'total_amount') else 0,
                    'created_date': order.created_date.isoformat() if order.created_date else None
                })
            data['orders'] = order_data
        
        return Response(data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Update customer (requires authentication)
        partial = request.method == 'PATCH'
        serializer = CustomerSerializer(customer, data=request.data, partial=partial)
        
        if serializer.is_valid():
            # Validate email format if being updated
            email = serializer.validated_data.get('email')
            if email:
                try:
                    validate_email(email)
                except ValidationError:
                    return Response(
                        {'error': 'Invalid email format'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Soft delete by setting is_active=False
        try:
            # Check if customer has active orders that would prevent deletion
            active_orders = Order.objects.filter(
                customer=customer
            ).exclude(
                status__in=['CANCELLED', 'DELIVERED']  # Adjust based on your Order model
            )
            
            if active_orders.exists():
                return Response(
                    {'error': 'Cannot delete customer with active orders'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Soft delete
            customer.is_active = False
            customer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            return Response(
                {'error': 'Cannot delete customer due to dependencies'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def customer_orders(request, customer_id):
    """
    Get all orders for a specific customer.
    
    Supports filtering by status and date range, with pagination.
    """
    customer = get_object_or_404(Customer, id=customer_id)
    orders = Order.objects.filter(customer=customer)
    
    # Filter by status
    status_filter = request.GET.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter)
    
    # Filter by date range
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if start_date:
        try:
            start_date = parse_date(start_date)
            if start_date:
                orders = orders.filter(created_date__gte=start_date)
        except ValueError:
            return Response(
                {'error': 'Invalid start_date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    if end_date:
        try:
            end_date = parse_date(end_date)
            if end_date:
                orders = orders.filter(created_date__lte=end_date)
        except ValueError:
            return Response(
                {'error': 'Invalid end_date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Order by creation date (newest first)
    orders = orders.order_by('-created_date')
    
    # Pagination
    paginator = CustomerPagination()
    paginated_orders = paginator.paginate_queryset(orders, request)
    
    # Serialize with minimal fields for performance
    order_data = []
    for order in paginated_orders:
        order_data.append({
            'order_id': order.id,
            'status': order.status,
            'total_amount': float(order.total_amount) if hasattr(order, 'total_amount') else 0,
            'created_date': order.created_date.isoformat() if order.created_date else None
        })
    
    return paginator.get_paginated_response(order_data)


@api_view(['GET'])
def customer_metadata(request):
    """
    Get metadata for customer management (status choices, search fields, etc.)
    """
    metadata = {
        'status_choices': [
            {'value': True, 'label': 'Active'},
            {'value': False, 'label': 'Inactive'}
        ],
        'search_fields': ['name', 'email'],
        'filterable_fields': ['is_active'],
        'sortable_fields': ['name', 'email', 'created_date']
    }
    
    return Response(metadata)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def customer_stats(request):
    """
    Get customer statistics for dashboard/analytics.
    """
    # Total customers
    total_customers = Customer.objects.count()
    active_customers = Customer.objects.filter(is_active=True).count()
    
    # Customer with order statistics
    customers_with_orders = Customer.objects.annotate(
        total_orders=Count('order'),
        total_spent=Sum('order__total_amount')  # Adjust field name based on your Order model
    ).filter(total_orders__gt=0)
    
    # Calculate averages
    total_revenue = sum(c.total_spent or 0 for c in customers_with_orders)
    total_orders = sum(c.total_orders or 0 for c in customers_with_orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # New customers this month
    from django.utils import timezone
    current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_customers_this_month = Customer.objects.filter(
        created_date__gte=current_month
    ).count()
    
    stats = {
        'total_customers': total_customers,
        'active_customers': active_customers,
        'inactive_customers': total_customers - active_customers,
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'avg_order_value': round(avg_order_value, 2),
        'new_customers_this_month': new_customers_this_month
    }
    
    return Response(stats)


# Additional utility views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_customers(request):
    """
    Bulk update multiple customers (e.g., activate/deactivate multiple customers)
    """
    customer_ids = request.data.get('customer_ids', [])
    action = request.data.get('action')  # 'activate' or 'deactivate'
    
    if not customer_ids:
        return Response(
            {'error': 'customer_ids is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if action not in ['activate', 'deactivate']:
        return Response(
            {'error': 'action must be either "activate" or "deactivate"'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    customers = Customer.objects.filter(id__in=customer_ids)
    
    if action == 'activate':
        customers.update(is_active=True)
    else:
        customers.update(is_active=False)
    
    return Response({
        'message': f'Successfully {action}d {customers.count()} customers',
        'affected_count': customers.count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def search_customers(request):
    """
    Advanced search endpoint for customers with multiple search criteria
    """
    query = request.GET.get('q', '')
    name = request.GET.get('name', '')
    email = request.GET.get('email', '')
    phone = request.GET.get('phone', '')
    
    customers = Customer.objects.filter(is_active=True)
    
    if query:
        customers = customers.filter(
            Q(name__icontains=query) | 
            Q(email__icontains=query) | 
            Q(phone__icontains=query)
        )
    
    if name:
        customers = customers.filter(name__icontains=name)
    
    if email:
        customers = customers.filter(email__icontains=email)
    
    if phone:
        customers = customers.filter(phone__icontains=phone)
    
    customers = customers.order_by('name')[:10]  # Limit to 10 results for search
    
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data)