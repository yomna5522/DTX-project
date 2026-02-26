from rest_framework import serializers
from inventory.models import Design, PrivateDesignPeople, FabricType, OrderType, FabricInventory, Fabric, FabricCut
from order.models import Order, Quotation
from django.contrib.auth import get_user_model
from accounts.models import ExpenseCategory, Expense

User = get_user_model()


class DesignSerializer(serializers.ModelSerializer):
    assigned_users = serializers.SerializerMethodField()

    class Meta:
        model = Design
        fields = ['id', 'name', 'description', 'file', 'price', 'status', 'created_at', 'updated_at', 'assigned_users']
        read_only_fields = ['id', 'created_at', 'updated_at', 'assigned_users']

    def get_assigned_users(self, obj):
        """Return a list of users assigned to this design (id, email, fullname)."""
        users = []
        for rel in obj.private_people.select_related('user').all():
            u = rel.user
            users.append({
                'id': u.id,
                'email': getattr(u, 'email', None),
                'phone': getattr(u, 'phone', None),
                'fullname': getattr(u, 'fullname', None),
            })
        return users


class PrivateDesignPeopleSerializer(serializers.ModelSerializer):
    design_name = serializers.CharField(source='design.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = PrivateDesignPeople
        fields = ['id', 'design', 'user', 'design_name', 'user_email', 'created_at']
        read_only_fields = ['id', 'created_at']


class AddPrivateDesignSerializer(serializers.Serializer):
    """Serializer to add multiple users to a private design"""
    design_id = serializers.IntegerField()
    user_ids = serializers.ListField(child=serializers.IntegerField())

    def create(self, validated_data):
        design_id = validated_data['design_id']
        user_ids = validated_data['user_ids']

        try:
            design = Design.objects.get(id=design_id)
        except Design.DoesNotExist:
            raise serializers.ValidationError("Design not found")

        created_objects = []
        failed = []
        for user_id in user_ids:
            # Validate user existence
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                failed.append({"user_id": user_id, "reason": "User not found"})
                continue

            # Skip if assignment already exists
            if PrivateDesignPeople.objects.filter(design=design, user=user).exists():
                failed.append({"user_id": user_id, "reason": "Already assigned"})
                continue

            try:
                private_design = PrivateDesignPeople.objects.create(
                    design=design,
                    user=user
                )
                created_objects.append(private_design)
            except Exception as e:
                failed.append({"user_id": user_id, "reason": str(e)})

        return {"created": created_objects, "failed": failed}


class FabricTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FabricType
        fields = ['id', 'name', ]
        read_only_fields = ['id', ]


class OrderTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderType
        fields = ['id', 'name']
        read_only_fields = ['id']


class FabricInventorySerializer(serializers.ModelSerializer):
    fabric_type = FabricTypeSerializer(read_only=True)
    fabric_type_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = FabricInventory
        fields = ['id', 'name', 'description', 'min_quantity', 'available_meter', 'image', 'price', 'fabric_type', 'fabric_type_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        fabric_type_id = validated_data.pop('fabric_type_id', None)
        if fabric_type_id:
            try:
                ft = FabricType.objects.get(pk=fabric_type_id)
                validated_data['fabric_type'] = ft
            except FabricType.DoesNotExist:
                raise serializers.ValidationError({'fabric_type_id': 'Invalid fabric_type id'})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        fabric_type_id = validated_data.pop('fabric_type_id', None)
        if fabric_type_id is not None:
            if fabric_type_id == "":
                instance.fabric_type = None
            else:
                try:
                    ft = FabricType.objects.get(pk=fabric_type_id)
                    instance.fabric_type = ft
                except FabricType.DoesNotExist:
                    raise serializers.ValidationError({'fabric_type_id': 'Invalid fabric_type id'})
        return super().update(instance, validated_data)


class AdminLoginSerializer(serializers.Serializer):
    """Serializer for admin login with phone/email and password"""
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip()
        phone = (attrs.get("phone") or "").strip()
        password = attrs.get("password")

        # Check if at least one identifier is provided
        if not email and not phone:
            raise serializers.ValidationError("Please provide either email or phone number")

        # Default admin credentials: identifier "admin" -> lookup by email admin@localhost
        if email == "admin" or phone == "admin":
            email = "admin@localhost"
            phone = ""

        user = None

        # Try to find user by email first
        if email:
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                pass

        # If not found by email, try phone
        if not user and phone:
            try:
                user = User.objects.get(phone=phone)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError("Invalid email/phone or password")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email/phone or password")

        if not user.is_admin:
            raise serializers.ValidationError("This account is not an admin account")

        if not user.is_verified:
            raise serializers.ValidationError("Account is not verified")

        from accounts.utils import generate_jwt_tokens
        tokens = generate_jwt_tokens(user)
        role = "admin" if user.is_admin else "customer"

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "fullname": user.fullname,
                "is_verified": user.is_verified,
                "is_admin": user.is_admin,
                "role": role
            },
            **tokens
        }


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


# Order and Quotation Serializers for Admin
class QuotationSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.fullname', read_only=True)
    
    class Meta:
        model = Quotation
        fields = ['id', 'title', 'description', 'min_quantity', 'price', 'admin_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    order_type_name = serializers.CharField(source='order_type.name', read_only=True)
    fabric_type_name = serializers.CharField(source='fabric_type.name', read_only=True)
    fabric_inventory_info = serializers.SerializerMethodField()
    design_info = serializers.SerializerMethodField()
    user_info = serializers.SerializerMethodField()
    quotation = QuotationSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'user_info', 'status', 'order_type_name', 'fabric_type_name',
            'fabric_inventory_info', 'fabric_source', 'design_info', 'custom_design', 'quantity',
            'total_amount', 'notes', 'quotation', 'created_at', 'updated_at'
        ]
        read_only_fields = fields
    
    def get_fabric_inventory_info(self, obj):
        if obj.fabric_inventory:
            return {
                'id': obj.fabric_inventory.id,
                'name': obj.fabric_inventory.name,
                'price': obj.fabric_inventory.price,
                'min_quantity': obj.fabric_inventory.min_quantity,
            }
        return None
    
    def get_design_info(self, obj):
        if obj.design:
            return {
                'id': obj.design.id,
                'name': obj.design.name,
                'file': str(obj.design.file) if obj.design.file else None,
            }
        return None
    
    def get_user_info(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'phone': obj.user.phone,
            'fullname': obj.user.fullname,
        }



class OrderListSerializer(serializers.ModelSerializer):
    order_type_name = serializers.CharField(source='order_type.name', read_only=True)
    fabric_type_name = serializers.CharField(source='fabric_type.name', read_only=True)
    fabric_inventory_info = serializers.SerializerMethodField()
    design_info = serializers.SerializerMethodField()
    user_info = serializers.SerializerMethodField()
    quotation = QuotationSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'user_info', 'status', 'order_type_name', 'fabric_type_name',
            'fabric_inventory_info', 'fabric_source', 'design_info', 'custom_design', 'quantity',
            'total_amount', 'notes', 'quotation', 'created_at', 'updated_at'
        ]
        read_only_fields = fields


class CustomerListSerializer(serializers.ModelSerializer):
    """Registered customers (User with role=customer) for admin Customer Database."""
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'fullname', 'is_verified', 'is_active',
            'created_at', 'order_count',
        ]
        read_only_fields = fields


class ExpenseCategorySerializer(serializers.ModelSerializer):
    """Name required."""
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExpenseSerializer(serializers.ModelSerializer):
    """Description, amount, category, date required; paid_to, payment_method optional."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    paid_to = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_name', 'description', 'amount', 'date',
            'paid_to', 'status', 'payment_method', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name']

    def validate_paid_to(self, value):
        return (value or '').strip() or None

    def validate_payment_method(self, value):
        return (value or '').strip() or None