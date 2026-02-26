from rest_framework import serializers
from inventory.models import UserDesign, DesignStudio, Fabric, FabricCut


class UserDesignSerializer(serializers.ModelSerializer):
   
    
    class Meta:
        model = UserDesign
        fields = ['id',  'file']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class FabricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FabricCutSerializer(serializers.ModelSerializer):
    class Meta:
        model = FabricCut
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DesignStudioSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    fabric_name = serializers.CharField(source='fabric.name', read_only=True)
    fabric_cut_name = serializers.CharField(source='fabric_cut.name', read_only=True)
    
    # Write-only IDs for input
    fabric_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    fabric_cut_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = DesignStudio
        fields = ['id', 'user', 'user_email', 'width', 'height', 'fabric', 'fabric_name', 'fabric_id', 'fabric_cut', 'fabric_cut_name', 'fabric_cut_id', 'file', 'repeat', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        fabric_id = validated_data.pop('fabric_id', None)
        fabric_cut_id = validated_data.pop('fabric_cut_id', None)
        
        if fabric_id is not None:
            try:
                fabric = Fabric.objects.get(pk=fabric_id)
                validated_data['fabric'] = fabric
            except Fabric.DoesNotExist:
                raise serializers.ValidationError({'fabric_id': 'Fabric not found'})
        
        if fabric_cut_id is not None:
            try:
                fabric_cut = FabricCut.objects.get(pk=fabric_cut_id)
                validated_data['fabric_cut'] = fabric_cut
            except FabricCut.DoesNotExist:
                raise serializers.ValidationError({'fabric_cut_id': 'FabricCut not found'})
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        fabric_id = validated_data.pop('fabric_id', None)
        fabric_cut_id = validated_data.pop('fabric_cut_id', None)
        
        if fabric_id is not None:
            if fabric_id == "":
                instance.fabric = None
            else:
                try:
                    fabric = Fabric.objects.get(pk=fabric_id)
                    instance.fabric = fabric
                except Fabric.DoesNotExist:
                    raise serializers.ValidationError({'fabric_id': 'Fabric not found'})
        
        if fabric_cut_id is not None:
            if fabric_cut_id == "":
                instance.fabric_cut = None
            else:
                try:
                    fabric_cut = FabricCut.objects.get(pk=fabric_cut_id)
                    instance.fabric_cut = fabric_cut
                except FabricCut.DoesNotExist:
                    raise serializers.ValidationError({'fabric_cut_id': 'FabricCut not found'})
        
        return super().update(instance, validated_data)


class FabricDropdownSerializer(serializers.ModelSerializer):
    """Simple serializer for dropdown options"""
    class Meta:
        model = Fabric
        fields = ['id', 'name']


class FabricCutDropdownSerializer(serializers.ModelSerializer):
    """Simple serializer for dropdown options"""
    class Meta:
        model = FabricCut
        fields = ['id', 'name']
