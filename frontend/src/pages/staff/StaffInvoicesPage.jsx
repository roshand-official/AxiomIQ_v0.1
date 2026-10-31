// src/pages/staff/StaffInvoicesPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileStack } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function StaffInvoicesPage() {
  const { user } = useAuth();
  const { invoices, customers } = useApp();

  const assignedCustomerIds = useMemo(() => {
    return user?.assignedCustomers || ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-005'];
  }, [user]);

  const assignedInvoices = useMemo(() => {
    return invoices
      .filter((i) => assignedCustomerIds.includes(i.customerId))
      .map((i) => {
        const cust = customers.find((c) => c.id === i.customerId);
        return {
          ...i,
          customerName: cust?.company || cust?.name,
        };
      });
  }, [invoices, assignedCustomerIds, customers]);

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (val, row) => (
        <Link to={`/admin/invoices/${row.id}`} className="font-mono text-xs font-semibold text-action hover:underline">
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
      key: 'dueDate',
      label: 'Due Date',
      render: (val) => <span className="text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Total Invoiced',
      align: 'right',
      render: (val) => <span className="font-semibold text-navy text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      align: 'right',
      render: (val) => (
        <span className={`font-bold text-xs ${val > 0 ? 'text-danger' : 'text-text-muted'}`}>
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
          to={`/admin/invoices/${row.id}`}
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
          Client Invoices & Receivables
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Billing statements and open balances for accounts in your portfolio.
        </p>
      </div>

      <DataTable columns={columns} data={assignedInvoices} pagination={false} />
    </div>
  );
}
