// src/pages/admin/CustomersPage.jsx
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Building,
  Mail,
  Phone,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import {
  DataTable,
} from '../../components/tables';
import {
  StatusBadge,
  Modal,
  ConfirmationDialog,
} from '../../components/common';

export default function CustomersPage() {
  const navigate = useNavigate();
  const { customers, subscriptions, invoices, addCustomer, updateCustomer, deleteCustomer } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    customerType: 'business',
    status: 'active',
    notes: '',
  });

  // Calculate customer financial summaries
  const customersWithMetrics = useMemo(() => {
    return customers.map((c) => {
      const custSubs = subscriptions.filter((s) => s.customerId === c.id);
      const activeSubs = custSubs.filter((s) => s.status === 'active');
      const custInvoices = invoices.filter((i) => i.customerId === c.id);
      const totalInvoiced = custInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const outstandingAmount = custInvoices
        .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((sum, inv) => sum + inv.outstandingAmount, 0);

      return {
        ...c,
        activeSubscriptionsCount: activeSubs.length,
        totalInvoiced,
        outstandingAmount,
      };
    });
  }, [customers, subscriptions, invoices]);

  // Hook for table state
  const table = useTableState(customersWithMetrics, {
    searchFields: ['name', 'company', 'email', 'phone', 'city'],
    initialSort: 'name',
    initialSortDir: 'asc',
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      customerType: 'business',
      status: 'active',
      notes: '',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      company: customer.company || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      postalCode: customer.postalCode || '',
      country: customer.country || 'India',
      customerType: customer.customerType || 'business',
      status: customer.status || 'active',
      notes: customer.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Customer name and email are required');
      return;
    }

    if (editModalOpen && selectedCustomer) {
      updateCustomer(selectedCustomer.id, formData);
      toast.success('Customer updated successfully');
      setEditModalOpen(false);
    } else {
      addCustomer(formData);
      toast.success('Customer added successfully');
      setAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id);
      toast.success('Customer deleted successfully');
      setDeleteConfirmOpen(false);
    }
  };

  const handleExport = () => {
    const exportData = customersWithMetrics.map((c) => ({
      ID: c.id,
      Name: c.name,
      Company: c.company,
      Email: c.email,
      Phone: c.phone,
      City: c.city,
      Status: c.status,
      ActiveSubscriptions: c.activeSubscriptionsCount,
      TotalInvoiced: c.totalInvoiced,
      Outstanding: c.outstandingAmount,
      CreatedDate: formatDate(c.createdAt),
    }));
    downloadCSV(exportData, 'AxiomIQ_Customers');
    toast.success('Customers exported to CSV');
  };

  const columns = [
    {
      key: 'id',
      label: 'Customer ID',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-[11px] font-medium text-text-secondary bg-surface-subtle border border-border px-1.5 py-0.5 rounded">
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Customer & Company',
      sortable: true,
      render: (_, row) => (
        <div>
          <Link
            to={`/admin/customers/${row.id}`}
            className="font-medium text-navy hover:text-action hover:underline text-xs"
          >
            {row.name}
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-0.5">
            <Building className="w-3 h-3 text-text-muted" />
            <span>{row.company || 'Individual'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact Info',
      render: (_, row) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-text-primary">
            <Mail className="w-3 h-3 text-text-muted" />
            <span className="font-mono text-[11px]">{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Phone className="w-3 h-3 text-text-muted" />
            <span className="font-mono text-[11px]">{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'activeSubscriptionsCount',
      label: 'Subscriptions',
      align: 'center',
      sortable: true,
      render: (val) => (
        <span className="font-semibold font-mono tabular-nums px-2 py-0.5 rounded text-[11px] bg-action-light text-action border border-action/20">
          {val} active
        </span>
      ),
    },
    {
      key: 'totalInvoiced',
      label: 'Total Invoiced',
      align: 'right',
      sortable: true,
      render: (val) => <span className="font-semibold font-mono tabular-nums text-navy">{formatCurrency(val)}</span>,
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span
          className={`font-semibold font-mono tabular-nums ${val > 0 ? 'text-danger' : 'text-text-muted'
            }`}
        >
          {formatCurrency(val)}
        </span>
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
            to={`/admin/customers/${row.id}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors"
            title="View customer profile"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer"
            title="Edit customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCustomer(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
            Customer Directory
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage subscriber accounts, commercial records, and billing profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search by name, company, email..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
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

      {/* Add / Edit Customer Modal */}
      <Modal
        open={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={editModalOpen ? 'Edit Customer' : 'Add New Customer'}
        subtitle="Fill in corporate contact information and subscription billing preferences."
        size="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Ramesh Chandra"
              />
            </div>
            <div>
              <label className="label">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input-field"
                placeholder="e.g. Apex Technologies LLP"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="name@company.in"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="label">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              placeholder="Suite, Street, Industrial Area"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
                placeholder="Bengaluru"
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="input-field"
                placeholder="Karnataka"
              />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="input-field"
                placeholder="560001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Classification</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="select-field"
              >
                <option value="business">Business / Corporate</option>
                <option value="individual">Individual / Retail</option>
              </select>
            </div>
            <div>
              <label className="label">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Internal Relationship Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field resize-none"
              placeholder="Commercial preferences, billing requirements, renewal history notes..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setAddModalOpen(false);
                setEditModalOpen(false);
              }}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {editModalOpen ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer Profile"
        message={`Are you sure you want to delete ${selectedCustomer?.company || selectedCustomer?.name}? This action will permanently remove the record from frontend state.`}
        confirmText="Delete Customer"
        confirmVariant="danger"
      />
    </div>
  );
}
