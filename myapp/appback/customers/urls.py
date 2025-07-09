from django.urls import path
from .views import (
    customer_list,
    customer_detail,
    customer_orders,
    customer_metadata,
    customer_stats,
    bulk_update_customers,
    search_customers,
)

urlpatterns = [
    path('', customer_list, name='customer-list'),
    path('<int:customer_id>/', customer_detail, name='customer-detail'),
    path('<int:customer_id>/orders/', customer_orders, name='customer-orders'),
    path('metadata/', customer_metadata, name='customer-metadata'),
    path('stats/', customer_stats, name='customer-stats'),
    path('bulk-update/', bulk_update_customers, name='bulk-update-customers'),
    path('search/', search_customers, name='search-customers'),
]
