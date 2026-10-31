// src/pages/admin/SubscriptionsPage.jsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Plus,
  Eye,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, ConfirmationDialog } from '../../components/common';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const {
    subscriptions,
    customers,
    plans,
    updateSubscriptionStatus,
    invoices,
  } = useApp();

  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [targetSubscription, setTargetSubscription] = useState(null);
  const [targetAction, setTargetAction] = useState('');

  const subscriptionsWithDetails = useMemo(() => {
    return subscriptions.map((s) => {
      const cust = customers.find((c) => c.id === s.customerId);
      const plan = plans.find((p) => p.id === s.planId);
      const subInvoices = invoices.filter((i) => i.subscriptionId === s.id);
      const unpaidInvoices = subInvoices.filter((i) => i.status !== 'paid');

      return {
        ...s,
        customerName: cust?.company || cust?.name || s.customerId,
        planName: plan?.name || s.planId,
        hasUnpaidInvoices: unpaidInvoices.length > 0,
      };
    });
  }, [subscriptions, customers, plans, invoices]);

  const table = useTableState(subscriptionsWithDetails, {
    searchFields: ['subscriptionNumber', 'customerName', 'planName', 'status'],
    initialSort: 'startDate',
    initialSortDir: 'desc',
  });

  const handleOpenAction = (sub, action) => {
    setTargetSubscription(sub);
    setTargetAction(action);
    setActionConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (!targetSubscription || !targetAction) return;

    updateSubscriptionStatus(targetSubscription.id, targetAction);
    toast.success(`Subscription ${targetSubscription.subscriptionNumber} status set to ${targetAction}`);
    setActionConfirmOpen(false);
  };

  const handleExport = () => {
    const data = subscriptionsWithDetails.map((s) => ({
      SubscriptionNo: s.subscriptionNumber,
      Customer: s.customerName,
      Plan: s.planName,
      StartDate: s.startDate,
      ExpiryDate: s.expiryDate || 'Ongoing',
      NextBilling: s.nextBillingDate || '—',
      Amount: s.recurringAmount,
      Status: s.status,
    }));
    downloadCSV(data, 'AxoimIQQI_Subscriptions');
    toast.success('Subscriptions exported to CSV');
  };

  const columns = [
    {
      key: 'subscriptionNumber',
      label: 'Subscription #',
      width: '150px',
      sortable: true,
      render: (val, row) => (
        <Link
          to={`/admin/subscriptions/${row.id}`}
          className="font-mono text-xs font-semibold text-navy hover:text-action hover:underline"
        >
          {val}
        </Link>
      ),
    },
    {
      key: 'customerName',
      label: 'Subscriber',
      sortable: true,
      render: (_, row) => (
        <div>
          <Link
            to={`/admin/customers/${row.customerId}`}
            className="font-medium text-navy hover:text-action hover:underline"
          >
            {row.customerName}
          </Link>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Plan: <span className="font-medium text-text-primary">{row.planName}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Contract Term',
      sortable: true,
      render: (_, row) => (
        <div className="text-xs">
          <p className="font-medium text-text-primary">{formatDate(row.startDate)}</p>
          <p className="text-[11px] text-text-secondary">
            Exp: {row.expiryDate ? formatDate(row.expiryDate) : 'Auto-renewing'}
          </p>
        </div>
      ),
    },
    {
      key: 'nextBillingDate',
      label: 'Next Billing',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-text-primary">
          {val ? formatDate(val) : '—'}
        </span>
      ),
    },
    {
      key: 'recurringAmount',
      label: 'Recurring Amount',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-navy">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/admin/subscriptions/${row.id}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {row.status === 'confirmed' && (
            <button
              type="button"
              onClick={() => handleOpenAction(row, 'active')}
              className="btn btn-secondary btn-sm py-1 px-2 text-[11px] text-success border-success/30 hover:bg-emerald-50"
              title="Activate subscription"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Activate</span>
            </button>
          )}

          {row.status === 'active' && (
            <button
              type="button"
              onClick={() => handleOpenAction(row, 'paused')}
              className="p-1.5 rounded-lg text-text-secondary hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer"
              title="Pause subscription"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {row.status === 'paused' && (
            <button
              type="button"
              onClick={() => handleOpenAction(row, 'active')}
              className="p-1.5 rounded-lg text-text-secondary hover:text-success hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Resume subscription"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Subscription Contracts
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Oversee active recurring contracts, lifecycle transitions, pause locks, and automated renewals.
          </p>
        </div>

        <Link
          to="/admin/quotations"
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </Link>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search by subscription #, subscriber, plan..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'paused', label: 'Paused' },
              { value: 'draft', label: 'Draft' },
              { value: 'expired', label: 'Expired' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        ]}
        filterValues={table.filters}
        onFilterChange={table.handleFilter}
        sortColumn={table.sortColumn}
        sortDirection={table.sortDirection}
        onSort={table.handleSort}
        pagination
        page={table.page}
        pageSize={table.pageSize}
        totalCount={table.totalCount}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        exportable
        onExport={handleExport}
      />

      {/* Action Confirmation Dialog */}
      <ConfirmationDialog
        open={actionConfirmOpen}
        onClose={() => setActionConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={`Confirm Subscription ${targetAction?.toUpperCase()}`}
        message={`Are you sure you want to transition subscription ${targetSubscription?.subscriptionNumber} to ${targetAction} status? This affects recurring billing eligibility.`}
        confirmText="Confirm Transition"
        confirmVariant={targetAction === 'closed' ? 'danger' : 'primary'}
      />
    </div>
  );
}
