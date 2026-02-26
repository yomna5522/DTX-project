from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Design(models.Model):
    STATUS_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.ImageField(upload_to='designs/')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='public')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class PrivateDesignPeople(models.Model):
    design = models.ForeignKey(Design, on_delete=models.CASCADE, related_name='private_people')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='private_designs')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('design', 'user')

    def __str__(self):
        return f"{self.design.name} - {self.user.email}"


class FabricType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class OrderType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class FabricInventory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    min_quantity = models.IntegerField()
    available_meter = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    fabric_type = models.ForeignKey('FabricType', on_delete=models.PROTECT, related_name='inventories', null=True, blank=True)
    image = models.ImageField(upload_to='fabric_inventory/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserDesign(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_designs')
    file = models.FileField(upload_to='user_designs/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.id}"


class Fabric(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class FabricCut(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class DesignStudio(models.Model):
    REPEAT_CHOICES = [
        ('fulldrop', 'Full Drop'),
        ('halfdrop', 'Half Drop'),
        ('center', 'Center'),
        ('mirror', 'Mirror'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='design_studios')
    width = models.DecimalField(max_digits=10, decimal_places=2)
    height = models.DecimalField(max_digits=10, decimal_places=2)
    fabric = models.ForeignKey(Fabric, on_delete=models.PROTECT, related_name='design_studios')
    fabric_cut = models.ForeignKey(FabricCut, on_delete=models.PROTECT, related_name='design_studios')
    file = models.FileField(upload_to='design_studio/')
    repeat = models.CharField(max_length=10, choices=REPEAT_CHOICES, default='fulldrop')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.width}x{self.height}"
