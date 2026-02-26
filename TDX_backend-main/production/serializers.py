from rest_framework import serializers
from .models import CustomerEntity, PricingRule, ProductionRun


class CustomerEntitySerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = CustomerEntity
        fields = [
            'id', 'display_name', 'aliases', 'default_price_per_meter',
            'default_discount_pct', 'phone', 'email', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PricingRuleSerializer(serializers.ModelSerializer):
    customer_entity_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomerEntity.objects.all(), source='customer_entity'
    )

    class Meta:
        model = PricingRule
        fields = ['id', 'customer_entity_id', 'fabric', 'design_ref', 'price_per_meter', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductionRunSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    customer_entity_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomerEntity.objects.all(), source='customer_entity'
    )

    class Meta:
        model = ProductionRun
        fields = [
            'id', 'date', 'machine', 'customer_entity_id', 'design_ref', 'fabric',
            'meters_printed', 'quantity', 'notes', 'source_order_id',
            'billing_status', 'invoice_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'billing_status', 'invoice_id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['id'] = str(instance.pk)
        data['customer_entity_id'] = str(instance.customer_entity_id)
        data['meters_printed'] = float(instance.meters_printed)
        if instance.quantity is not None:
            data['quantity'] = instance.quantity
        return data


class ProductionRunListSerializer(serializers.ModelSerializer):
    customer_entity_id = serializers.SerializerMethodField()

    class Meta:
        model = ProductionRun
        fields = [
            'id', 'date', 'machine', 'customer_entity_id', 'design_ref', 'fabric',
            'meters_printed', 'quantity', 'notes', 'source_order_id',
            'billing_status', 'invoice_id', 'created_at', 'updated_at'
        ]

    def get_customer_entity_id(self, obj):
        return str(obj.customer_entity_id)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['id'] = str(instance.pk)
        data['meters_printed'] = float(instance.meters_printed)
        return data
