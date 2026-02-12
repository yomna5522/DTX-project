# DTX Customer Website — Scope vs Add-ons

This document defines what is **in scope** for the customer-facing website and what is explicitly **out of scope** (add-ons). Implementation should stay aligned with this boundary.

---

## In-scope (core customer website)

| Area | Description |
|------|-------------|
| **Landing (Home)** | Overview of company services and unique selling points; clear navigation to Shop, About, Contact, Services. |
| **About** | Company background, history, achievements, years of operation, notable information. |
| **Contact Us** | Contact form (inquiries, complaints, quotations, requests); email, phone, physical address. |
| **Services** | Standalone page with detailed information about services offered. |
| **Customer auth** | Registration required before ordering. Existing customers can log in with temporary username/password issued by the factory. |
| **User Settings** | Registered customers may update shipping address, contact info, and password. Changes do **not** apply to previous or in-progress orders. |
| **Orders History** | View previous purchases and transactions; repeat previous purchase; view/track current order status and estimated completion; view attached designs, transactions, and due amounts. |
| **Shop (order flow)** | Multi-step wizard: Design choice (upload / browse presets / repeat previous) → Fabric choice (artificial vs natural; own vs factory-provided) → Quantity & notes → Pricing & payments (new customers: linear price + digital invoice; regular customers: manual invoice from staff) → Payment method (COD or bank transfer with manual confirmation). |

---

## Out-of-scope (add-ons)

The following are **not** part of the current implementation. They may be offered as add-ons later.

- **Multi-language support** (e.g. Arabic).
- **Products rating and reviews** (with moderation workflow).
- **Promocodes and coupons**.
- **Product delivery / shipping rates** (default is local pickup only).

---

## Current gaps (vs target scope)

- Missing routes: `/services`, `/orders`, `/orders/:orderId`, `/settings`.
- No real auth: no sessions, route protection, or “existing customer temp credentials” flow.
- No order domain model: order objects, statuses, invoices, payment evidence, attachments.
- Shop is only step 1 UI; no full wizard or pricing/invoice logic.
- No API/data layer: React Query scaffold present but unused; no contract-shaped client.
- Contact form submits to `alert()` only.

---

## Order statuses (minimal set)

Supported statuses for orders:

- `DRAFT` — Order being built in the wizard.
- `SUBMITTED` — Order submitted, awaiting next step.
- `INVOICE_PENDING` — Waiting for manual invoice (regular customers).
- `INVOICED` — Invoice issued.
- `PAYMENT_PENDING` — Awaiting payment confirmation (e.g. bank transfer).
- `PAID` — Payment confirmed.
- `IN_PRODUCTION` — In production.
- `READY` — Ready for pickup.
- `COMPLETED` — Completed.
- `CANCELLED` — Cancelled.
