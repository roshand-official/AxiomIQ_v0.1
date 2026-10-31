// src/pages/portal/PortalSubscriptionsPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function PortalSubscriptionsPage() {
  const { user } = useAuth();
  const { subscriptions, plans, products } = useApp();

  const customerId = user?.customerId || 'CUST-001';

  const mySubs = useMemo(() => {
    return subscriptions
      .filter((s) => s.customerId === customerId)
      .map((s) => {
        const plan = plans.find((p) => p.id === s.planId);
        return {
          ...s,
          planName: plan?.name,
        };
      });
  }, [subscriptions, customerId, plans]);

  const columns = [
    {
      key: 'subscriptionNumber',
      label: 'Subscription #',
      render: (val, row) => (
        <Link
          to={`/portal/subscriptions/${row.id}`}
          className="font-mono text-xs font-semibold text-action hover:underline"
        >
          {val}
        </Link>
      ),
    },
    {
      key: 'planName',
      label: 'Plan Schedule',
      render: (val) => <span className="font-medium text-navy text-xs">{val}</span>,
    },
    {
      key: 'startDate',
      label: 'Effective Start',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'nextBillingDate',
      label: 'Next Renewal / Billing',
      render: (val) => <span className="font-mono text-xs font-medium text-navy">{val ? formatDate(val) : '—'}</span>,
    },
    {
      key: 'recurringAmount',
      label: 'Amount (GST Incl.)',
      align: 'right',
      render: (val) => <span className="font-mono tabular-nums font-bold text-navy text-xs">{formatCurrency(val)}</span>,
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
          to={`/portal/subscriptions/${row.id}`}
          className="btn btn-secondary btn-sm py-1 px-2.5 text-xs inline-flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Manage</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-1 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-navy">
          My Subscriptions & Licences
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Active cloud packages, renewal schedules, and add-on module configurations.
        </p>
      </div>

      <DataTable columns={columns} data={mySubs} pagination={false} />
    </div>
  );
}
