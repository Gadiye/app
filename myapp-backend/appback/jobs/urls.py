from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, JobItemViewSet, JobDeliveryViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'job-items', JobItemViewSet)
router.register(r'job-deliveries', JobDeliveryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]