# payslips/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayslipViewSet

router = DefaultRouter()
router.register(r'', PayslipViewSet, basename='payslip')

urlpatterns = [
    path('', include(router.urls)),
]