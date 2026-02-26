from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from order.models import Order, Payment, Quotation
from order.serializers import *
from inventory.models import FabricInventory, Design, FabricType, OrderType

from accounts.permissions import IsCustomer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter


# Customer Views
class OrderListCreateView(generics.ListCreateAPIView):
    """
    List all orders for the authenticated user or create a new order
    """
    serializer_class = OrderSerializer
    permission_classes = [IsCustomer]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_class(self):
        # Use a compact list serializer for GET (list) and the full serializer for create
        if self.request.method == 'GET':
            return OrderListSerializer
        return OrderSerializer


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete an order (customer view)
    """
    serializer_class = OrderSerializer
    permission_classes = [IsCustomer]
    lookup_field = 'order_id'
    lookup_url_kwarg = 'order_id'
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class PaymentCreateView(generics.CreateAPIView):
    """
    Create a payment for an order (factory_provide fabric_source only)
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsCustomer]
    
    def create(self, request, *args, **kwargs):
        order_id = self.kwargs.get('order_id')
        
        try:
            order = Order.objects.get(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if order.fabric_source != 'factory_provide':
            return Response(
                {'error': 'Payment is only for factory_provide fabric source'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if hasattr(order, 'payment'):
            return Response(
                {'error': 'Payment already exists for this order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_type = request.data.get('type')
        
        # Validate file requirement
        if payment_type == 'instant_pay' and 'file' not in request.FILES:
            return Response(
                {'error': 'File is required for instant_pay payment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create payment
        payment = Payment.objects.create(
            order=order,
            type=payment_type,
            file=request.FILES.get('file') if 'file' in request.FILES else None
        )
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FabricInventoryFilteredView(generics.ListAPIView):
    """
    Get all fabric inventories filtered by fabric_type (for order step).
    """
    serializer_class = FabricInventoryListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['fabric_type']

    def get_queryset(self):
        return FabricInventory.objects.all()


class DesignListForOrderView(generics.ListAPIView):
    """
    List public designs for the order step (website).
    """
    serializer_class = DesignListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Design.objects.filter(status='public')


class FabricTypeListForOrderView(generics.ListAPIView):
    """
    List fabric types for the order step (website) to map sublimation/natural.
    """
    serializer_class = FabricTypeListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return FabricType.objects.all()


class OrderTypeListForOrderView(generics.ListAPIView):
    """
    List order types for the order step (website) to map order/sample.
    """
    serializer_class = OrderTypeListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return OrderType.objects.all()
