# AnoimQI Subscription Management System — Production Backend

A production-grade, enterprise subscription management and recurring billing platform backend built with **Node.js, Express.js, PostgreSQL, and Prisma ORM**.

Designed following strict **N-Layered Architecture** principles (`Middlewares` ➔ `Routes` ➔ `Controllers` ➔ `Services` ➔ `Repositories` ➔ `Prisma Database Layer`).

---

## 🏛️ Architecture Overview

The backend is organized into decoupled layers to ensure strict separation of concerns, transactional integrity, testability, and maintainability:

```text
backend/
├── prisma/
│   ├── schema.prisma        # Complete PostgreSQL relational data models & enums
│   └── seed.js              # Comprehensive seed script with realistic Indian businesses & INR data
├── src/
│   ├── config/              # Centralized environment & Prisma client configuration
│   │   ├── env.js
│   │   └── prisma.js
│   ├── middlewares/         # Cross-cutting concerns
│   │   ├── auth.middleware.js       # JWT extraction & active user resolution
│   │   ├── role.middleware.js       # RBAC (ADMIN, STAFF, CUSTOMER) & tenant isolation
│   │   ├── validate.middleware.js   # Request payload validation via Zod schemas
│   │   └── error.middleware.js      # Centralized error handler & Prisma code mapper
│   ├── utils/               # Shared domain utilities
│   │   ├── apiError.js      # Operational HTTP error classes
│   │   ├── apiResponse.js   # Standardized REST / JSend response envelope
│   │   ├── currency.js      # Decimal math, subtotal, tax calculation, and INR formatting
│   │   ├── dateHelper.js    # Frequency schedules (Daily, Weekly, Monthly, Yearly), overdue days
│   │   └── password.js      # Password policy validator & Bcryptjs hashing
│   ├── repositories/        # Data Access Layer (encapsulates all Prisma database operations)
│   │   ├── user.repository.js
│   │   ├── customer.repository.js
│   │   ├── product.repository.js
│   │   ├── plan.repository.js
│   │   ├── quotation.repository.js
│   │   ├── subscription.repository.js
│   │   ├── billing.repository.js
│   │   ├── invoice.repository.js
│   │   ├── payment.repository.js
│   │   ├── discount.repository.js
│   │   ├── staff.repository.js
│   │   └── activity.repository.js
│   ├── services/            # Business Logic Layer (State machines, calculations, workflows)
│   │   ├── auth.service.js          # Authentication, password rules, reset simulation
│   │   ├── customer.service.js      # Customer accounts, balance calculation
│   │   ├── product.service.js       # Catalog & configurable variant prices (e.g. Odoo brand +₹560)
│   │   ├── plan.service.js          # Frequency, intervals, auto-close & pause settings
│   │   ├── quotation.service.js     # Quotation drafting & conversion into Subscriptions
│   │   ├── subscription.service.js  # Subscription state machine (DRAFT -> CONFIRMED -> ACTIVE -> ...)
│   │   ├── billing.service.js       # Automated billing engine (preview, execution, deduplication)
│   │   ├── invoice.service.js       # Invoicing lifecycle, overdue calculations, PDF/print preview
│   │   ├── payment.service.js       # Multi-method payments, matching invoices, balance synchronization
│   │   ├── discount.service.js      # Coupons, usage limits, fixed vs percentage discounts
│   │   ├── staff.service.js         # Staff onboarding & customer assignments (Admin only)
│   │   ├── analytics.service.js     # MRR, ARR, revenue trends, and Revenue Risk monitor
│   │   └── portal.service.js        # Customer Self-Service portal with strict tenant isolation
│   ├── controllers/         # HTTP Transport Layer (Request parsing & Response dispatch)
│   ├── routes/              # Express API Route definitions mounted under /api/v1
│   ├── app.js               # Express application initialization & middleware pipeline
│   └── server.js            # HTTP Server bootstrap & graceful shutdown hooks
├── .env.example
├── package.json
└── README.md
```

---

## 🗄️ Database Architecture (PostgreSQL & Prisma)

### Financial Precision Rule
All monetary values (prices, taxes, discounts, totals, balances) use **PostgreSQL `Decimal(12, 2)`** to eliminate floating-point rounding errors.

### Core Entities & Relations
1. **User & Staff**:
   - `User` handles identity, password security (`> 8 chars`, uppercase, lowercase, special character), role (`ADMIN`, `STAFF`, `CUSTOMER`).
   - `Staff` links to `User` with employee codes and customer assignments.
2. **Customer**:
   - Manages company details, contact information, total invoiced, amount paid, and outstanding balance in INR.
3. **Products & Variants**:
   - Supports software subscriptions, add-ons, and one-time services.
   - Configurable variant pricing (e.g. "Odoo Brand Edition" adds ₹560 to base price).
4. **Subscription Plans**:
   - Billing frequencies: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`.
   - Lifecycle permissions: `canPause`, `canCloseEarly`, `canRenew`, `autoClose`.
5. **Quotations & Subscriptions**:
   - Quotation lifecycle: `DRAFT` ➔ `SENT` ➔ `CONFIRMED` ➔ `CONVERTED`.
   - Subscription lifecycle: `DRAFT` ➔ `QUOTATION` ➔ `CONFIRMED` ➔ `ACTIVE` ➔ `PAUSED` ➔ `CLOSED` ➔ `EXPIRED`.
   - Automatic conversion workflow preserves product line items, calculates tax, and sets next billing schedules.
6. **Billing Engine & Invoicing**:
   - `BillingRun` records batch execution stats (total processed, successes, failures, skips, total value, duration).
   - `BillingEvent` guarantees idempotency: subscriptions cannot be double-billed for the same billing date.
   - Invoices advance through `DRAFT` ➔ `CONFIRMED` ➔ `PAID` / `PARTIALLY_PAID` / `OVERDUE` / `CANCELLED`.
7. **Payments**:
   - Supports `BANK_TRANSFER`, `UPI`, `CARD`, `CASH`.
   - Multiple partial payments against a single invoice automatically update invoice outstanding balances and transition statuses.
8. **Discounts**:
   - `FIXED_AMOUNT` or `PERCENTAGE`, with minimum purchase constraints, maximum usage counters, and validity bounds.

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- PostgreSQL `v14+` running locally or via cloud (e.g., Supabase / Neon / RDS)

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/anoimqi_db?schema=public"
PORT=5000
JWT_SECRET="anoimqi_super_secure_jwt_secret_key_2026_xyz"
```

### 4. Database Migration & Client Generation
```bash
npx prisma generate
npx prisma db push
```

### 5. Database Seeding
Populate the database with realistic Indian corporate records, INR financial balances, products, variants, plans, subscriptions, and invoices:
```bash
npm run prisma:seed
```

#### Seed Demo Credentials:
| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@anoimqi.io` | `Password@123` | Full administrative & financial management |
| **Internal Staff** | `rahul.verma@anoimqi.io` | `Password@123` | Operational management (customers, quotes, subs, billing) |
| **Customer User** | `rajesh@apexsolutions.in` | `Password@123` | Customer Self-Service Portal (Apex Solutions) |

### 6. Start the Server
```bash
# Development (with hot-reload via nodemon)
npm run dev

# Production
npm start
```

---

## 📡 Complete API Reference (`/api/v1`)

### 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login`: User sign-in, returns JWT token & role profile.
- `POST /api/v1/auth/register`: Public customer registration enforcing password policy.
- `POST /api/v1/auth/forgot-password`: Password reset dispatch simulation.
- `GET /api/v1/auth/me`: Current authenticated session profile.

### 2. Customers (`/api/v1/customers`)
- `GET /api/v1/customers`: Search, filter by status/type, paginated list.
- `GET /api/v1/customers/:id`: Comprehensive profile with subscriptions, invoices, and payments.
- `POST /api/v1/customers`: Create new corporate or individual customer.
- `PUT /api/v1/customers/:id`: Update customer details.
- `DELETE /api/v1/customers/:id`: Archive customer record (Admin only).

### 3. Products & Variants (`/api/v1/products`)
- `GET /api/v1/products`: Product catalog with variants and subscription eligibility.
- `GET /api/v1/products/:id`: Product details with active variants.
- `POST /api/v1/products`: Create product with variant prices (Admin only).
- `POST /api/v1/products/:id/variants`: Add variant (e.g. Odoo brand +₹560).
- `PUT /api/v1/products/:id`: Update product catalog details.
- `DELETE /api/v1/products/:id`: Deactivate/archive product.

### 4. Subscription Plans (`/api/v1/plans`)
- `GET /api/v1/plans`: List plans by billing frequency (Daily, Weekly, Monthly, Yearly).
- `GET /api/v1/plans/:id`: Plan specifications and lifecycle permissions.
- `POST /api/v1/plans`: Create plan with lifecycle flags (`canPause`, `canCloseEarly`, etc.).
- `PUT /api/v1/plans/:id`: Update plan settings.

### 5. Quotation Management (`/api/v1/quotations`)
- `GET /api/v1/quotations`: List quotes with search and status filters.
- `GET /api/v1/quotations/:id`: Detailed quotation breakdown with items, taxes, discounts.
- `POST /api/v1/quotations`: Create quote from template with line items and tax rules.
- `POST /api/v1/quotations/:id/convert`: **Convert confirmed quotation into an active Subscription**.

### 6. Subscription Management (`/api/v1/subscriptions`)
- `GET /api/v1/subscriptions`: Subscription directory with next billing dates and status filters.
- `GET /api/v1/subscriptions/:id`: Full subscription lifecycle view with billing history and invoices.
- `POST /api/v1/subscriptions`: Create subscription directly.
- `PATCH /api/v1/subscriptions/:id/status`: Transition status (`ACTIVE`, `PAUSED`, `CLOSED`).
- `POST /api/v1/subscriptions/:id/renew`: Renew subscription with extended expiry.

### 7. Automated Billing Center (`/api/v1/billing`)
- `GET /api/v1/billing/preview?targetDate=YYYY-MM-DD`: Preview eligible subscriptions, estimated invoices, and exclusion reasons.
- `POST /api/v1/billing/execute`: **Execute automated billing run** (generates invoices, advances billing dates, prevents double-billing).
- `GET /api/v1/billing/runs`: Historical billing run execution logs.
- `GET /api/v1/billing/runs/:id`: Detailed breakdown of a specific billing execution and its events.

### 8. Invoices (`/api/v1/invoices`)
- `GET /api/v1/invoices`: List invoices with search, overdue filters, and outstanding amounts.
- `GET /api/v1/invoices/:id`: Detailed invoice view with product line items, taxes, and payment history.
- `PATCH /api/v1/invoices/:id/status`: Update status (`DRAFT`, `CONFIRMED`, `CANCELLED`).

### 9. Payments (`/api/v1/payments`)
- `GET /api/v1/payments`: Payment ledger with payment method and invoice matching.
- `GET /api/v1/payments/:id`: Payment record details.
- `POST /api/v1/payments/register`: Register payment against an invoice (updates invoice & customer outstanding balance).

### 10. Discounts (`/api/v1/discounts`)
- `GET /api/v1/discounts`: List active promotion rules.
- `GET /api/v1/discounts/:id`: Rule specifications.
- `POST /api/v1/discounts`: Create discount rule with usage limits and date windows.
- `POST /api/v1/discounts/validate`: Validate discount code against purchase amount and quantity.

### 11. Staff Management (`/api/v1/staff`) — Admin Only
- `GET /api/v1/staff`: List internal staff members and customer assignments.
- `GET /api/v1/staff/:id`: Staff profile details.
- `POST /api/v1/staff`: Onboard staff user with designated role.
- `POST /api/v1/staff/:id/assign-customers`: Assign customers to staff account representative.

### 12. Executive Analytics & Risk Monitor (`/api/v1/analytics`)
- `GET /api/v1/analytics/dashboard`: Executive KPIs (Active Subscriptions, MRR, ARR, Invoiced, Collected, Overdue).
- `GET /api/v1/analytics/revenue-trends`: Monthly revenue trends (Invoiced vs Collected).
- `GET /api/v1/analytics/revenue-risk`: Operational risk monitor (Overdue aging, expiring contracts, failed billing).

### 13. Customer Self-Service Portal (`/api/v1/portal`)
- `GET /api/v1/portal/dashboard`: Customer's personalized dashboard.
- `GET /api/v1/portal/subscriptions`: Subscriptions belonging only to the authenticated customer.
- `GET /api/v1/portal/invoices`: Invoices for the customer.
- `GET /api/v1/portal/payments`: Customer payment receipts.
- `POST /api/v1/portal/renewals`: Submit subscription renewal request.

---

## 🔒 Security & Best Practices
- **Strict Role-Based Access Control (RBAC)**: Validates permissions across `ADMIN`, `STAFF`, and `CUSTOMER`.
- **Customer Tenant Isolation**: Customer users can never read or query records belonging to other customer accounts.
- **Idempotent Billing Runs**: Guaranteed prevention of double-invoicing subscriptions within the same billing period.
- **Financial Consistency**: Decimal calculations ensure balances, subtotals, taxes (18%), and payments reconcile to the cent.
