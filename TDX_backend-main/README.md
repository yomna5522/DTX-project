# TDX Backend - Order Management System

A comprehensive Django REST Framework API for managing design orders, fabric inventory, and order workflows with admin dashboard capabilities.

## Overview

This system manages a complete order flow including:
- User authentication with OTP verification
- User profile management
- Design management (public/private)
- Order creation with multiple fabric sourcing options
- Payment processing
- Admin quotations and order management
- Inventory management

## Architecture

### Applications
- **accounts**: User authentication, registration, OTP verification, profile management
- **inventory**: Design, fabric, and order type management
- **admin_dashboared**: Admin dashboard for managing designs, inventories, and orders
- **order**: Order workflow, payment, and quotation management

### Models

#### User (accounts.models)
- `email`, `phone`: Unique identifiers
- `fullname`: User's full name
- `address`: User's address
- `avatar`: Profile image
- `role`: 'admin' or 'customer'
- `is_verified`: Phone verification status

#### Design (inventory.models)
- `name`, `description`, `file`: Design information
- `price`: Design price
- `status`: 'public' or 'private'
- Can be assigned to multiple users via `PrivateDesignPeople`

#### Order (order.models)
- `order_id`: Auto-generated unique identifier
- `user`: FK to User
- `order_type`: FK to OrderType (Sample/Order)
- `fabric_type`: FK to FabricType
- `fabric_inventory`: FK to FabricInventory (optional)
- `fabric_source`: 'provide' / 'factory_provide' / 'not_sure'
- `design`: FK to Design (existing design)
- `custom_design`: File upload for custom designs
- `quantity`: Order quantity (required for factory_provide)
- `status`: pending/in_progress/done/paid/cancelled
- `total_amount`: Calculated amount (factory_provide only)
- `notes`: Text notes for provide/not_sure cases

#### Payment (order.models)
- `order`: OneToOne relation to Order
- `type`: 'instant_pay' / 'cash'
- `file`: Payment proof (required for instant_pay)
- `status`: pending/completed/cancelled

#### Quotation (order.models)
- `order`: OneToOne relation to Order
- `admin`: FK to admin User
- `title`, `description`, `min_quantity`, `price`

## Installation

### Setup Steps

1. Clone the repository
```bash
git clone <repo-url>
cd TDX_backend
```

2. Create and activate virtual environment
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Mac/Linux
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Configure environment variables
Create `.env` file in project root:
```
DEBUG=True
FLOKI_SMS_URL=<your-sms-url>
FLOKI_SMS_TOKEN=<your-sms-token>
WHATSAPP_API_URL=<your-whatsapp-url>
WHATSAPP_API_TOKEN=<your-whatsapp-token>
```

5. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser
```bash
python manage.py createsuperuser
```

7. Run development server
```bash
python manage.py runserver
```

## API Endpoints

### Authentication (api/)
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login with email/phone + password
- `POST /api/verify-otp/` - Verify OTP
- `POST /api/resend_otp/` - Resend OTP
- `POST /api/profile/` - Get user profile (GET) / Update profile (PATCH)
- `POST /api/set-password/` - Set password after OTP verification
- `POST /api/change-password/` - Change existing password

### Inventory - User (api/web/)
- `GET/POST /api/web/user-designs/` - List/Create user designs
- `GET/PATCH/DELETE /api/web/user-designs/<id>/` - Manage user design
- `GET/POST /api/web/design-studios/` - List/Create design studios
- `GET/PATCH/DELETE /api/web/design-studios/<id>/` - Manage design studio
- `GET /api/web/dropdowns/fabrics/` - Get fabric dropdown options
- `GET /api/web/dropdowns/fabric-cuts/` - Get fabric cut dropdown options

### Order - Customer (api/order/)
- `GET/POST /api/order/orders/` - List orders / Create new order
- `GET/PATCH/DELETE /api/order/orders/<id>/` - Manage specific order
- `POST /api/order/orders/<id>/payment/` - Create payment for order
- `GET /api/order/fabric-inventory/?fabric_type=<id>` - Get fabrics filtered by type

### Admin Dashboard (api/admin/)

#### Design Management
- `GET/POST /api/admin/designs/` - List/Create designs
- `GET/PATCH/DELETE /api/admin/designs/<id>/` - Manage design
- `GET/POST /api/admin/private-designs/add/` - Add multiple users to design
- `GET/PATCH/DELETE /api/admin/private-designs/people/<id>/` - Manage private design assignment

#### Inventory Management
- `GET/POST /api/admin/fabric-types/` - Manage fabric types
- `GET/POST /api/admin/order-types/` - Manage order types
- `GET/POST /api/admin/fabrics/` - Manage fabrics
- `GET/POST /api/admin/fabric-cuts/` - Manage fabric cuts
- `GET/POST /api/admin/fabric-inventory/` - Manage fabric inventory

#### Order Management
- `GET /api/admin/orders/` - List all orders (filterable by status, fabric_source; searchable by order_id, customer email/name)
- `GET /api/admin/orders/<id>/` - Get order details
- `POST /api/admin/orders/<id>/quotations/` - Add quotation to order

#### Admin Authentication
- `POST /api/admin/login/` - Admin login with email/phone + password

## Order Flow Examples

### Scenario 1: Customer Provides Fabric
```json
POST /api/order/orders/
{
  "order_type_id": 1,
  "fabric_type_id": 1,
  "fabric_source": "provide",
  "design_id": 5,
  "notes": "Please use my custom specifications",
  "quantity": null
}

Response: Order created with status "pending"
Admin can view and add quotation
```

### Scenario 2: Factory Provides Fabric
```json
POST /api/order/orders/
{
  "order_type_id": 1,
  "fabric_type_id": 1,
  "fabric_source": "factory_provide",
  "fabric_inventory_id": 3,
  "design_id": 5,
  "quantity": 100
}

Response: Order created with calculated total_amount = fabric.price * 100
Admin adds quotation → Customer creates payment
```

### Scenario 3: Not Sure About Fabric
```json
POST /api/order/orders/
{
  "order_type_id": 1,
  "fabric_type_id": 1,
  "fabric_source": "not_sure",
  "custom_design": <file>,
  "notes": "Can you suggest best fabric option?"
}

Response: Order created, admin contacts customer with quotation
```

### Payment Creation (factory_provide orders)
```json
POST /api/order/orders/<id>/payment/
{
  "type": "instant_pay",
  "file": <payment_proof_file>
}

Response: Payment created
```

### Admin Adding Quotation
```json
POST /api/admin/orders/<id>/quotations/
{
  "title": "Cotton Fabric Quote",
  "description": "100% pure cotton, premium quality",
  "min_quantity": 50,
  "price": 150.00
}

Response: Quotation linked to order
```

## Filtering & Search

### Admin Order Listing
```
GET /api/admin/orders/?status=pending&fabric_source=factory_provide&search=order123

Query Parameters:
- status: pending, in_progress, done, paid, cancelled
- fabric_source: provide, factory_provide, not_sure
- search: order_id, customer_email, customer_fullname
```

### Customer Order Listing
```
GET /api/order/orders/?status=pending

Query Parameters:
- status: pending, in_progress, done, paid, cancelled
```

## Authentication

All endpoints (except registration, login, verify-otp) require JWT token:

```
Header: Authorization: Bearer <access_token>
```

Admin endpoints require `IsAdmin` permission (user.is_admin=True).

## Key Business Logic

### Order Type
- **Sample**: Min quantity is fabric inventory's min_quantity, no additional quantity input
- **Order**: Requires quantity input with validation >= fabric inventory's min_quantity

### Fabric Source
1. **provide** (Customer Provides):
   - No payment needed
   - No quantity calculation
   - Admin sets quotation with notes/suggestions
   - Order remains in approval flow

2. **factory_provide** (Factory Provides):
   - Requires fabric_inventory selection
   - Quantity must be >= fabric_inventory.min_quantity
   - Total amount auto-calculated: fabric.price × quantity
   - Customer must create payment (instant_pay/cash)
   - Payment file required for instant_pay

3. **not_sure** (Customer Unsure):
   - Customer uploads custom design or references existing design
   - No quantity or payment
   - Admin provides quotation via text
   - Same flow as "provide"

## Response Format

### Successful Order Creation
```json
{
  "id": 1,
  "order_id": "ABC123XYZ456",
  "status": "pending",
  "order_type": {"id": 1, "name": "Order"},
  "fabric_type": {"id": 1, "name": "Cotton"},
  "fabric_inventory": {
    "id": 3,
    "name": "Premium Cotton",
    "price": "150.00",
    "min_quantity": 50
  },
  "fabric_source": "factory_provide",
  "design": {"id": 5, "name": "Floral Design"},
  "quantity": 100,
  "total_amount": "15000.00",
  "payment": null,
  "quotation": null,
  "created_at": "2026-02-23T10:30:00Z"
}
```

## Requirements

See `requirements.txt` for full dependencies. Key packages:
- Django 6.0.1
- djangorestframework 3.16.1
- djangorestframework-simplejwt 5.5.1
- django-filter 25.1
- python-dotenv 1.2.1
- Pillow 12.1.0

## Database Schema

Migrations are auto-generated. Run:
```bash
python manage.py makemigrations
python manage.py migrate
```

## Testing

Example using cURL:

```bash
# Register
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","phone":"+1234567890","password":"SecurePass123!","password_confirm":"SecurePass123!","fullname":"John Doe"}'

# Login
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Create order
curl -X POST http://localhost:8000/api/order/orders/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"order_type_id":1,"fabric_type_id":1,"fabric_source":"factory_provide","fabric_inventory_id":3,"design_id":5,"quantity":100}'
```

## Support

For issues or questions, please refer to individual app documentation or contact the development team.
