// src/pages/portal/PortalInvoicesPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileStack, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function PortalInvoicesPage() {
  const { user } = useAuth();
  const { invoices } = useApp();

  const customerId = user?.customerId || 'CUST-001';

  const myInvoices = useMemo(
    () => invoices.filter((i) => i.customerId === customerId),
    [invoices, customerId]
  );

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (val, row) => (
        <Link
          to={`/portal/invoices/${row.id}`}
          className="font-mono text-xs font-semibold text-action hover:underline"
        >
          {val}
        </Link>
      ),
    },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'dueDate',
      label: 'Payment Due Date',
      render: (val, row) => {
        const isOverdue = row.outstandingAmount > 0 && new Date(val) < new Date();
        return (
          <span className={`font-mono text-xs font-medium ${isOverdue ? 'text-danger font-bold' : 'text-text-primary'}`}>
            {formatDate(val)}
          </span>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Total Bill (₹)',
      align: 'right',
      render: (val) => <span className="font-mono tabular-nums font-bold text-navy text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'outstandingAmount',
      label: 'Balance Due',
      align: 'right',
      render: (val) => (
        <span className={`font-mono tabular-nums font-bold text-xs ${val > 0 ? 'text-danger' : 'text-text-muted'}`}>
          {formatCurrency(val)}
        </span>
      ),
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
          to={`/portal/invoices/${row.id}`}
          className="btn btn-secondary btn-sm py-1 px-2.5 text-xs inline-flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{row.outstandingAmount > 0 ? 'Pay / View' : 'View'}</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-1 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-navy">
          Billing Statements & Invoices
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          GST-compliant tax invoices, payment receipts, and balance settlement.
        </p>
      </div>

      <DataTable columns={columns} data={myInvoices} pagination={false} />
    </div>
  );
}
