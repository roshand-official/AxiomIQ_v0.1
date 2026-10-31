// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout, StaffLayout, PortalLayout } from '../components/layout';

// Auth
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import CustomersPage from '../pages/admin/CustomersPage';
import CustomerDetailPage from '../pages/admin/CustomerDetailPage';
import ProductsPage from '../pages/admin/ProductsPage';
import ProductDetailPage from '../pages/admin/ProductDetailPage';
import PlansPage from '../pages/admin/PlansPage';
import PlanDetailPage from '../pages/admin/PlanDetailPage';
import QuotationsPage from '../pages/admin/QuotationsPage';
import QuotationDetailPage from '../pages/admin/QuotationDetailPage';
import SubscriptionsPage from '../pages/admin/SubscriptionsPage';
import SubscriptionDetailPage from '../pages/admin/SubscriptionDetailPage';
import BillingCenterPage from '../pages/admin/BillingCenterPage';
import InvoicesPage from '../pages/admin/InvoicesPage';
import InvoiceDetailPage from '../pages/admin/InvoiceDetailPage';
import PaymentsPage from '../pages/admin/PaymentsPage';
import DiscountsPage from '../pages/admin/DiscountsPage';
import FinancialReportsPage from '../pages/admin/FinancialReportsPage';
import RevenueRiskPage from '../pages/admin/RevenueRiskPage';
import SubscriptionAnalyticsPage from '../pages/admin/SubscriptionAnalyticsPage';
import StaffManagementPage from '../pages/admin/StaffManagementPage';
import SettingsPage from '../pages/admin/SettingsPage';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffCustomersPage from '../pages/staff/StaffCustomersPage';
import StaffQuotationsPage from '../pages/staff/StaffQuotationsPage';
import StaffSubscriptionsPage from '../pages/staff/StaffSubscriptionsPage';
import StaffInvoicesPage from '../pages/staff/StaffInvoicesPage';
import StaffPaymentsPage from '../pages/staff/StaffPaymentsPage';
import StaffBillingActivityPage from '../pages/staff/StaffBillingActivityPage';

// Portal Pages
import PortalDashboard from '../pages/portal/PortalDashboard';
import PortalSubscriptionsPage from '../pages/portal/PortalSubscriptionsPage';
import PortalSubscriptionDetailPage from '../pages/portal/PortalSubscriptionDetailPage';
import PortalInvoicesPage from '../pages/portal/PortalInvoicesPage';
import PortalInvoiceDetailPage from '../pages/portal/PortalInvoiceDetailPage';
import PortalPaymentsPage from '../pages/portal/PortalPaymentsPage';
import PortalRenewalsPage from '../pages/portal/PortalRenewalsPage';
import PortalProfilePage from '../pages/portal/PortalProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Administrator Workspace Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plans/:id" element={<PlanDetailPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/:id" element={<QuotationDetailPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="subscriptions/:id" element={<SubscriptionDetailPage />} />
        <Route path="billing" element={<BillingCenterPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="reports" element={<FinancialReportsPage />} />
        <Route path="revenue-risk" element={<RevenueRiskPage />} />
        <Route path="analytics" element={<SubscriptionAnalyticsPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Internal Staff Workspace Routes */}
      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="customers" element={<StaffCustomersPage />} />
        <Route path="quotations" element={<StaffQuotationsPage />} />
        <Route path="subscriptions" element={<StaffSubscriptionsPage />} />
        <Route path="invoices" element={<StaffInvoicesPage />} />
        <Route path="payments" element={<StaffPaymentsPage />} />
        <Route path="billing-activity" element={<StaffBillingActivityPage />} />
      </Route>

      {/* Customer Self-Service Portal Routes */}
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="dashboard" element={<PortalDashboard />} />
        <Route path="subscriptions" element={<PortalSubscriptionsPage />} />
        <Route path="subscriptions/:id" element={<PortalSubscriptionDetailPage />} />
        <Route path="invoices" element={<PortalInvoicesPage />} />
        <Route path="invoices/:id" element={<PortalInvoiceDetailPage />} />
        <Route path="payments" element={<PortalPaymentsPage />} />
        <Route path="renewals" element={<PortalRenewalsPage />} />
        <Route path="profile" element={<PortalProfilePage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
