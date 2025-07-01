from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, FinishedStockViewSet

router = DefaultRouter()
router.register(r'inventory', InventoryViewSet)
router.register(r'finished-stock', FinishedStockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]