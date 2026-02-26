from django.urls import path
from .views import (
    CustomerEntityListCreateView,
    CustomerEntityRetrieveUpdateDestroyView,
    PricingRuleListCreateView,
    PricingRuleRetrieveUpdateDestroyView,
    ProductionRunListCreateView,
    ProductionRunRetrieveUpdateDestroyView,
    ProductionRunBulkApproveView,
    ProductionRunBulkImportView,
)

urlpatterns = [
    path('customers/', CustomerEntityListCreateView.as_view(), name='production-customer-list'),
    path('customers/<int:pk>/', CustomerEntityRetrieveUpdateDestroyView.as_view(), name='production-customer-detail'),
    path('pricing-rules/', PricingRuleListCreateView.as_view(), name='production-pricing-list'),
    path('pricing-rules/<int:pk>/', PricingRuleRetrieveUpdateDestroyView.as_view(), name='production-pricing-detail'),
    path('runs/', ProductionRunListCreateView.as_view(), name='production-run-list'),
    path('runs/import/', ProductionRunBulkImportView.as_view(), name='production-run-bulk-import'),
    path('runs/<int:pk>/', ProductionRunRetrieveUpdateDestroyView.as_view(), name='production-run-detail'),
    path('runs/approve/', ProductionRunBulkApproveView.as_view(), name='production-run-approve'),
]
