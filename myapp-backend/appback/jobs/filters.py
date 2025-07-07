import django_filters
from .models import Job


class JobFilter(django_filters.FilterSet):
    """Custom filter for Job model."""
    created_date = django_filters.DateFromToRangeFilter()
    total_cost = django_filters.NumberFilter()
    total_cost__gte = django_filters.NumberFilter(field_name='total_cost', lookup_expr='gte')
    total_cost__lte = django_filters.NumberFilter(field_name='total_cost', lookup_expr='lte')
    
    class Meta:
        model = Job
        fields = {
            'status': ['exact', 'in'],
            'service_category': ['exact', 'in'],
            'created_by': ['exact', 'icontains'],
        }
