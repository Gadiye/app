# artisan/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtisanViewSet # Import only the ViewSet now

router = DefaultRouter()
router.register(r'artisans', ArtisanViewSet, basename='artisan')

urlpatterns = [
    path('api/', include(router.urls)),
    # All custom actions are now nested under /api/artisans/{pk}/ or /api/artisans/
    # E.g., /api/artisans/{pk}/activate/
    # /api/artisans/{pk}/deactivate/
    # /api/artisans/{pk}/jobs/
    # /api/artisans/{pk}/payslips/
    # /api/artisans/{pk}/stats/
    # /api/artisans/metadata/ (detail=False action)
    # /api/artisans/generate-payslips/ (detail=False action)
]