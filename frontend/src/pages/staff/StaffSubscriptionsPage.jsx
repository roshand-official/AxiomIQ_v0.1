// src/pages/staff/StaffSubscriptionsPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function StaffSubscriptionsPage() {
  const { user } = useAuth();
  const { subscriptions, customers, plans } = useApp();

  const assignedCustomerIds = useMemo(() => {
    return user?.assignedCustomers || ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-005'];
  }, [user]);

  const assignedSubs = useMemo(() => {
    return subscriptions
      .filter((s) => assignedCustomerIds.includes(s.customerId))
      .map((s) => {
        const cust = customers.find((c) => c.id === s.customerId);
        const plan = plans.find((p) => p.id === s.planId);
        return {
          ...s,
          customerName: cust?.company || cust?.name,
          planName: plan?.name,
        };
      });
  }, [subscriptions, assignedCustomerIds, customers, plans]);

  const columns = [
    {
      key: 'subscriptionNumber',
      label: 'Subscription #',
      render: (val, row) => (
        <Link to={`/admin/subscriptions/${row.id}`} className="font-mono text-xs font-semibold text-action hover:underline">
          {val}
        </Link>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (val) => <span className="font-medium text-navy text-xs">{val}</span>,
    },
    {
      key: 'planName',
      label: 'Cadence Plan',
      render: (val) => <span className="text-xs text-text-secondary">{val}</span>,
    },
    {
      key: 'nextBillingDate',
      label: 'Next Billing',
      render: (val) => <span className="text-xs text-text-secondary">{val ? formatDate(val) : '—'}</span>,
    },
    {
      key: 'recurringAmount',
      label: 'Recurring Amount',
      align: 'right',
      render: (val) => <span className="font-bold text-navy text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Link
          to={`/admin/subscriptions/${row.id}`}
          className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors inline-block"
        >
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Managed Subscription Contracts
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Active subscriptions across your assigned client accounts.
        </p>
      </div>

      <DataTable columns={columns} data={assignedSubs} pagination={false} />
    </div>
  );
}
