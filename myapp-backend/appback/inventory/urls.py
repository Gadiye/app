from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnifiedInventoryViewSet as InventoryViewSet  # ✅ removed FinishedStockViewSet

router = DefaultRouter()
router.register(r'inventory', InventoryViewSet)  # ✅ this handles everything now

urlpatterns = [
    path('', include(router.urls)),
]
