from django.urls import path
from .views import (
    InvoiceListCreateView,
    InvoiceRetrieveUpdateView,
    ApprovedRunsView,
)

urlpatterns = [
    path('invoices/', InvoiceListCreateView.as_view(), name='billing-invoice-list'),
    path('invoices/<int:pk>/', InvoiceRetrieveUpdateView.as_view(), name='billing-invoice-detail'),
    path('approved-runs/', ApprovedRunsView.as_view(), name='billing-approved-runs'),
]
