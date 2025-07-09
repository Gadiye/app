from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, PriceHistoryViewSet, get_price  # <- import the view

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')
router.register(r'price-history', PriceHistoryViewSet, basename='pricehistory')

urlpatterns = [
    path('get_price/', get_price, name='get_price'),  # <- add this line
    path('', include(router.urls)),
]
