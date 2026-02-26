# Supplier endpoints

from django.urls import path
from admin_dashboared.views import *


urlpatterns = [
    # Admin Authentication
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    
    # Design endpoints (2 endpoints: 1 for create/list, 1 for retrieve/update/delete)
    path('designs/', DesignListCreateView.as_view(), name='design-list-create'),
    path('designs/<int:pk>/', DesignRetrieveUpdateDestroyView.as_view(), name='design-detail'),
    
    # Private Design endpoints
   
    path('private-designs/add/', AddPrivateDesignView.as_view(), name='add-private-design'),
    path('private-designs/people/<int:pk>/', PrivateDesignPeopleDestroyView.as_view(), name='private-design-delete'),
    
    # Fabric Type CRUD endpoints
    path('fabric-types/', FabricTypeListCreateView.as_view(), name='fabric-type-list-create'),
    path('fabric-types/<int:pk>/', FabricTypeRetrieveUpdateDestroyView.as_view(), name='fabric-type-detail'),
    
    # Order Type CRUD endpoints
    path('order-types/', OrderTypeListCreateView.as_view(), name='order-type-list-create'),
    path('order-types/<int:pk>/', OrderTypeRetrieveUpdateDestroyView.as_view(), name='order-type-detail'),
    
    # Fabric CRUD endpoints
    path('fabrics/', FabricListCreateView.as_view(), name='fabric-list-create'),
    path('fabrics/<int:pk>/', FabricRetrieveUpdateDestroyView.as_view(), name='fabric-detail'),
    
    # Fabric Cut CRUD endpoints
    path('fabric-cuts/', FabricCutListCreateView.as_view(), name='fabric-cut-list-create'),
    path('fabric-cuts/<int:pk>/', FabricCutRetrieveUpdateDestroyView.as_view(), name='fabric-cut-detail'),
    
    # Fabric Inventory CRUD endpoints
    path('fabric-inventory/', FabricInventoryListCreateView.as_view(), name='fabric-inventory-list-create'),
    path('fabric-inventory/<int:pk>/', FabricInventoryRetrieveUpdateDestroyView.as_view(), name='fabric-inventory-detail'),
    
    # Admin Customer Database (registered users with role=customer)
    path('customers/', CustomerListView.as_view(), name='admin-customer-list'),
    # Admin Order endpoints
    path('orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('orders/<int:order_id>/quotations/', AdminAddQuotationView.as_view(), name='admin-add-quotation'),
    path('suppliers/', SupplierListCreateView.as_view(), name='supplier-list-create'),
    path('suppliers/<int:pk>/', SupplierRetrieveUpdateView.as_view(), name='supplier-detail'),
    # Expenses
    path('expense-categories/', ExpenseCategoryListCreateView.as_view(), name='expense-category-list-create'),
    path('expense-categories/<int:pk>/', ExpenseCategoryRetrieveUpdateDestroyView.as_view(), name='expense-category-detail'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('expenses/<int:pk>/', ExpenseRetrieveUpdateDestroyView.as_view(), name='expense-detail'),
]
