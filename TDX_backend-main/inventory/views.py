from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from inventory.models import UserDesign, DesignStudio, Fabric, FabricCut
from inventory.serializers import *
from accounts .permissions import*

# User Design CRUD Views
class UserDesignListCreateView(generics.ListCreateAPIView):
    """
    List all user designs or create a new user design
    """
    serializer_class = UserDesignSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        # Return only designs for the authenticated user
        return UserDesign.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Set the user from JWT token
        serializer.save(user=self.request.user)


class UserDesignRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a user design
    """
    serializer_class = UserDesignSerializer
    permission_classes = [IsCustomer]
    lookup_field = 'pk'

    def get_queryset(self):
        # Return only designs for the authenticated user
        return UserDesign.objects.filter(user=self.request.user)


# Design Studio CRUD Views
class DesignStudioListCreateView(generics.ListCreateAPIView):
    """
    List all design studios or create a new design studio
    """
    serializer_class = DesignStudioSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        # Return only design studios for the authenticated user
        return DesignStudio.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Set the user from JWT token
        serializer.save(user=self.request.user)



class DesignStudioRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (partial), or delete a design studio
    """
    serializer_class = DesignStudioSerializer
    permission_classes = [IsCustomer]
    lookup_field = 'pk'

    def get_queryset(self):
        # Return only design studios for the authenticated user
        return DesignStudio.objects.filter(user=self.request.user)
    def update(self, request, *args, **kwargs):
        """Force partial updates so PUT behaves like PATCH."""
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
    

# Fabric Dropdown View
class FabricDropdownView(generics.ListAPIView):
    """
    Get all fabrics for dropdown selection
    """
    queryset = Fabric.objects.all()
    serializer_class = FabricDropdownSerializer
    permission_classes = [IsCustomer]



# Fabric Cut Dropdown View
class FabricCutDropdownView(generics.ListAPIView):
    """
    Get all fabric cuts for dropdown selection
    """
    queryset = FabricCut.objects.all()
    serializer_class = FabricCutDropdownSerializer
    permission_classes = [IsCustomer]

