// src/pages/admin/PlansPage.jsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Eye,
  Edit2,
  Calendar,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, Modal } from '../../components/common';

export default function PlansPage() {
  const navigate = useNavigate();
  const { plans, subscriptions, addPlan, updatePlan } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    billingFrequency: 'monthly',
    billingInterval: 1,
    minimumQuantity: 1,
    availableFrom: new Date().toISOString().split('T')[0],
    availableUntil: '',
    autoClose: false,
    autoCloseDays: '',
    allowEarlyClose: true,
    allowPause: true,
    allowRenewal: true,
    status: 'active',
  });

  const plansWithMetrics = useMemo(() => {
    return plans.map((p) => {
      const activeSubs = subscriptions.filter(
        (s) => s.planId === p.id && s.status === 'active'
      );
      return {
        ...p,
        activeSubscriptionsCount: activeSubs.length,
      };
    });
  }, [plans, subscriptions]);

  const table = useTableState(plansWithMetrics, {
    searchFields: ['name', 'description', 'billingFrequency'],
    initialSort: 'name',
    initialSortDir: 'asc',
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      description: '',
      billingFrequency: 'monthly',
      billingInterval: 1,
      minimumQuantity: 1,
      availableFrom: new Date().toISOString().split('T')[0],
      availableUntil: '',
      autoClose: false,
      autoCloseDays: '',
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
      status: 'active',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      billingFrequency: plan.billingFrequency,
      billingInterval: plan.billingInterval || 1,
      minimumQuantity: plan.minimumQuantity || 1,
      availableFrom: plan.availableFrom || '',
      availableUntil: plan.availableUntil || '',
      autoClose: !!plan.autoClose,
      autoCloseDays: plan.autoCloseDays || '',
      allowEarlyClose: !!plan.allowEarlyClose,
      allowPause: !!plan.allowPause,
      allowRenewal: !!plan.allowRenewal,
      status: plan.status,
    });
    setEditModalOpen(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Plan name is required');
      return;
    }

    const payload = {
      ...formData,
      billingInterval: Number(formData.billingInterval || 1),
      minimumQuantity: Number(formData.minimumQuantity || 1),
      autoCloseDays: formData.autoCloseDays ? Number(formData.autoCloseDays) : null,
    };

    if (editModalOpen && selectedPlan) {
      updatePlan(selectedPlan.id, payload);
      toast.success('Subscription plan updated');
      setEditModalOpen(false);
    } else {
      addPlan(payload);
      toast.success('New subscription plan launched');
      setAddModalOpen(false);
    }
  };

  const handleExport = () => {
    const data = plansWithMetrics.map((p) => ({
      ID: p.id,
      Name: p.name,
      Frequency: p.billingFrequency,
      Interval: p.billingInterval,
      MinQuantity: p.minimumQuantity,
      AvailableFrom: p.availableFrom,
      AvailableUntil: p.availableUntil || 'Ongoing',
      ActiveSubscriptions: p.activeSubscriptionsCount,
      Status: p.status,
    }));
    downloadCSV(data, 'AxoimIQQI_Subscription_Plans');
    toast.success('Plans exported to CSV');
  };

  const columns = [
    {
      key: 'name',
      label: 'Plan Name & Schedule',
      sortable: true,
      render: (_, row) => (
        <div>
          <Link
            to={`/admin/plans/${row.id}`}
            className="font-medium text-navy hover:text-action hover:underline"
          >
            {row.name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="capitalize font-semibold text-[11px] text-action bg-blue-50 px-2 py-0.5 rounded-full">
              {row.billingFrequency} (Every {row.billingInterval}{' '}
              {row.billingFrequency === 'daily'
                ? 'day'
                : row.billingFrequency === 'weekly'
                  ? 'wk'
                  : row.billingFrequency === 'yearly'
                    ? 'yr'
                    : 'mo'})
            </span>
            {row.description && (
              <span className="text-[11px] text-text-muted truncate max-w-xs">
                {row.description}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'minimumQuantity',
      label: 'Min Seats/Qty',
      align: 'center',
      sortable: true,
      render: (val) => <span className="font-semibold text-navy">{val}</span>,
    },
    {
      key: 'availableFrom',
      label: 'Validity Window',
      render: (_, row) => (
        <div className="text-xs text-text-secondary">
          <span>{formatDate(row.availableFrom)}</span>
          <span className="mx-1">→</span>
          <span>{row.availableUntil ? formatDate(row.availableUntil) : 'Ongoing'}</span>
        </div>
      ),
    },
    {
      key: 'activeSubscriptionsCount',
      label: 'Active Contracts',
      align: 'center',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-success">
          {val} active
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
            to={`/admin/plans/${row.id}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer"
            title="Edit Plan"
          >
            <Edit2 className="w-4 h-4" />
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
            Subscription Plans & Cadence
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Define recurring billing cycles, interval rules, pause permissions, and auto-close governance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search plans by title..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'billingFrequency',
            label: 'Cadence',
            options: [
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'daily', label: 'Daily' },
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

      {/* Create / Edit Plan Modal */}
      <Modal
        open={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={editModalOpen ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        subtitle="Govern commercial recurrence schedules, minimum user quantities, and lifecycle rules."
        size="lg"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Plan Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Annual Growth Tier"
              />
            </div>
            <div>
              <label className="label">Minimum Quantity / Seats</label>
              <input
                type="number"
                min="1"
                value={formData.minimumQuantity}
                onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Billing Cadence</label>
              <select
                value={formData.billingFrequency}
                onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                className="select-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="label">Interval Frequency</label>
              <input
                type="number"
                min="1"
                value={formData.billingInterval}
                onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                className="input-field"
                placeholder="1 (e.g. every 1 month or every 3 months for quarterly)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Available From</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Available Until (Optional)</label>
              <input
                type="date"
                value={formData.availableUntil}
                onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Plan Marketing Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              placeholder="Highlight savings or terms shown to client..."
            />
          </div>

          {/* Lifecycle Governance Flags */}
          <div className="p-4 bg-gray-50 rounded-xl border border-border space-y-3">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
              Subscription Lifecycle Governance
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={formData.allowPause}
                  onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                  className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
                />
                <span>Allow Pause</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={formData.allowEarlyClose}
                  onChange={(e) => setFormData({ ...formData, allowEarlyClose: e.target.checked })}
                  className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
                />
                <span>Allow Early Close</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={formData.allowRenewal}
                  onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                  className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
                />
                <span>Auto-Renewal</span>
              </label>
            </div>
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
              {editModalOpen ? 'Save Changes' : 'Launch Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
