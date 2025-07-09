# jobs/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet #, JobItemStandaloneViewSet # Uncomment if you add standalone JobItemViewSet

router = DefaultRouter()
router.register(r'', JobViewSet, basename='job')
# router.register(r'job-items', JobItemStandaloneViewSet, basename='job-item-standalone') # Uncomment if standalone


urlpatterns = [
    path('', include(router.urls)),
]