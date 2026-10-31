// src/pages/staff/StaffCustomersPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Eye, Mail, Phone, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { DataTable } from '../../components/tables';
import { StatusBadge } from '../../components/common';

export default function StaffCustomersPage() {
  const { user } = useAuth();
  const { customers, subscriptions, invoices } = useApp();

  const assignedCustomerIds = useMemo(() => {
    return user?.assignedCustomers || ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-005'];
  }, [user]);

  const assignedCustomers = useMemo(() => {
    return customers
      .filter((c) => assignedCustomerIds.includes(c.id))
      .map((c) => {
        const custSubs = subscriptions.filter((s) => s.customerId === c.id && s.status === 'active');
        const custInvoices = invoices.filter((i) => i.customerId === c.id);
        const outstanding = custInvoices
          .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
          .reduce((sum, i) => sum + i.outstandingAmount, 0);

        return {
          ...c,
          activeSubsCount: custSubs.length,
          outstanding,
        };
      });
  }, [customers, assignedCustomerIds, subscriptions, invoices]);

  const columns = [
    {
      key: 'name',
      label: 'Account & Company',
      render: (_, row) => (
        <div>
          <span className="font-semibold text-navy text-xs">{row.company || row.name}</span>
          <p className="text-[11px] text-text-secondary mt-0.5">Contact: {row.name}</p>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (_, row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-text-primary">{row.email}</p>
          <p className="text-text-secondary">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Location',
      render: (_, row) => (
        <span className="text-xs text-text-secondary">
          {[row.city, row.state].filter(Boolean).join(', ')}
        </span>
      ),
    },
    {
      key: 'activeSubsCount',
      label: 'Active Contracts',
      align: 'center',
      render: (val) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-action">
          {val} active
        </span>
      ),
    },
    {
      key: 'outstanding',
      label: 'Outstanding Balance',
      align: 'right',
      render: (val) => (
        <span className={`font-semibold ${val > 0 ? 'text-danger' : 'text-text-muted'}`}>
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
          to={`/admin/customers/${row.id}`}
          className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors inline-block"
          title="Inspect Account"
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
          Assigned Customer Portfolio
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Accounts assigned to you for ongoing relationship management and renewal ownership.
        </p>
      </div>

      <DataTable columns={columns} data={assignedCustomers} pagination={false} />
    </div>
  );
}
