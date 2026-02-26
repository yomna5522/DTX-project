from django.db import models
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from inventory.models import Design, OrderType, FabricType, FabricInventory, DesignStudio

User = get_user_model()


def generate_order_id():
    """Generate a random order ID"""
    return get_random_string(12).upper()


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    
    FABRIC_SOURCE_CHOICES = [
        ('provide', 'Customer Provide'),
        ('factory_provide', 'Factory Provide'),
        ('not_sure', 'Not Sure'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_id = models.CharField(max_length=12, unique=True, default=generate_order_id)
    order_type = models.ForeignKey(OrderType, on_delete=models.PROTECT, related_name='orders')
    fabric_type = models.ForeignKey(FabricType, on_delete=models.PROTECT, related_name='orders')
    fabric_inventory = models.ForeignKey(FabricInventory, on_delete=models.PROTECT, null=True, blank=True, related_name='orders')
    fabric_source = models.CharField(max_length=20, choices=FABRIC_SOURCE_CHOICES)
    
    # Design: either existing design or custom design file
    design = models.ForeignKey(Design, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    # Optional design created via DesignStudio (nullable)
    design_studio = models.ForeignKey(DesignStudio, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    custom_design = models.FileField(upload_to='order_custom_designs/', null=True, blank=True)
    
    # Quantity: optional for "provide" and "not_sure", required for "factory_provide"
    quantity = models.IntegerField(null=True, blank=True)
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)  # For "provide" and "not_sure" cases
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_id} - {self.user.email}"


class Payment(models.Model):
    TYPE_CHOICES = [
        ('instant_pay', 'Instant Pay'),
        ('cash', 'Cash'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    file = models.FileField(upload_to='payment_proofs/', null=True, blank=True)  # Required for instant_pay
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment for {self.order.order_id}"


class Quotation(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='quotation')
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='quotations')
    title = models.CharField(max_length=255)
    description = models.TextField()
    min_quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Quotation for {self.order.order_id}"
