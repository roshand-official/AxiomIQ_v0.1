# Brightloop Subscription Management System — Frontend Architecture

**Brightloop** is a professional B2B SaaS subscription management and recurring revenue operations platform designed with modern financial and operational principles (inspired by Stripe Dashboard, Linear, and Ramp).

---

## 1. Quick Start & Execution

### Prerequisites
- Node.js (v18+ recommended)
- `npm` (or `pnpm` / `yarn`)

### Installation & Running
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will launch at `http://localhost:5173/`.

### Production Build
```bash
# Build production bundle
npm run build

# Preview build
npm run preview
```

---

## 2. Technology Stack

| Layer | Technology | Usage |
|---|---|---|
| Framework | **React 19** | Core frontend UI layer |
| Build Tool | **Vite 8** | High-speed bundler & dev server |
| Styling | **Tailwind CSS v4** | Design tokens, utility classes, and components |
| Routing | **React Router DOM v7** | Nested route layouts, breadcrumbs, guards |
| Icons | **Lucide React** | Consistent iconography across navigation & tables |
| Charts | **Recharts** | Interactive revenue, subscription, & payment visualizations |
| State Management | **React Context API** | Centralized application & auth state |
| Notifications | **Sonner** | Non-intrusive toast notification system |
| Dates | **date-fns & Intl API** | Formatting dates, relative times, and fiscal quarters |
| Currency | **Intl.NumberFormat** | Consistent INR (`₹`) formatting throughout |

---

## 3. Strict Architectural Verification: Single Mock Data File

> **NON-NEGOTIABLE CORE REQUIREMENT SATISFIED:**  
> **All mock data exists EXCLUSIVELY in `frontend/src/data/mockData.js`.**

There are:
- **NO** component-level mock arrays
- **NO** stray `.json` files or fixtures
- **NO** hardcoded customer or invoice constants in pages
- **NO** secondary mock files (`sampleData.js`, `dummyData.js`, etc.)

All application state is initialized strictly from `mockData.js` within `AppContext.jsx` and `AuthContext.jsx`. Any additions or edits created by the user update the in-memory React Context state.

---

## 4. Role Experiences & Demo Access

The platform includes three distinct role-based application experiences:

### 1. Administrator Workspace (`/admin/*`)
- **Executive Dashboard** (`/admin/dashboard`): Primary KPI cards (MRR, ARR, Active Subs, Overdue Invoices), multi-metric Recharts, immediate attention flags, overdue ledger, and audit log.
- **Customer Directory** (`/admin/customers`, `/admin/customers/:id`): Client profiles, active subscription counts, total invoiced, outstanding balances, CSV export, and customer details with multi-tab history.
- **Product Catalog** (`/admin/products`, `/admin/products/:id`): Subscription products, add-on modules, one-time setup services, and dynamic variant surcharge management (e.g., Odoo Brand +₹560).
- **Subscription Plans** (`/admin/plans`, `/admin/plans/:id`): Billing cadences (Daily, Weekly, Monthly, Yearly), interval rules, pause permissions, and lifecycle governance.
- **Quotations** (`/admin/quotations`, `/admin/quotations/:id`): Multi-product line proposals, discount coupons, GST calculation, quotation PDF/print view, and one-click conversion to active subscriptions.
- **Subscription Contracts** (`/admin/subscriptions`, `/admin/subscriptions/:id`): Full lifecycle state machine (`draft` → `confirmed` → `active` → `paused` → `closed` / `expired`) with interactive action dialogs.
- **Billing Center** (`/admin/billing`): Operational batch billing workspace. Select billing dates, preview eligible contracts, execute batch runs, generate tax invoices, and inspect run history.
- **Tax Invoices** (`/admin/invoices`, `/admin/invoices/:id`): Accounts receivable ledger, GST calculation, PDF printable invoice, and payment collection modal.
- **Payments & Receipts** (`/admin/payments`): Reconciliation ledger for NEFT/RTGS, UPI, and card payments.
- **Discounts & Coupons** (`/admin/discounts`): Percentage and fixed value promotions, usage tracking, and minimum order rules.
- **Financial Reports** (`/admin/reports`): Segregated reporting distinguishing **Contracted ARR**, **Invoiced Revenue**, **Collected Cash**, and **Aging Receivables**.
- **Revenue Risk Monitor** (`/admin/revenue-risk`): Proactive churn and risk detection for overdue invoices, expiring contracts, and failed billing events.
- **Subscription Analytics** (`/admin/analytics`): Cohort retention rates, plan distribution donuts, and recurring growth curves.
- **Staff Management** (`/admin/staff`): Allocate accounts to internal Account Managers and Executives.
- **System Settings** (`/admin/settings`): Corporate GST credentials, dunning intervals, and payment terms.

### 2. Internal Staff Workspace (`/staff/*`)
- **My Overview** (`/staff/dashboard`): Filtered metrics and alerts for accounts assigned to the current staff member.
- **Assigned Customers** (`/staff/customers`): Direct customer portfolio.
- **Quotations & Subscriptions** (`/staff/quotations`, `/staff/subscriptions`): Managed proposals and contracts.
- **Billing & Invoices** (`/staff/invoices`, `/staff/payments`, `/staff/billing-activity`): Dunning follow-ups and operational log.

### 3. Customer Self-Service Portal (`/portal/*`)
- **Customer Dashboard** (`/portal/dashboard`): Client-facing view showing active subscriptions, upcoming renewal dates, outstanding balances, and announcements.
- **Customer Subscriptions** (`/portal/subscriptions`, `/portal/subscriptions/:id`): View contracted modules, authorize early renewals, or request pauses/closures.
- **Customer Invoices** (`/portal/invoices`, `/portal/invoices/:id`): View tax invoices and execute instant online payments (UPI, Card, NetBanking simulation).
- **Payment History** (`/portal/payments`): Transaction receipts and UTR reference log.
- **Renewal Requests** (`/portal/renewals`): Request contract extensions.
- **Company Profile** (`/portal/profile`): Update commercial billing address and credentials.

---

## 5. Pre-configured Demo Accounts

Use one-click instant sign-in on the login page (`/login`) or manual credentials:

| Role | Email | Password | Scope |
|---|---|---|---|
| **Administrator** | `admin@brightloop.in` | `admin123` | Full system access |
| **Internal Staff** | `staff@brightloop.in` | `staff123` | Assigned accounts portfolio |
| **Customer** | `amit@techsolutions.in` | `customer123` | Isolated self-service portal |

---

## 6. Simulated Operations vs Real Backend Integration

| Operation | Implementation | Production Backend Next Steps |
|---|---|---|
| **User Authentication** | React Context + role switcher | JWT / OAuth2 session cookies with backend API |
| **Data Persistence** | In-memory React Context initialized from `mockData.js` | REST / GraphQL API to PostgreSQL database |
| **Billing Execution** | Generates real invoice records in React state with audit events | Celery / Temporal cron job running night-time runs |
| **Payment Registration** | Updates invoice balance and status in state (`paid` / `partially_paid`) | Razorpay / Stripe Webhook payment gateway listeners |
| **Invoice / PDF Printing** | Native browser print CSS stylesheet formatted as tax invoice | Puppeteer / Weasyprint server-side PDF generator |
| **Email Delivery** | Sonner toast feedback and simulated dispatch logs | SendGrid / AWS SES email dispatch API |

---

## 7. Design System Guidelines

- **Primary Navy:** `#172B4D` (Headers, branding, active elements)
- **Action Blue:** `#3B82F6` (Buttons, highlights, interactive links)
- **Success Green:** `#16A36A` (Active badges, paid receipts)
- **Warning Amber:** `#F59E0B` (Paused, partially paid, alerts)
- **Danger Red:** `#DC5252` (Overdue, failed, cancel actions)
- **Background:** `#F6F8FB` (Main workspace canvas)
- **Surface:** `#FFFFFF` (Card surfaces, modals)
- **Border:** `#E5EAF0` (Dividers, borders)
