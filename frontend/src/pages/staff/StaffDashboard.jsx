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
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, getDaysOverdue } from '../../utils/formatters';
import { StatusBadge } from '../../components/common';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { customers, subscriptions, invoices, quotations, activities, renewals } = useApp();

  // Filter only assigned customers for the staff member
  const assignedCustomerIds = useMemo(() => {
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

  const overdueInvoices = assignedInvoices.filter(
    (i) => i.status === 'overdue' || (i.outstandingAmount > 0 && new Date(i.dueDate) < new Date())
  );

  const activeContractValue = assignedSubscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.recurringAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-1 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-navy">
          Staff Operational Overview
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Welcome back, <span className="font-semibold text-text-primary">{user?.name}</span>. Managing{' '}
          <strong className="text-navy font-mono tabular-nums">{assignedCustomers.length}</strong> corporate accounts.
        </p>
      </div>

      {/* Portfolio Operational Strip */}
      <div className="card grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Assigned Accounts
          </span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {assignedCustomers.length}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">Commercial ownership</p>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Portfolio ARR Run-rate
          </span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {formatCurrency(activeContractValue * 12)}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              MRR: <span className="font-mono">{formatCurrency(activeContractValue)}</span>
            </p>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Pending Proposals
          </span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {assignedQuotes.filter((q) => q.status === 'sent' || q.status === 'draft').length}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">In client review</p>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Overdue Follow-ups
          </span>
          <div className="mt-2">
            <p className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
              overdueInvoices.length > 0 ? 'text-danger' : 'text-navy'
            }`}>
              {overdueInvoices.length}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">Requires dunning notice</p>
          </div>
        </div>
      </div>

      {/* Workspace Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Assigned Customers Summary */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
            <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
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
              <tr className="bg-white border-b border-border text-text-secondary text-[11px] uppercase font-semibold">
                <th className="px-3.5 py-2">Company</th>
                <th className="px-3.5 py-2">Contact</th>
                <th className="px-3.5 py-2 text-center">Active Subs</th>
                <th className="px-3.5 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignedCustomers.map((c) => {
                const subCount = subscriptions.filter(
                  (s) => s.customerId === c.id && s.status === 'active'
                ).length;
                return (
                  <tr key={c.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-3.5 py-2.5 font-medium text-navy">{c.company || c.name}</td>
                    <td className="px-3.5 py-2.5 text-text-secondary">{c.name}</td>
                    <td className="px-3.5 py-2.5 text-center font-bold text-action font-mono tabular-nums">{subCount}</td>
                    <td className="px-3.5 py-2.5"><StatusBadge status={c.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Needed: Overdue Invoices */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
            <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
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
              <tr className="bg-white border-b border-border text-text-secondary text-[11px] uppercase font-semibold">
                <th className="px-3.5 py-2">Invoice #</th>
                <th className="px-3.5 py-2">Client</th>
                <th className="px-3.5 py-2 text-right">Balance</th>
                <th className="px-3.5 py-2">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {overdueInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted text-xs">
                    All assigned client invoices are settled or current.
                  </td>
                </tr>
              ) : (
                overdueInvoices.map((inv) => {
                  const cust = customers.find((c) => c.id === inv.customerId);
                  return (
                    <tr key={inv.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-medium text-navy">
                        <Link to={`/admin/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-3.5 py-2.5 font-medium text-text-primary">{cust?.company || cust?.name}</td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-danger font-mono tabular-nums">
                        {formatCurrency(inv.outstandingAmount)}
                      </td>
                      <td className="px-3.5 py-2.5 text-danger font-medium font-mono text-[11px]">
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
