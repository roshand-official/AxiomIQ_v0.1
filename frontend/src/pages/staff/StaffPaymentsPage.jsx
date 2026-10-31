// src/pages/staff/StaffPaymentsPage.jsx
import { useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function StaffPaymentsPage() {
  const { user } = useAuth();
  const { payments, customers } = useApp();

  const assignedCustomerIds = useMemo(() => {
    return user?.assignedCustomers || ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-005'];
  }, [user]);

  const assignedPayments = useMemo(() => {
    return payments
      .filter((p) => assignedCustomerIds.includes(p.customerId))
      .map((p) => {
        const cust = customers.find((c) => c.id === p.customerId);
        return {
          ...p,
          customerName: cust?.company || cust?.name,
        };
      });
  }, [payments, assignedCustomerIds, customers]);

  const columns = [
    {
      key: 'reference',
      label: 'Receipt #',
      render: (val) => <span className="font-mono text-xs font-semibold text-navy">{val}</span>,
    },
    {
      key: 'customerName',
      label: 'Client Account',
      render: (val) => <span className="font-medium text-navy text-xs">{val}</span>,
    },
    {
      key: 'paymentDate',
      label: 'Date',
      render: (val) => <span className="text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'method',
      label: 'Channel',
      render: (val) => <span className="uppercase text-xs font-medium">{val.replace('_', ' ')}</span>,
    },
    {
      key: 'amount',
      label: 'Collected Amount',
      align: 'right',
      render: (val) => <span className="font-bold text-success text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Client Payment Receipts
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Settled payments and collection transactions for your assigned accounts.
        </p>
      </div>

      <DataTable columns={columns} data={assignedPayments} pagination={false} />
    </div>
  );
}
