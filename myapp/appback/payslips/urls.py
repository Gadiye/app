# payslips/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayslipViewSet, ServiceRateViewSet

router = DefaultRouter()
router.register(r'', PayslipViewSet, basename='payslip')

service_rates_router = DefaultRouter()
service_rates_router.register(r'service-rates', ServiceRateViewSet, basename='service-rate')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(service_rates_router.urls)),
]