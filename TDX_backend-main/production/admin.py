from django.contrib import admin
from .models import CustomerEntity, PricingRule, ProductionRun


@admin.register(CustomerEntity)
class CustomerEntityAdmin(admin.ModelAdmin):
    list_display = ['id', 'display_name', 'default_price_per_meter', 'created_at']


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_entity', 'fabric', 'design_ref', 'price_per_meter']


@admin.register(ProductionRun)
class ProductionRunAdmin(admin.ModelAdmin):
    list_display = ['id', 'date', 'machine', 'customer_entity', 'design_ref', 'billing_status', 'source_order_id']
