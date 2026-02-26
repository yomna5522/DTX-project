from django.db import models
from production.models import CustomerEntity


INVOICE_STATUS_CHOICES = [
    ('DRAFT', 'Draft'),
    ('ISSUED', 'Issued'),
    ('PAID', 'Paid'),
    ('CANCELLED', 'Cancelled'),
]


class Invoice(models.Model):
    """Invoice document — the billing artefact."""
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    bill_number = models.PositiveIntegerField()  # Sequential per customer
    customer_entity = models.ForeignKey(
        CustomerEntity, on_delete=models.PROTECT, related_name='invoices'
    )
    customer_name = models.CharField(max_length=255)  # Snapshot at creation
    period_start = models.DateField()
    period_end = models.DateField()
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    after_discount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    vat_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    vat_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20, choices=INVOICE_STATUS_CHOICES, default='DRAFT'
    )
    notes = models.TextField(blank=True)
    issued_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.invoice_number or f"Invoice {self.pk}"


class InvoiceLineItem(models.Model):
    """A single line on an invoice (aggregated from production runs)."""
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name='lines'
    )
    design_ref = models.CharField(max_length=255)
    fabric = models.CharField(max_length=255)
    total_meters = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    price_per_meter = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    production_run_ids = models.JSONField(default=list)  # List of run IDs

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.design_ref} / {self.fabric}: {self.total_meters}m"
