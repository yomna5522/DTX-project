from django.db import models


class CustomerEntity(models.Model):
    """Customer for production & billing (distinct from accounts.User)."""
    display_name = models.CharField(max_length=255)
    aliases = models.JSONField(default=list, blank=True)  # e.g. ["Palma.7", "بالما"]
    default_price_per_meter = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    default_discount_pct = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_name']

    def __str__(self):
        return self.display_name


class PricingRule(models.Model):
    """Per-customer pricing override by fabric and/or design."""
    customer_entity = models.ForeignKey(
        CustomerEntity, on_delete=models.CASCADE, related_name='pricing_rules'
    )
    fabric = models.CharField(max_length=255, blank=True)
    design_ref = models.CharField(max_length=255, blank=True)
    price_per_meter = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['customer_entity', 'fabric', 'design_ref']

    def __str__(self):
        return f"{self.customer_entity.display_name}: {self.fabric or 'any'} / {self.design_ref or 'any'} = {self.price_per_meter}"


BILLING_STATUS_CHOICES = [
    ('DRAFT', 'Draft'),
    ('APPROVED', 'Approved'),
    ('INVOICED', 'Invoiced'),
]


class ProductionRun(models.Model):
    """A single production run — one row in the daily machine diary."""
    date = models.DateField()
    machine = models.CharField(max_length=255)
    customer_entity = models.ForeignKey(
        CustomerEntity, on_delete=models.PROTECT, related_name='runs'
    )
    design_ref = models.CharField(max_length=255)
    fabric = models.CharField(max_length=255)
    meters_printed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quantity = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    source_order_id = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    billing_status = models.CharField(
        max_length=20, choices=BILLING_STATUS_CHOICES, default='DRAFT'
    )
    invoice_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.date} {self.design_ref} ({self.meters_printed}m)"
