from django.contrib import admin
from inventory.models import Design, PrivateDesignPeople, FabricType, OrderType, FabricInventory, UserDesign, Fabric, FabricCut, DesignStudio


admin.site.register(Design)
admin.site.register(PrivateDesignPeople)
admin.site.register(FabricType)
admin.site.register(OrderType)
admin.site.register(FabricInventory)
admin.site.register(UserDesign)
admin.site.register(Fabric)
admin.site.register(FabricCut)
admin.site.register(DesignStudio)

