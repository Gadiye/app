from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnifiedInventoryViewSet as InventoryViewSet, FinishedStockViewSet

router = DefaultRouter()
router.register(r'items', InventoryViewSet)
router.register(r'finished-stock', FinishedStockViewSet) # Register FinishedStockViewSet

urlpatterns = [
    path('', include(router.urls)),
]
