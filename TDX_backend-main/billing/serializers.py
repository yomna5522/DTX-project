from rest_framework import serializers
from decimal import Decimal
from production.models import ProductionRun, CustomerEntity
from .models import Invoice, InvoiceLineItem


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = [
            'id', 'design_ref', 'fabric', 'total_meters', 'price_per_meter',
            'line_total', 'production_run_ids'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'bill_number', 'customer_entity', 'customer_name',
            'period_start', 'period_end', 'lines', 'subtotal', 'discount_pct',
            'discount_amount', 'after_discount', 'vat_pct', 'vat_amount', 'total',
            'status', 'notes', 'issued_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'subtotal', 'discount_amount', 'after_discount',
            'vat_amount', 'total', 'created_at', 'updated_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['id'] = str(instance.pk)
        data['customer_entity_id'] = str(instance.customer_entity_id)
        data.pop('customer_entity', None)
        for line in data.get('lines', []):
            line['total_meters'] = float(line['total_meters'])
            line['price_per_meter'] = float(line['price_per_meter'])
            line['line_total'] = float(line['line_total'])
        data['subtotal'] = float(instance.subtotal)
        data['discount_amount'] = float(instance.discount_amount)
        data['after_discount'] = float(instance.after_discount)
        data['vat_amount'] = float(instance.vat_amount)
        data['total'] = float(instance.total)
        return data


class CreateInvoiceSerializer(serializers.Serializer):
    """Body for creating an invoice from approved runs."""
    customer_entity_id = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    run_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)
    discount_pct = serializers.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0'))
    vat_pct = serializers.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0'))
    notes = serializers.CharField(required=False, allow_blank=True)
