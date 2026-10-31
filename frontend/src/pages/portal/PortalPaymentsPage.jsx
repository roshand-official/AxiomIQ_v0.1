// src/pages/portal/PortalPaymentsPage.jsx
import { useMemo } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function PortalPaymentsPage() {
  const { user } = useAuth();
  const { payments } = useApp();

  const customerId = user?.customerId || 'CUST-001';

  const myPayments = useMemo(
    () => payments.filter((p) => p.customerId === customerId),
    [payments, customerId]
  );

  const columns = [
    {
      key: 'reference',
      label: 'Receipt #',
      render: (val) => <span className="font-mono text-xs font-semibold text-navy">{val}</span>,
    },
    {
      key: 'paymentDate',
      label: 'Date',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'method',
      label: 'Channel',
      render: (val) => <span className="font-mono text-[11px] text-text-secondary uppercase">{val.replace('_', ' ')}</span>,
    },
    {
      key: 'referenceNumber',
      label: 'Transaction ID / UTR',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{val || '—'}</span>,
    },
    {
      key: 'amount',
      label: 'Paid Amount',
      align: 'right',
      render: (val) => <span className="font-mono tabular-nums font-bold text-success text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-1 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-navy">
          Payment History & Receipts
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Settled transactions and receipts for your account subscriptions.
        </p>
      </div>

      <DataTable columns={columns} data={myPayments} pagination={false} />
    </div>
  );
}
