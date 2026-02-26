# API Endpoints — Frontend Reference

Base URL (adjust for environment): `https://your-domain.com` or `http://localhost:8000`

---

## Authentication

All endpoints **except** the following require a valid JWT in the `Authorization` header:
- `POST /api/register/`
- `POST /api/login/`
- `POST /api/verify-otp/`
- `POST /api/resend_otp/`
- `POST /api/admin/login/`

**Header:**
```http
Authorization: Bearer <access_token>
```

**Token refresh:** Use `POST /api/token/refresh/` with body `{ "refresh": "<refresh_token>" }` to get a new `access` token.

---

## 1. Authentication (`/api/`)

### 1.1 Register

**`POST /api/register/`**

**Permission:** Public (no auth).

**Request body (JSON or form-data; use form-data if sending `avatar` file):**

| Field            | Type   | Required | Description |
|------------------|--------|----------|-------------|
| `email`          | string | Yes      | Unique email (stored lowercased). |
| `phone`          | string | Yes      | 10–13 digits, optional leading `+`. Must be unique. |
| `password`       | string | Yes      | Min 8 chars; must include uppercase, lowercase, digit, special char. |
| `password_confirm` | string | Yes    | Must match `password`. |
| `fullname`       | string | No       | Display name. |
| `avatar`         | file   | No       | Image file (e.g. profile picture). |

**Success response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+1234567890",
  "fullname": "John Doe",
  "avatar": "http://.../media/uploads/profile/...",
  "is_verified": false,
  "is_admin": false,
  "role": "customer",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "message": "OTP sent to your phone"
}
```

**Validation errors (400):** e.g. `{"email": ["Email is already registered."]}`, `{"phone": ["Phone number is already registered."]}`, `{"password_confirm": ["Passwords do not match."]}`.

---

### 1.2 Login

**`POST /api/login/`**

**Permission:** Public.

**Request body (JSON):**

| Field     | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `email`   | string | No*      | User email. *At least one of `email` or `phone` required. |
| `phone`   | string | No*      | User phone. |
| `password`| string | Yes      | Password. |

**Success response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+1234567890",
    "fullname": "John Doe",
    "is_verified": true,
    "is_admin": false,
    "role": "customer"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Errors (400):** `"Please provide either email or phone number"`, `"Invalid email/phone or password"`, `"Account is not verified"`.

---

### 1.3 Verify OTP

**`POST /api/verify-otp/`**

**Permission:** Public.

**Request body (JSON):**

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `phone`  | string | Yes      | User phone. |
| `otp`    | string | Yes      | 6-digit OTP received by SMS. |

**Query (optional):**

| Param   | Type   | Default | Description |
|---------|--------|---------|-------------|
| `forget`| string | `"false"` | `"true"` for password-reset flow; returns tokens. |

**Success response (200) — normal verification:**
```json
{
  "message": "Phone verified successfully"
}
```

**Success response (200) — forget password (`?forget=true`):**
```json
{
  "message": "OTP verified for password reset",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Errors (400):** `"Phone and OTP are required"`, `"Invalid OTP"`, `"OTP expired"`. (404: `"User with this phone not found"`.)

---

### 1.4 Resend OTP

**`POST /api/resend_otp/`**

**Permission:** Public.

**Request body (JSON):**

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| `phone`| string | Yes      | User phone. |

**Query (optional):**

| Param   | Type   | Default | Description |
|---------|--------|---------|-------------|
| `forget`| string | `"false"` | `"true"` for password-reset flow (allows resend even if already verified). |

**Success response (200):**
```json
{
  "message": "OTP sent successfully"
}
```

**Errors:**  
- 400: `"Phone is required"`, `"Phone already verified"` (when not forget flow).  
- 404: `"User with this phone not found"`.  
- 429: `{"error": "OTP already sent", "retry_after_seconds": 120}`.  
- 500: `{"error": "Failed to send OTP"}`.

---

### 1.5 Set password (after OTP / first-time)

**`POST /api/set-password/`**

**Permission:** Authenticated (JWT).

**Request body (JSON):**

| Field                | Type   | Required | Description |
|----------------------|--------|----------|-------------|
| `new_password`       | string | Yes      | Same rules as registration. |
| `new_password_confirm` | string | Yes   | Must match `new_password`. |

**Success response (200):**
```json
{
  "message": "Password set successfully"
}
```

**Errors (400):** e.g. password validation or `{"new_password_confirm": ["Passwords do not match."]}`.

---

### 1.6 Change password

**`POST /api/change-password/`**

**Permission:** Authenticated (JWT).

**Request body (JSON):**

| Field                | Type   | Required | Description |
|----------------------|--------|----------|-------------|
| `old_password`       | string | Yes      | Current password. |
| `new_password`       | string | Yes      | New password (same rules as registration). |
| `new_password_confirm` | string | Yes   | Must match `new_password`. |

**Success response (200):**
```json
{
  "message": "Password changed successfully."
}
```

**Errors (400):** `{"error": "Old password is incorrect."}` or validation errors.

---

### 1.7 Profile — Get / Update

**`GET /api/profile/`** — Get current user profile.  
**`PATCH /api/profile/`** — Partial update (only send fields to change).

**Permission:** Authenticated (JWT).

**Request body for PATCH (JSON or form-data if `avatar` file):**

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `fullname` | string | No    | Display name. |
| `address`  | string | No    | Address text. |
| `avatar`   | file   | No    | Profile image. |

**Note:** `id`, `email`, `phone`, `is_verified`, `is_admin`, `role`, `created_at` are read-only and cannot be updated via this endpoint.

**Success response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+1234567890",
  "fullname": "John Doe",
  "avatar": "http://.../media/uploads/profile/...",
  "address": null,
  "is_verified": true,
  "is_admin": false,
  "role": "customer",
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

### 1.8 Token refresh

**`POST /api/token/refresh/`**

**Permission:** Public (requires valid refresh token in body).

**Request body (JSON):**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 2. Inventory — User / Web (`/api/web/`)

All endpoints in this section require **customer** JWT (IsCustomer).

---

### 2.1 User designs — List & Create

**`GET /api/web/user-designs/`** — List current user’s designs.  
**`POST /api/web/user-designs/`** — Create user design (upload file).

**Request body for POST (form-data):**

| Field | Type | Required | Description |
|-------|--------|----------|-------------|
| `file` | file | Yes | Design file. |

**Success — GET (200):** Array of:
```json
{
  "id": 1,
  "file": "http://.../media/user_designs/..."
}
```

**Success — POST (201):** Same shape (single object).

---

### 2.2 User design — Retrieve / Update / Delete

**`GET /api/web/user-designs/<id>/`**  
**`PATCH /api/web/user-designs/<id>/`**  
**`DELETE /api/web/user-designs/<id>/`**

**Path:** `id` (integer) — user design primary key.

**PATCH body (form-data):** `file` (file, optional).  
**Success:** GET/PATCH 200 (object as above); DELETE 204 (no body).

---

### 2.3 Design studios — List & Create

**`GET /api/web/design-studios/`** — List current user’s design studios.  
**`POST /api/web/design-studios/`** — Create design studio.

**Request body for POST (JSON or form-data if `file`):**

| Field         | Type    | Required | Description |
|---------------|---------|----------|-------------|
| `width`       | decimal | Yes      | Width. |
| `height`      | decimal | Yes      | Height. |
| `file`        | file    | Yes      | Design file. |
| `repeat`      | string  | No       | One of: `fulldrop`, `halfdrop`, `center`, `mirror`. Default `fulldrop`. |
| `fabric_id`   | integer | No       | FK to Fabric. |
| `fabric_cut_id` | integer | No     | FK to FabricCut. |

**Success — GET (200):** Array of:
```json
{
  "id": 1,
  "user": 1,
  "user_email": "user@example.com",
  "width": "100.00",
  "height": "200.00",
  "fabric": 1,
  "fabric_name": "Cotton",
  "fabric_id": 1,
  "fabric_cut": 1,
  "fabric_cut_name": "Cut A",
  "fabric_cut_id": 1,
  "file": "http://.../media/design_studio/...",
  "repeat": "fulldrop",
  "created_at": "...",
  "updated_at": "..."
}
```

**Success — POST (201):** Same shape (single object).  
**Errors (400):** e.g. `{"fabric_id": "Fabric not found"}`, `{"fabric_cut_id": "FabricCut not found"}`.

---

### 2.4 Design studio — Retrieve / Update / Delete

**`GET /api/web/design-studios/<id>/`**  
**`PATCH /api/web/design-studios/<id>/`**  
**`DELETE /api/web/design-studios/<id>/`**

**Path:** `id` (integer).  
**PATCH:** Partial update; same fields as create (all optional). PUT is treated as PATCH.  
**Success:** GET/PATCH 200; DELETE 204.

---

### 2.5 Fabric dropdown

**`GET /api/web/dropdowns/fabrics/`**

**Permission:** Customer (JWT).

**Success response (200):**
```json
[
  { "id": 1, "name": "Cotton" },
  { "id": 2, "name": "Polyester" }
]
```

---

### 2.6 Fabric cut dropdown

**`GET /api/web/dropdowns/fabric-cuts/`**

**Permission:** Customer (JWT).

**Success response (200):**
```json
[
  { "id": 1, "name": "Cut A" },
  { "id": 2, "name": "Cut B" }
]
```

---

## 3. Orders — Customer (`/api/order/`)

All order endpoints in this section require **customer** JWT (IsCustomer).

---

### 3.1 Orders — List & Create

**`GET /api/order/add/`** — List orders for current user.  
**`POST /api/order/add/`** — Create order.

**Query for GET:**

| Param    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `status` | string | No       | Filter: `pending`, `in_progress`, `done`, `paid`, `cancelled`. |

**Request body for POST (JSON or form-data if files):**

| Field               | Type    | Required | Description |
|---------------------|---------|----------|-------------|
| `order_type_id`     | integer | Yes      | FK to OrderType. |
| `fabric_type_id`    | integer | Yes      | FK to FabricType. |
| `fabric_source`     | string  | Yes      | One of: `provide`, `factory_provide`, `not_sure`. |
| `fabric_inventory_id` | integer | Conditional | Required when `fabric_source` = `factory_provide`. |
| `design_id`         | integer | Conditional* | *For `factory_provide`: one of `design_id`, `design_studio_id`, or `custom_design` required. |
| `design_studio_id`  | integer | Conditional* | Same as above. |
| `custom_design`     | file    | Conditional* | Same as above. |
| `quantity`          | integer | Conditional | Required for `factory_provide`; must be ≥ fabric inventory `min_quantity`. |
| `notes`             | string  | No       | Free text. |

**Validation rules (backend):**
- `fabric_source === 'factory_provide'`: `fabric_inventory_id` required; `quantity` required and ≥ that inventory’s `min_quantity`; at least one of `design_id`, `design_studio_id`, or `custom_design` required.
- Referenced IDs (order_type, fabric_type, fabric_inventory, design, design_studio) must exist.

**Success — GET (200):** List of (compact):
```json
[
  {
    "id": 1,
    "order_id": "ABC123XYZ456",
    "status": "pending",
    "quantity": 10,
    "total_amount": "500.00",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

**Success — POST (201):** Full order object, e.g.:
```json
{
  "id": 1,
  "order_id": "ABC123XYZ456",
  "status": "pending",
  "order_type": { "id": 1, "name": "Bulk" },
  "order_type_id": 1,
  "fabric_type": { "id": 1, "name": "Cotton" },
  "fabric_type_id": 1,
  "fabric_inventory": { "id": 1, "name": "...", "price": "50.00", "min_quantity": 5 },
  "fabric_inventory_id": 1,
  "fabric_source": "factory_provide",
  "design": { "id": 1, "name": "...", "file": "..." },
  "design_id": 1,
  "design_studio": null,
  "design_studio_id": null,
  "custom_design": null,
  "quantity": 10,
  "total_amount": "500.00",
  "notes": null,
  "payment": null,
  "quotation": null,
  "created_at": "...",
  "updated_at": "..."
}
```

**Errors (400):** Validation messages, e.g. `{"fabric_inventory_id": "fabric_inventory is required for factory_provide option"}`, `{"quantity": "Quantity must be at least X"}`.

---

### 3.2 Order — Retrieve / Update / Delete

**`GET /api/order/details/<order_id>/`**  
**`PATCH /api/order/details/<order_id>/`**  
**`DELETE /api/order/details/<order_id>/`**

**Path:** `order_id` (string) — e.g. `ABC123XYZ456`.

**Success:** GET/PATCH 200 (full order object as in 3.1 POST response); DELETE 204.  
**Errors:** 404 if order not found or not owned by user.

---

### 3.3 Create payment for order

**`POST /api/order/payment/<order_id>/`**

**Permission:** Customer (JWT).  
**Path:** `order_id` (string).

Only for orders with `fabric_source === 'factory_provide'`. One payment per order.

**Request body (form-data):**

| Field | Type   | Required | Description |
|-------|--------|----------|-------------|
| `type`| string | Yes      | One of: `instant_pay`, `cash`. |
| `file`| file   | Conditional | Required when `type` = `instant_pay` (payment proof). |

**Success response (201):**
```json
{
  "id": 1,
  "type": "instant_pay",
  "file": "http://.../media/payment_proofs/...",
  "status": "pending",
  "created_at": "...",
  "updated_at": "..."
}
```

**Errors:**  
- 400: `"Payment is only for factory_provide fabric source"`, `"Payment already exists for this order"`, `"File is required for instant_pay payment"`.  
- 404: `"Order not found"`.

---

### 3.4 Fabric inventory (filtered)

**`GET /api/order/fabric-inventory/`**

**Permission:** Customer (JWT).  
**Query:**

| Param          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| `fabric_type`  | integer | No      | Filter by fabric type ID. |

**Success response (200):** Array of:
```json
{
  "id": 1,
  "name": "Cotton White",
  "description": "...",
  "min_quantity": 5,
  "available_meter": "100.00",
  "image": "http://...",
  "price": "50.00",
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 4. Admin Dashboard (`/api/admin/`)

All admin endpoints (except login) require **admin** JWT (user with `is_admin=True`).

---

### 4.1 Admin login

**`POST /api/admin/login/`**

**Permission:** Public.

**Request body (JSON):** Same as customer login — `email` and/or `phone`, and `password`.

**Success response (200):** Same shape as customer login (user object + `access` + `refresh`). User must be verified and `is_admin === true`.

**Errors (400):** `"Invalid email/phone or password"`, `"This account is not an admin account"`, `"Account is not verified"`.

---

### 4.2 Designs — List & Create

**`GET /api/admin/designs/`** — List all designs.  
**`POST /api/admin/designs/`** — Create design.

**Request body for POST (JSON or form-data for `file`):**

| Field         | Type    | Required | Description |
|---------------|---------|----------|-------------|
| `name`        | string  | Yes      | Design name. |
| `description` | string  | No       | Text. |
| `file`        | file    | Yes      | Image (designs upload). |
| `price`       | decimal | Yes      | Price. |
| `status`      | string  | No       | `public` or `private`. Default `public`. |

**Success — GET (200):** Array of:
```json
{
  "id": 1,
  "name": "Design A",
  "description": "...",
  "file": "http://.../media/designs/...",
  "price": "100.00",
  "status": "public",
  "assigned_users": [
    { "id": 1, "email": "u@example.com", "phone": "+...", "fullname": "User" }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

**Success — POST (201):** Same shape (single object).  
**PATCH/PUT:** Partial update; same fields (all optional). PUT treated as PATCH.

---

### 4.3 Design — Retrieve / Update / Delete

**`GET /api/admin/designs/<id>/`**  
**`PATCH /api/admin/designs/<id>/`**  
**`DELETE /api/admin/designs/<id>/`**

**Path:** `id` (integer).  
**Success:** GET/PATCH 200; DELETE 204.

---

### 4.4 Add users to private design

**`POST /api/admin/private-designs/add/`**

**Request body (JSON):**
```json
{
  "design_id": 1,
  "user_ids": [1, 2, 3]
}
```

**Success response (201):**
```json
{
  "message": "Processed 3 users",
  "created_count": 2,
  "failed_count": 1,
  "data": [
    {
      "id": 1,
      "design": 1,
      "user": 1,
      "design_name": "Design A",
      "user_email": "u@example.com",
      "created_at": "..."
    }
  ],
  "failed": [
    { "user_id": 3, "reason": "Already assigned" }
  ]
}
```

**Errors (400):** e.g. `"Design not found"`.

---

### 4.5 Private design assignment — Retrieve / Update / Delete

**`GET /api/admin/private-designs/people/<id>/`**  
**`PATCH /api/admin/private-designs/people/<id>/`**  
**`DELETE /api/admin/private-designs/people/<id>/`**

**Path:** `id` (integer) — PrivateDesignPeople primary key.

**PATCH body (JSON):** Optional `user` (user id) and/or `design` (design id). Backend ensures (design, user) stays unique; 400 if duplicate: `"This user is already assigned to the specified design."`

**Success:** GET/PATCH 200 (assignment object); DELETE 204.

---

### 4.6 Fabric types — List & Create

**`GET /api/admin/fabric-types/`**  
**`POST /api/admin/fabric-types/`**

**Request body for POST (JSON):**
```json
{ "name": "Cotton" }
```

**Success — GET (200):** Array of `{ "id": 1, "name": "Cotton" }` (no pagination).  
**Success — POST (201):** Same shape.

---

### 4.7 Fabric type — Retrieve / Update / Delete

**`GET /api/admin/fabric-types/<id>/`**  
**`PATCH /api/admin/fabric-types/<id>/`**  
**`DELETE /api/admin/fabric-types/<id>/`**

---

### 4.8 Order types — List & Create

**`GET /api/admin/order-types/`**  
**`POST /api/admin/order-types/`**

**Request body for POST (JSON):**
```json
{ "name": "Bulk" }
```

**Success:** Same pattern as fabric types (list without pagination).

---

### 4.9 Order type — Retrieve / Update / Delete

**`GET /api/admin/order-types/<id>/`**  
**`PATCH /api/admin/order-types/<id>/`**  
**`DELETE /api/admin/order-types/<id>/`**

---

### 4.10 Fabrics — List & Create

**`GET /api/admin/fabrics/`**  
**`POST /api/admin/fabrics/`**

**Request body for POST (JSON):**
```json
{ "name": "Cotton" }
```

**Success — GET (200):** Array of `{ "id", "name", "created_at", "updated_at" }`.

---

### 4.11 Fabric — Retrieve / Update / Delete

**`GET /api/admin/fabrics/<id>/`**  
**`PATCH /api/admin/fabrics/<id>/`**  
**`DELETE /api/admin/fabrics/<id>/`**

PATCH: partial update; PUT treated as PATCH.

---

### 4.12 Fabric cuts — List & Create

**`GET /api/admin/fabric-cuts/`**  
**`POST /api/admin/fabric-cuts/`**

**Request body for POST (JSON):**
```json
{ "name": "Cut A" }
```

---

### 4.13 Fabric cut — Retrieve / Update / Delete

**`GET /api/admin/fabric-cuts/<id>/`**  
**`PATCH /api/admin/fabric-cuts/<id>/`**  
**`DELETE /api/admin/fabric-cuts/<id>/`**

---

### 4.14 Fabric inventory — List & Create

**`GET /api/admin/fabric-inventory/`**  
**`POST /api/admin/fabric-inventory/`**

**Request body for POST (JSON or form-data for `image`):**

| Field           | Type    | Required | Description |
|-----------------|---------|----------|-------------|
| `name`          | string  | Yes      | |
| `description`   | string  | No       | |
| `min_quantity`  | integer | Yes      | |
| `available_meter` | decimal | No     | |
| `image`         | file    | No       | |
| `price`         | decimal | Yes      | |
| `fabric_type_id`| integer | No       | FK to FabricType. |

**Success — GET (200):** Array of fabric inventory objects with nested `fabric_type` (id, name).  
**Success — POST (201):** Same.  
**Errors (400):** e.g. `{"fabric_type_id": "Invalid fabric_type id"}`.

---

### 4.15 Fabric inventory — Retrieve / Update / Delete

**`GET /api/admin/fabric-inventory/<id>/`**  
**`PATCH /api/admin/fabric-inventory/<id>/`**  
**`DELETE /api/admin/fabric-inventory/<id>/`**

---

### 4.16 Admin orders — List

**`GET /api/admin/orders/`**

**Query:**

| Param           | Type   | Required | Description |
|-----------------|--------|----------|-------------|
| `status`        | string | No       | `pending`, `in_progress`, `done`, `paid`, `cancelled`. |
| `fabric_source` | string | No       | `provide`, `factory_provide`, `not_sure`. |
| `search`        | string | No       | Search in `order_id`, `user__email`, `user__fullname`. |

**Success response (200):** Paginated list of full order objects (with `user_info`, `order_type_name`, `fabric_type_name`, `fabric_inventory_info`, `design_info`, `quotation`).

---

### 4.17 Admin order — Detail

**`GET /api/admin/orders/<id>/`**

**Path:** `id` (integer) — order primary key (not `order_id` string).

**Success response (200):** Single full order object with user, quotation, etc.

---

### 4.18 Add quotation to order

**`POST /api/admin/orders/<order_id>/quotations/`**

**Path:** `order_id` (integer) — order primary key. One quotation per order.

**Request body (JSON):**

| Field         | Type    | Required | Description |
|---------------|---------|----------|-------------|
| `title`       | string  | Yes      | |
| `description` | string | Yes      | |
| `min_quantity`| integer | Yes     | |
| `price`       | decimal | Yes      | |

**Success response (201):**
```json
{
  "id": 1,
  "title": "Quote #1",
  "description": "...",
  "min_quantity": 10,
  "price": "500.00",
  "admin_name": "Admin User",
  "created_at": "...",
  "updated_at": "..."
}
```

**Errors:** 400 `"Quotation already exists for this order"`; 404 `"Order not found"`.

---

## 5. Common response codes

| Code | Meaning |
|------|--------|
| 200  | OK (GET, PATCH, etc.) |
| 201  | Created (POST) |
| 204  | No content (DELETE) |
| 400  | Bad request (validation or business rule) |
| 401  | Unauthorized (missing or invalid JWT) |
| 403  | Forbidden (e.g. customer calling admin endpoint) |
| 404  | Not found |
| 429  | Too many requests (e.g. OTP resend cooldown) |
| 500  | Server error |

---

## 6. File uploads

- Use **multipart/form-data** when sending `file`, `avatar`, `image`, or `custom_design`.
- For **instant_pay** payment, `file` is required in the same multipart request as `type`.

---

## 7. Pagination

- List endpoints may return paginated results (e.g. admin orders). Default DRF pagination format applies unless disabled (e.g. fabric-types, order-types return full list).
- Check response for `count`, `next`, `previous`, `results` when pagination is enabled.

---

*Generated from backend code. Keep this doc in sync when adding or changing endpoints.*
