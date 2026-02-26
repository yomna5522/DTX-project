# Frontend–Backend Integration Checklist

Use this checklist for manual end-to-end verification before release.

## Prerequisites

- **Backend**: From project root: `cd TDX_backend-main && pip install -r requirements.txt`. Then create and apply migrations for local apps if needed: `python manage.py makemigrations accounts inventory order && python manage.py migrate`. If you previously ran `migrate` before these existed, reset the DB first: `rm -f db.sqlite3` then `python manage.py migrate`. Start server: `python manage.py runserver`. Ensure at least one **OrderType** exists (e.g. name "Order" and/or "Sample") so the shop can submit orders; create via Django admin if needed.


- **Frontend**: `npm run dev`
- **Env** (optional): Set `VITE_API_BASE_URL=http://localhost:8000` in `.env` if your backend runs elsewhere.

---

## 1. Auth & profile

- [ ] **Register** — Create account (email, phone, password, confirm). Expect success and OTP message if SMS is configured; session stored and redirect to shop.
- [ ] **Login** — Sign in with email or phone + password. Redirect to intended page; session persisted.
- [ ] **Protected routes** — While logged out, open `/shop`, `/orders`, `/settings`. Each should redirect to `/login`.
- [ ] **Profile** — In Settings, confirm profile loads (name, email, phone, address). Edit full name and/or address, save. Expect success message.
- [ ] **Change password** — In Settings, change password (current, new, confirm). Expect success message.
- [ ] **Logout** — Log out. Session cleared; visiting protected routes again redirects to login.

---

## 2. Orders (customer)

- [ ] **List orders** — Log in, go to `/orders`. List loads from API (or shows empty). No console errors.
- [ ] **Order detail** — Click an order. Detail page loads; status and items are shown.
- [ ] **Create order (provide / not_sure)** — In Shop: choose “Upload” design, then “Customer provides” or “Not sure” fabric. Complete wizard and submit. Order is created via API and you are redirected to its detail page.
- [ ] **Create order (factory_provide)** — In Shop: choose “Upload” design, “Factory provides” fabric, pick a fabric from the list (from API when available), set quantity. Submit. Order created; redirect to order detail.
- [ ] **Payment** — Open an order with factory-provide fabric and no payment yet. Upload payment proof and submit. Payment is created and order shows payment info.

---

## 3. Edge cases

- [ ] **Token expiry** — With a short-lived or expired token, perform an authenticated action. Expect either token refresh or redirect to login.
- [ ] **Validation errors** — Register with duplicate email or invalid phone; submit order with missing required fields. Expect clear, non-generic error messages.
- [ ] **Network error** — Stop the backend, then try login or load orders. Expect a handled error (no uncaught exception or blank screen).

---

## 4. Management (out of scope)

Management dashboard (`/management/*`) is not wired to the backend in this phase. Customer list and order list there may be empty or use legacy mock data.

---

**After running the checklist:** Note any failures and fix them before rollout.
