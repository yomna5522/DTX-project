from collections import defaultdict
from decimal import Decimal
from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdmin
from production.models import ProductionRun, CustomerEntity
from .models import Invoice, InvoiceLineItem
from .serializers import InvoiceSerializer, CreateInvoiceSerializer


class InvoiceListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return Invoice.objects.all().select_related('customer_entity').prefetch_related('lines')

    def create(self, request, *args, **kwargs):
        ser = CreateInvoiceSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        run_ids = data['run_ids']
        runs = list(
            ProductionRun.objects.filter(
                pk__in=run_ids,
                billing_status='APPROVED',
                customer_entity_id=data['customer_entity_id']
            ).select_related('customer_entity')
        )
        if len(runs) != len(run_ids):
            return Response(
                {'error': 'Some runs not found or not approved or customer mismatch'},
                status=status.HTTP_400_BAD_REQUEST
            )
        customer = CustomerEntity.objects.get(pk=data['customer_entity_id'])
        period_start = data['period_start']
        period_end = data['period_end']
        discount_pct = data.get('discount_pct') or Decimal('0')
        vat_pct = data.get('vat_pct') or Decimal('0')
        notes = data.get('notes') or ''

        # Aggregate by (design_ref, fabric)
        groups = defaultdict(lambda: {'meters': Decimal('0'), 'run_ids': [], 'price_per_meter': None})
        for run in runs:
            key = (run.design_ref, run.fabric)
            groups[key]['meters'] += run.meters_printed
            groups[key]['run_ids'].append(str(run.pk))
            if groups[key]['price_per_meter'] is None and customer.default_price_per_meter:
                groups[key]['price_per_meter'] = customer.default_price_per_meter

        with transaction.atomic():
            bill_number = (
                Invoice.objects.filter(customer_entity=customer)
                .order_by('-bill_number').values_list('bill_number', flat=True).first() or 0
            ) + 1
            inv_num_max = (
                Invoice.objects.filter(invoice_number__startswith='INV-')
                .extra(select={}).values_list('invoice_number', flat=True)
            )
            next_num = 1
            for num in inv_num_max:
                try:
                    n = int(num.replace('INV-', ''))
                    next_num = max(next_num, n + 1)
                except (ValueError, AttributeError):
                    pass
            invoice_number = f'INV-{str(next_num).zfill(4)}'

            subtotal = Decimal('0')
            lines_data = []
            for (design_ref, fabric), g in groups.items():
                price = g['price_per_meter'] or Decimal('80')
                line_total = g['meters'] * price
                subtotal += line_total
                lines_data.append({
                    'design_ref': design_ref,
                    'fabric': fabric,
                    'total_meters': g['meters'],
                    'price_per_meter': price,
                    'line_total': line_total,
                    'production_run_ids': g['run_ids'],
                })

            discount_amount = subtotal * (discount_pct / 100)
            after_discount = subtotal - discount_amount
            vat_amount = after_discount * (vat_pct / 100)
            total = after_discount + vat_amount

            inv = Invoice.objects.create(
                invoice_number=invoice_number,
                bill_number=bill_number,
                customer_entity=customer,
                customer_name=customer.display_name,
                period_start=period_start,
                period_end=period_end,
                subtotal=subtotal,
                discount_pct=discount_pct,
                discount_amount=discount_amount,
                after_discount=after_discount,
                vat_pct=vat_pct,
                vat_amount=vat_amount,
                total=total,
                status='DRAFT',
                notes=notes,
            )
            for ld in lines_data:
                InvoiceLineItem.objects.create(invoice=inv, **ld)
            ProductionRun.objects.filter(pk__in=run_ids).update(
                billing_status='INVOICED', invoice_id=invoice_number
            )
        inv.refresh_from_db()
        return Response(InvoiceSerializer(inv).data, status=status.HTTP_201_CREATED)


class InvoiceRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Invoice.objects.all().prefetch_related('lines')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdmin]


class ApprovedRunsView(APIView):
    """List approved runs for a customer (and optional date range) for invoice creation."""
    permission_classes = [IsAdmin]

    def get(self, request):
        customer_id = request.query_params.get('customer_entity_id')
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')
        if not customer_id:
            return Response({'error': 'customer_entity_id required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = ProductionRun.objects.filter(
            customer_entity_id=customer_id,
            billing_status='APPROVED'
        ).select_related('customer_entity')
        if from_date:
            qs = qs.filter(date__gte=from_date)
        if to_date:
            qs = qs.filter(date__lte=to_date)
        runs = [
            {
                'id': str(r.pk),
                'date': str(r.date),
                'machine': r.machine,
                'design_ref': r.design_ref,
                'fabric': r.fabric,
                'meters_printed': float(r.meters_printed),
                'source_order_id': r.source_order_id,
            }
            for r in qs.order_by('date')
        ]
        return Response(runs, status=status.HTTP_200_OK)
