from rest_framework import serializers
from order.models import Order, Payment, Quotation
from inventory.models import OrderType, FabricType, FabricInventory, Design, DesignStudio


class FabricTypeListSerializer(serializers.ModelSerializer):
    """Serializer for FabricType list (order step)."""
    class Meta:
        model = FabricType
        fields = ['id', 'name']
        read_only_fields = ['id']


class OrderTypeListSerializer(serializers.ModelSerializer):
    """Serializer for OrderType list (order step)."""
    class Meta:
        model = OrderType
        fields = ['id', 'name']
        read_only_fields = ['id']


class FabricInventoryListSerializer(serializers.ModelSerializer):
    """Serializer for FabricInventory list view (order step). Includes fabric_type for client-side filter when no types."""
    fabric_type = FabricTypeListSerializer(read_only=True)

    class Meta:
        model = FabricInventory
        fields = ['id', 'name', 'description', 'min_quantity', 'available_meter', 'image', 'price', 'fabric_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DesignListSerializer(serializers.ModelSerializer):
    """Serializer for Design list view"""
    class Meta:
        model = Design
        fields = ['id', 'name', 'description', 'file', 'price', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'type', 'file', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuotationSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.fullname', read_only=True)
    
    class Meta:
        model = Quotation
        fields = ['id', 'title', 'description', 'min_quantity', 'price', 'admin_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    order_type = serializers.SerializerMethodField()
    fabric_type = serializers.SerializerMethodField()
    fabric_inventory = serializers.SerializerMethodField()
    design = serializers.SerializerMethodField()
    design_studio = serializers.SerializerMethodField()
    payment = PaymentSerializer(read_only=True)
    quotation = QuotationSerializer(read_only=True)
    
    # Write-only IDs for input
    order_type_id = serializers.IntegerField(write_only=True, required=True)
    fabric_type_id = serializers.IntegerField(write_only=True, required=True)
    fabric_inventory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    design_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    design_studio_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'status', 'order_type', 'order_type_id', 'fabric_type', 'fabric_type_id',
            'fabric_inventory', 'fabric_inventory_id', 'fabric_source', 'design', 'design_id',
            'design_studio', 'design_studio_id',
            'custom_design', 'quantity', 'total_amount', 'notes', 'payment', 'quotation',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_id', 'status', 'total_amount', 'payment', 'quotation', 'created_at', 'updated_at']
    
    def get_order_type(self, obj):
        return {'id': obj.order_type.id, 'name': obj.order_type.name} if obj.order_type else None
    
    def get_fabric_type(self, obj):
        return {'id': obj.fabric_type.id, 'name': obj.fabric_type.name} if obj.fabric_type else None
    
    def get_fabric_inventory(self, obj):
        if obj.fabric_inventory:
            return {
                'id': obj.fabric_inventory.id,
                'name': obj.fabric_inventory.name,
                'price': obj.fabric_inventory.price,
                'min_quantity': obj.fabric_inventory.min_quantity,
            }
        return None
    
    def get_design(self, obj):
        if obj.design:
            return {
                'id': obj.design.id,
                'name': obj.design.name,
                'file': str(obj.design.file) if obj.design.file else None,
            }
        return None

    def get_design_studio(self, obj):
        if getattr(obj, 'design_studio', None):
            ds = obj.design_studio
            return {
                'id': ds.id,
                'user_id': ds.user.id if ds.user else None,
                'file': str(ds.file) if ds.file else None,
                'width': ds.width if hasattr(ds, 'width') else None,
                'height': ds.height if hasattr(ds, 'height') else None,
            }
        return None
    
    def validate(self, data):
        fabric_source = data.get('fabric_source')
        fabric_inventory_id = data.get('fabric_inventory_id')
        quantity = data.get('quantity')
        design_id = data.get('design_id')
        design_studio_id = data.get('design_studio_id')
        custom_design = data.get('custom_design')
        # For provide/not_sure, design is optional. For factory_provide, design and fabric_inventory are required.
        # If fabric_source is "factory_provide", fabric_inventory is required
        if fabric_source == 'factory_provide' and not fabric_inventory_id:
            raise serializers.ValidationError({'fabric_inventory_id': 'fabric_inventory is required for factory_provide option'})
        
        # If fabric_source is "factory_provide", design or custom_design is required
        if fabric_source == 'factory_provide' and not design_id and not design_studio_id and not custom_design:
            raise serializers.ValidationError('Either design_id, design_studio_id or custom_design is required for factory_provide option')
        
        # If fabric_source is "factory_provide", quantity is required and must be >= min_quantity
        if fabric_source == 'factory_provide':
            if not quantity:
                raise serializers.ValidationError({'quantity': 'Quantity is required for factory_provide option'})
            try:
                fi = FabricInventory.objects.get(pk=fabric_inventory_id)
                if quantity < fi.min_quantity:
                    raise serializers.ValidationError({'quantity': f'Quantity must be at least {fi.min_quantity}'})
            except FabricInventory.DoesNotExist:
                raise serializers.ValidationError({'fabric_inventory_id': 'FabricInventory not found'})
        
        return data
    
    def create(self, validated_data):
        order_type_id = validated_data.pop('order_type_id')
        fabric_type_id = validated_data.pop('fabric_type_id')
        fabric_inventory_id = validated_data.pop('fabric_inventory_id', None)
        design_id = validated_data.pop('design_id', None)
        
        try:
            order_type = OrderType.objects.get(pk=order_type_id)
        except OrderType.DoesNotExist:
            raise serializers.ValidationError({'order_type_id': 'OrderType not found'})
        
        try:
            fabric_type = FabricType.objects.get(pk=fabric_type_id)
        except FabricType.DoesNotExist:
            raise serializers.ValidationError({'fabric_type_id': 'FabricType not found'})
        
        fabric_inventory = None
        if fabric_inventory_id:
            try:
                fabric_inventory = FabricInventory.objects.get(pk=fabric_inventory_id)
            except FabricInventory.DoesNotExist:
                raise serializers.ValidationError({'fabric_inventory_id': 'FabricInventory not found'})
        
        design = None
        if design_id:
            try:
                design = Design.objects.get(pk=design_id)
            except Design.DoesNotExist:
                raise serializers.ValidationError({'design_id': 'Design not found'})

        design_studio = None
        if validated_data.get('design_studio_id') is not None:
            # popped below, but check existence safe-guard in case validate path differs
            pass
        ds_id = validated_data.pop('design_studio_id', None)
        if ds_id:
            try:
                design_studio = DesignStudio.objects.get(pk=ds_id)
            except DesignStudio.DoesNotExist:
                raise serializers.ValidationError({'design_studio_id': 'DesignStudio not found'})
        
        # Create order
        order = Order.objects.create(
            order_type=order_type,
            fabric_type=fabric_type,
            fabric_inventory=fabric_inventory,
            design=design,
            design_studio=design_studio,
            **validated_data
        )
        
        # Calculate total_amount if fabric_source is "factory_provide"
        if order.fabric_source == 'factory_provide' and fabric_inventory:
            order.total_amount = fabric_inventory.price * order.quantity
            order.save(update_fields=['total_amount'])
        
        return order

class OrderListSerializer(serializers.ModelSerializer):
   
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'status', 'quantity', 'total_amount', 
            'created_at'
        ]
        read_only_fields = ['id', 'order_id', 'status', 'total_amount', 'created_at']