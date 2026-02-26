from django.urls import path
from inventory.views import (
    UserDesignListCreateView,
    UserDesignRetrieveUpdateDestroyView,
    DesignStudioListCreateView,
    DesignStudioRetrieveUpdateDestroyView,
    FabricDropdownView,
    FabricCutDropdownView,
)

app_name = 'inventory'

urlpatterns = [
    # User Design endpoints
    path('user-designs/', UserDesignListCreateView.as_view(), name='user-design-list-create'),
    path('user-designs/<int:pk>/', UserDesignRetrieveUpdateDestroyView.as_view(), name='user-design-detail'),
    
    # Design Studio endpoints
    path('design-studios/', DesignStudioListCreateView.as_view(), name='design-studio-list-create'),
    path('design-studios/<int:pk>/', DesignStudioRetrieveUpdateDestroyView.as_view(), name='design-studio-detail'),
    
    # Dropdown endpoints
    path('dropdowns/fabrics/', FabricDropdownView.as_view(), name='fabric-dropdown'),
    path('dropdowns/fabric-cuts/', FabricCutDropdownView.as_view(), name='fabric-cut-dropdown'),
]
