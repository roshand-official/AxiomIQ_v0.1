// src/pages/admin/StaffManagementPage.jsx
import { useState } from 'react';
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Users,
  Shield,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatRelativeTime, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, Modal } from '../../components/common';

export default function StaffManagementPage() {
  const { staff, customers, addStaffMember, updateStaffMember } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Account Manager',
    status: 'active',
    assignedCustomers: [],
  });

  const table = useTableState(staff, {
    searchFields: ['name', 'email', 'role'],
    initialSort: 'name',
    initialSortDir: 'asc',
  });

  const handleOpenAdd = () => {
    setSelectedStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Account Manager',
      status: 'active',
      assignedCustomers: [],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setSelectedStaff(s);
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      role: s.role,
      status: s.status,
      assignedCustomers: s.assignedCustomers || [],
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }

    if (selectedStaff) {
      updateStaffMember(selectedStaff.id, formData);
      toast.success('Staff member updated');
    } else {
      addStaffMember(formData);
      toast.success('Staff member added');
    }
    setModalOpen(false);
  };

  const handleCustomerToggle = (customerId) => {
    const current = formData.assignedCustomers || [];
    if (current.includes(customerId)) {
      setFormData({
        ...formData,
        assignedCustomers: current.filter((id) => id !== customerId),
      });
    } else {
      setFormData({
        ...formData,
        assignedCustomers: [...current, customerId],
      });
    }
  };

  const handleExport = () => {
    const data = staff.map((s) => ({
      ID: s.id,
      Name: s.name,
      Email: s.email,
      Role: s.role,
      AssignedCount: s.assignedCustomers?.length || 0,
      Status: s.status,
      LastActivity: s.lastActivity,
    }));
    downloadCSV(data, 'Brightloop_Staff');
    toast.success('Staff list exported to CSV');
  };

  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="font-semibold text-navy text-xs">{row.name}</span>
          <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
            <Mail className="w-3 h-3 text-gray-400" />
            <span>{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Operational Role',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-xs text-text-primary px-2 py-0.5 rounded bg-gray-100">
          {val}
        </span>
      ),
    },
    {
      key: 'assignedCustomers',
      label: 'Assigned Accounts',
      align: 'center',
      render: (val = []) => (
        <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-blue-50 text-action">
          {val.length} accounts
        </span>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Last Active',
      render: (val) => (
        <span className="text-xs text-text-secondary">
          {val ? formatRelativeTime(val) : '—'}
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
        <button
          type="button"
          onClick={() => handleOpenEdit(row)}
          className="p-1.5 rounded-lg text-text-secondary hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer"
          title="Edit Staff Member"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Internal Staff & Account Owners
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage commercial team members, role authorizations, and customer portfolio allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search staff by name, email, role..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'Account Manager', label: 'Account Manager' },
              { value: 'Account Executive', label: 'Account Executive' },
              { value: 'Billing Specialist', label: 'Billing Specialist' },
              { value: 'Support Specialist', label: 'Support Specialist' },
            ],
          },
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

      {/* Add / Edit Staff Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        subtitle="Administrator interface for allocating customer accounts and team permissions."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Priya Sharma"
              />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="priya@brightloop.in"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+91 98765 43211"
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="select-field"
              >
                <option value="Account Manager">Account Manager</option>
                <option value="Account Executive">Account Executive</option>
                <option value="Billing Specialist">Billing Specialist</option>
                <option value="Support Specialist">Support Specialist</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
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

          {/* Customer Allocation Checklist */}
          <div>
            <label className="label">
              Assigned Customer Accounts ({formData.assignedCustomers?.length || 0})
            </label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/50">
              {customers.map((c) => {
                const isChecked = (formData.assignedCustomers || []).includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-50 border-action/40 text-navy font-semibold'
                        : 'bg-white border-border text-text-secondary hover:bg-gray-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCustomerToggle(c.id)}
                      className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
                    />
                    <span className="truncate">{c.company || c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
