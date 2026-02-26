from django.urls import path
from order.views import *

urlpatterns = [
    # Customer Order endpoints
    path('add/', OrderListCreateView.as_view(), name='order-list-create'),
    path('details/<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('payment/<str:order_id>/', PaymentCreateView.as_view(), name='payment-create'),
    
    # Fabric Inventory filtered by fabric_type
    path('fabric-inventory/', FabricInventoryFilteredView.as_view(), name='fabric-inventory-filtered'),
    # Public designs and fabric types for order step
    path('designs/', DesignListForOrderView.as_view(), name='design-list-for-order'),
    path('fabric-types/', FabricTypeListForOrderView.as_view(), name='fabric-type-list-for-order'),
    path('order-types/', OrderTypeListForOrderView.as_view(), name='order-type-list-for-order'),
]
