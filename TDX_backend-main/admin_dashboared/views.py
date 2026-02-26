from django.contrib.auth import get_user_model
from django.db.models import Count

from accounts.models import Supplier, ExpenseCategory, Expense
from accounts.serializers import SupplierSerializer
# Supplier Views

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, AllowAny
from inventory.models import Design, PrivateDesignPeople, FabricType, OrderType, FabricInventory, Fabric, FabricCut
from order.models import Order, Quotation

User = get_user_model()
from admin_dashboared.serializers import *
from accounts.permissions import*
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter


# Admin Login View
class AdminLoginView(generics.CreateAPIView):
    """
    Admin login with phone and password
    """
    serializer_class = AdminLoginSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        response_data = serializer.validated_data
        return Response(response_data, status=status.HTTP_200_OK)


# Design Views
class DesignListCreateView(generics.ListCreateAPIView):
    """
    List all designs or create a new design
    """
    queryset = Design.objects.all()
    serializer_class = DesignSerializer
    permission_classes = [IsAdmin]


class DesignRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a design
    """
    queryset = Design.objects.all()
    serializer_class = DesignSerializer
    permission_classes = [IsAdmin]

    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        """Force partial updates so PUT behaves like PATCH."""
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# Private Design People Views
class PrivateDesignPeopleListView(generics.ListAPIView):
    """
    List all private design assignments
    """
    queryset = PrivateDesignPeople.objects.all()
    serializer_class = PrivateDesignPeopleSerializer
    permission_classes = [IsAdmin]


class AddPrivateDesignView(generics.CreateAPIView):
    """
    Add multiple users to a private design
    """
    serializer_class = AddPrivateDesignSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        # serializer returns dict with 'created' and 'failed'
        created = result.get('created', []) if isinstance(result, dict) else result
        failed = result.get('failed', []) if isinstance(result, dict) else []

        return Response(
            {
                "message": f"Processed {len(created) + len(failed)} users",
                "created_count": len(created),
                "failed_count": len(failed),
                "data": PrivateDesignPeopleSerializer(created, many=True).data,
                "failed": failed,
            },
            status=status.HTTP_201_CREATED
        )


class PrivateDesignPeopleDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a private design assignment
    """
    queryset = PrivateDesignPeople.objects.all()
    serializer_class = PrivateDesignPeopleSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        """Allow updating the user and/or design for this assignment.

        Ensures the (design, user) pair remains unique and returns
        a clear error message when a duplicate would be created.
        """
        kwargs['partial'] = True

        instance = self.get_object()

        user_id = request.data.get('user')
        design_id = request.data.get('design')

        # If no changes provided, behave like normal partial update
        if user_id is None and design_id is None:
            return super().update(request, *args, **kwargs)

        # Lazy imports
        from django.contrib.auth import get_user_model
        from django.shortcuts import get_object_or_404

        User = get_user_model()

        # Resolve new user / design if provided
        new_user = instance.user
        new_design = instance.design

        if user_id is not None:
            new_user = get_object_or_404(User, pk=user_id)

        if design_id is not None:
            new_design = get_object_or_404(Design, pk=design_id)

        # Check uniqueness: is there another assignment with same design+user?
        exists = PrivateDesignPeople.objects.filter(design=new_design, user=new_user).exclude(pk=instance.pk).exists()
        if exists:
            return Response(
                {"detail": "This user is already assigned to the specified design."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Apply changes and save
        changed_fields = []
        if new_user.pk != instance.user.pk:
            instance.user = new_user
            changed_fields.append('user')
        if new_design.pk != instance.design.pk:
            instance.design = new_design
            changed_fields.append('design')

        if changed_fields:
            instance.save(update_fields=changed_fields)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# Fabric Type CRUD Views
class FabricTypeListCreateView(generics.ListCreateAPIView):
    """
    List all fabric types or create a new fabric type
    """
    queryset = FabricType.objects.all()
    serializer_class = FabricTypeSerializer
    permission_classes = [IsAdmin]
    pagination_class = None  # Disable pagination for dropdown lists



class FabricTypeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a fabric type
    """
    queryset = FabricType.objects.all()
    serializer_class = FabricTypeSerializer
    permission_classes = [IsAdmin]

    lookup_field = 'pk'


# Order Type CRUD Views
class OrderTypeListCreateView(generics.ListCreateAPIView):
    """
    List all order types or create a new order type
    """
    queryset = OrderType.objects.all()
    serializer_class = OrderTypeSerializer
    permission_classes = [IsAdmin]
    pagination_class = None  # Disable pagination for dropdown lists




class OrderTypeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete an order type
    """
    queryset = OrderType.objects.all()
    serializer_class = OrderTypeSerializer
    permission_classes = [IsAdmin]

    lookup_field = 'pk'


# Fabric CRUD Views
class FabricListCreateView(generics.ListCreateAPIView):
    """
    List all fabrics or create a new fabric
    """
    queryset = Fabric.objects.all()
    serializer_class = FabricSerializer
    permission_classes = [IsAdmin]


class FabricRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a fabric
    """
    queryset = Fabric.objects.all()
    serializer_class = FabricSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        """Force partial updates so PUT behaves like PATCH."""
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# Fabric Cut CRUD Views
class FabricCutListCreateView(generics.ListCreateAPIView):
    """
    List all fabric cuts or create a new fabric cut
    """
    queryset = FabricCut.objects.all()
    serializer_class = FabricCutSerializer
    permission_classes = [IsAdmin]


class FabricCutRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a fabric cut
    """
    queryset = FabricCut.objects.all()
    serializer_class = FabricCutSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        """Force partial updates so PUT behaves like PATCH."""
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# Fabric Inventory CRUD Views
class FabricInventoryListCreateView(generics.ListCreateAPIView):
    """
    List all fabric inventories or create a new fabric inventory
    """
    queryset = FabricInventory.objects.all()
    serializer_class = FabricInventorySerializer
    permission_classes = [IsAdmin]


class FabricInventoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a fabric inventory
    """
    queryset = FabricInventory.objects.all()
    serializer_class = FabricInventorySerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'


# Admin Order Views
class AdminOrderListView(generics.ListAPIView):
    """
    List all orders with filtering by status and fabric_source, search by order_id/customer_name/email
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'fabric_source']
    search_fields = ['order_id', 'user__email', 'user__fullname']
    
    def get_queryset(self):
        return Order.objects.all().select_related('user', 'order_type', 'fabric_type', 'fabric_inventory', 'design')


class AdminOrderDetailView(generics.RetrieveAPIView):
    """
    Retrieve order detail with all nested information
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'


class AdminAddQuotationView(generics.CreateAPIView):
    """
    Add quotation to a specific order (admin only)
    """
    permission_classes = [IsAdmin]
    
    def create(self, request, *args, **kwargs):
        order_id = self.kwargs.get('order_id')
        
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if quotation already exists
        if hasattr(order, 'quotation'):
            return Response(
                {'error': 'Quotation already exists for this order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = request.data
        data['admin'] = request.user.id
        
        try:
            quotation = Quotation.objects.create(
                order=order,
                admin=request.user,
                title=data.get('title'),
                description=data.get('description'),
                min_quantity=data.get('min_quantity'),
                price=data.get('price')
            )
            serializer = QuotationSerializer(quotation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SupplierListCreateView(generics.ListCreateAPIView):
    """
    List all suppliers or create a new supplier
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdmin]

class SupplierRetrieveUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a supplier
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'


class CustomerListView(generics.ListAPIView):
    """
    List all registered customers (User with role=customer). Used by admin Customer Database.
    When a user registers via /api/register/, they are created with role=customer and appear here.
    """
    serializer_class = CustomerListSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return (
            User.objects.filter(role='customer')
            .annotate(order_count=Count('orders'))
            .order_by('-created_at')
        )


# --- Expense Categories ---
class ExpenseCategoryListCreateView(generics.ListCreateAPIView):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAdmin]


class ExpenseCategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'


# --- Expenses ---
class ExpenseListCreateView(generics.ListCreateAPIView):
    queryset = Expense.objects.all().select_related('category')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAdmin]


class ExpenseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all().select_related('category')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'