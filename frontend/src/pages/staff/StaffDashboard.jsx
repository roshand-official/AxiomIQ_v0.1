// src/pages/staff/StaffDashboard.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  RefreshCw,
  FileText,
  CreditCard,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, getDaysOverdue } from '../../utils/formatters';
import { KPICard, StatusBadge, ActivityTimeline } from '../../components/common';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { customers, subscriptions, invoices, quotations, activities, renewals } = useApp();

  // Filter only assigned customers for the staff member
  const assignedCustomerIds = useMemo(() => {
    // If user has assignedCustomers, use it, or default to Priya's assigned customers
    return user?.assignedCustomers || ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-005'];
  }, [user]);

  const assignedCustomers = useMemo(() => {
    return customers.filter((c) => assignedCustomerIds.includes(c.id));
  }, [customers, assignedCustomerIds]);

  const assignedSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => assignedCustomerIds.includes(s.customerId));
  }, [subscriptions, assignedCustomerIds]);

  const assignedInvoices = useMemo(() => {
    return invoices.filter((i) => assignedCustomerIds.includes(i.customerId));
  }, [invoices, assignedCustomerIds]);

  const assignedQuotes = useMemo(() => {
    return quotations.filter((q) => assignedCustomerIds.includes(q.customerId));
  }, [quotations, assignedCustomerIds]);

  const assignedRenewals = useMemo(() => {
    return renewals.filter((r) => assignedCustomerIds.includes(r.customerId));
  }, [renewals, assignedCustomerIds]);

  const overdueInvoices = assignedInvoices.filter(
    (i) => i.status === 'overdue' || (i.outstandingAmount > 0 && new Date(i.dueDate) < new Date())
  );

  const activeContractValue = assignedSubscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.recurringAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Staff Operational Overview
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Welcome back, <span className="font-semibold text-text-primary">{user?.name}</span>. Managing {assignedCustomers.length} corporate accounts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Assigned Accounts"
          value={assignedCustomers.length}
          change="Commercial ownership"
          trend="up"
          color="navy"
          icon={Users}
        />
        <KPICard
          title="Portfolio Recurring ARR"
          value={formatCurrency(activeContractValue)}
          change="Across active subscriptions"
          trend="up"
          color="action"
          icon={RefreshCw}
        />
        <KPICard
          title="Pending Proposals"
          value={assignedQuotes.filter((q) => q.status === 'sent' || q.status === 'draft').length}
          change="In customer review"
          trend="up"
          color="warning"
          icon={FileText}
        />
        <KPICard
          title="Overdue Invoices"
          value={overdueInvoices.length}
          change="Requires customer follow-up"
          trend="down"
          color="danger"
          icon={AlertTriangle}
        />
      </div>

      {/* Workspace Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Customers Summary */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-navy">
              My Portfolio Accounts ({assignedCustomers.length})
            </h3>
            <Link
              to="/staff/customers"
              className="text-xs text-action hover:underline font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Contact</th>
                <th className="px-4 py-2.5 text-center">Active Subs</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignedCustomers.map((c) => {
                const subCount = subscriptions.filter(
                  (s) => s.customerId === c.id && s.status === 'active'
                ).length;
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-navy">{c.company || c.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.name}</td>
                    <td className="px-4 py-3 text-center font-bold text-action">{subCount}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Needed: Overdue Invoices */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-navy">
              Collection Follow-ups Required ({overdueInvoices.length})
            </h3>
            <Link
              to="/staff/invoices"
              className="text-xs text-action hover:underline font-medium flex items-center gap-1"
            >
              <span>View invoices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-2.5">Invoice #</th>
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5 text-right">Balance</th>
                <th className="px-4 py-2.5">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {overdueInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    All assigned client invoices are settled or current!
                  </td>
                </tr>
              ) : (
                overdueInvoices.map((inv) => {
                  const cust = customers.find((c) => c.id === inv.customerId);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono font-medium text-navy">
                        <Link to={`/admin/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">{cust?.company || cust?.name}</td>
                      <td className="px-4 py-3 text-right font-bold text-danger">
                        {formatCurrency(inv.outstandingAmount)}
                      </td>
                      <td className="px-4 py-3 text-danger font-medium">
                        {getDaysOverdue(inv.dueDate)} days
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
