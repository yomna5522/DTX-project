from datetime import datetime
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdmin
from .models import CustomerEntity, PricingRule, ProductionRun
from .serializers import (
    CustomerEntitySerializer,
    PricingRuleSerializer,
    ProductionRunSerializer,
    ProductionRunListSerializer,
)


class CustomerEntityListCreateView(generics.ListCreateAPIView):
    queryset = CustomerEntity.objects.all()
    serializer_class = CustomerEntitySerializer
    permission_classes = [IsAdmin]


class CustomerEntityRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomerEntity.objects.all()
    serializer_class = CustomerEntitySerializer
    permission_classes = [IsAdmin]


class PricingRuleListCreateView(generics.ListCreateAPIView):
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        customer = self.request.query_params.get('customer_entity_id')
        if customer:
            qs = qs.filter(customer_entity_id=customer)
        return qs


class PricingRuleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer
    permission_classes = [IsAdmin]


class ProductionRunListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = ProductionRun.objects.all().select_related('customer_entity')
        status_filter = self.request.query_params.get('billing_status')
        if status_filter:
            qs = qs.filter(billing_status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductionRunListSerializer
        return ProductionRunSerializer

    def perform_create(self, serializer):
        run = serializer.save()
        run.billing_status = 'DRAFT'
        run.save()


class ProductionRunRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductionRun.objects.all()
    serializer_class = ProductionRunSerializer
    permission_classes = [IsAdmin]


class ProductionRunBulkApproveView(APIView):
    """Approve runs for billing. Expects JSON body: { "ids": ["1", "2", ...] }."""
    permission_classes = [IsAdmin]

    def post(self, request):
        ids = request.data.get('ids') or []
        if not isinstance(ids, list):
            return Response({'error': 'ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        count = 0
        for run_id in ids:
            try:
                run = ProductionRun.objects.get(pk=run_id)
            except (ProductionRun.DoesNotExist, ValueError):
                continue
            if run.billing_status == 'DRAFT':
                run.billing_status = 'APPROVED'
                run.save(update_fields=['billing_status', 'updated_at'])
                count += 1
        return Response({'approved': count}, status=status.HTTP_200_OK)


class ProductionRunBulkImportView(APIView):
    """
    Bulk import production runs (e.g. from Import Wizard Excel upload).
    Expects JSON body: { "runs": [ { "date", "machine", "customer_entity_id", "design_ref", "fabric",
    "meters_printed", "quantity"?, "notes"?, "source_order_id"? }, ... ] }.
    All runs are created with billing_status=DRAFT.
    Returns { "imported": N, "runs": [ { id, ... }, ... ] }.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        runs_data = request.data.get('runs')
        if not isinstance(runs_data, list):
            return Response(
                {'error': 'runs must be a list of run objects'},
                status=status.HTTP_400_BAD_REQUEST
            )
        created = []
        errors = []
        for i, item in enumerate(runs_data):
            if not isinstance(item, dict):
                errors.append({'index': i, 'error': 'Each run must be an object'})
                continue
            try:
                customer_entity_id = item.get('customer_entity_id')
                if customer_entity_id is None or customer_entity_id == '':
                    errors.append({'index': i, 'error': 'customer_entity_id is required'})
                    continue
                try:
                    customer_entity_id = int(customer_entity_id)
                except (TypeError, ValueError):
                    errors.append({'index': i, 'error': 'customer_entity_id must be a valid integer'})
                    continue
                meters = item.get('meters_printed', 0)
                try:
                    meters = float(meters)
                except (TypeError, ValueError):
                    meters = 0
                if meters <= 0:
                    errors.append({'index': i, 'error': 'meters_printed must be greater than 0'})
                    continue
                date_raw = item.get('date')
                if not date_raw:
                    errors.append({'index': i, 'error': 'date is required'})
                    continue
                if isinstance(date_raw, str):
                    try:
                        run_date = datetime.strptime(date_raw.strip()[:10], '%Y-%m-%d').date()
                    except ValueError:
                        errors.append({'index': i, 'error': 'date must be YYYY-MM-DD'})
                        continue
                else:
                    errors.append({'index': i, 'error': 'date must be a string YYYY-MM-DD'})
                    continue
                try:
                    CustomerEntity.objects.get(pk=customer_entity_id)
                except CustomerEntity.DoesNotExist:
                    errors.append({'index': i, 'error': f'customer_entity_id {customer_entity_id} not found'})
                    continue
                qty = item.get('quantity')
                if qty not in (None, ''):
                    try:
                        qty = int(qty)
                    except (TypeError, ValueError):
                        qty = None
                src_oid = item.get('source_order_id')
                if src_oid is not None and src_oid != '':
                    src_oid = str(src_oid).strip() or None
                else:
                    src_oid = None
                run = ProductionRun.objects.create(
                    date=run_date,
                    machine=str(item.get('machine') or '').strip() or 'Unknown',
                    customer_entity_id=customer_entity_id,
                    design_ref=str(item.get('design_ref') or '').strip() or 'Unknown',
                    fabric=str(item.get('fabric') or '').strip() or 'Unknown',
                    meters_printed=meters,
                    quantity=qty,
                    notes=str(item.get('notes') or '').strip(),
                    source_order_id=src_oid,
                    billing_status='DRAFT',
                )
                created.append({
                    'id': run.id,
                    'date': str(run.date),
                    'machine': run.machine,
                    'customer_entity_id': run.customer_entity_id,
                    'design_ref': run.design_ref,
                    'fabric': run.fabric,
                    'meters_printed': float(run.meters_printed),
                    'quantity': run.quantity,
                    'notes': run.notes,
                    'source_order_id': run.source_order_id,
                    'billing_status': run.billing_status,
                })
            except Exception as e:
                errors.append({'index': i, 'error': str(e)})
        return Response(
            {'imported': len(created), 'runs': created, 'errors': errors},
            status=status.HTTP_200_OK
        )
