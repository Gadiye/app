from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtisanViewSet

router = DefaultRouter()
router.register(r'artisans', ArtisanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]