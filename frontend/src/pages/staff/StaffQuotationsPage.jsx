// src/pages/staff/StaffQuotationsPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function StaffQuotationsPage() {
  const { user } = useAuth();
  const { quotations, customers, plans } = useApp();

  const assignedCustomerIds = useMemo(() => {
    return user?.assignedCustomers || ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-005'];
  }, [user]);

  const assignedQuotes = useMemo(() => {
    return quotations
      .filter((q) => assignedCustomerIds.includes(q.customerId))
      .map((q) => {
        const cust = customers.find((c) => c.id === q.customerId);
        const plan = plans.find((p) => p.id === q.planId);
        return {
          ...q,
          customerName: cust?.company || cust?.name,
          planName: plan?.name,
        };
      });
  }, [quotations, assignedCustomerIds, customers, plans]);

  const columns = [
    {
      key: 'id',
      label: 'Quotation #',
      render: (val) => (
        <Link to={`/admin/quotations/${val}`} className="font-mono text-xs font-semibold text-action hover:underline">
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
      label: 'Plan',
      render: (val) => <span className="text-xs text-text-secondary">{val}</span>,
    },
    {
      key: 'expiryDate',
      label: 'Valid Until',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Total Value',
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
          to={`/admin/quotations/${row.id}`}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors inline-block"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-1 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-navy">
          Portfolio Quotations
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Quotations and pricing proposals generated for your assigned customer accounts.
        </p>
      </div>

      <DataTable columns={columns} data={assignedQuotes} pagination={false} />
    </div>
  );
}
