# Changelog

All notable changes to the **AxiomIQ Subscription Management System** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-31

### Added
- **Complete N-Tier Backend Architecture**:
  - Express.js REST API with structured controllers, business logic services, and data repositories.
  - PostgreSQL 16 database integration via Prisma ORM with 14 relational schemas.
  - JWT Authentication, bcrypt password hashing, and role-based access control (`admin`, `staff`, `customer`).
  - Automated seeding script with realistic corporate entities, plans, subscriptions, and invoices.
- **Frontend Subscription Operations Platform**:
  - React 19, Vite 8, and Tailwind CSS v4 design system inspired by Stripe and Linear.
  - Multi-role workspace routing: Administrator (`/admin`), Internal Staff (`/staff`), and Customer Self-Service Portal (`/portal`).
  - Interactive Executive KPI Dashboard with Recharts visualizations for MRR, ARR, and cash collections.
  - Contract Lifecycle State Machine (`draft` → `confirmed` → `active` → `paused` → `closed` / `expired`).
  - Operational Batch Billing Center for previewing eligible recurring accounts and generating GST tax invoices.
  - Revenue Risk Monitor for churn detection, overdue dunning, and failed billing alerts.
- **CI/CD & Open Source Governance**:
  - GitHub Actions CI matrix for backend and frontend linting/testing across Node.js 18 & 20.
  - CodeQL SAST security analysis and automated dependency vulnerability auditing.
  - Structured YAML issue templates, pull request template, and Dependabot automation.
  - Comprehensive documentation suite: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `SUPPORT.md`.

### Fixed
- Fixed prop-level naming discrepancy between `DataTable` and `Pagination` resolving `NaN–NaN` display artifacts across all data tables.
- Synchronized repository branding from legacy naming to **AxiomIQ**.
- Added safe numeric coercions to Indian Rupee (`₹`) currency formatters.
