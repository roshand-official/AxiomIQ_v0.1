// src/pages/admin/DiscountsPage.jsx
import { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, Modal } from '../../components/common';

export default function DiscountsPage() {
  const { discounts, addDiscount, updateDiscount, products } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    minimumPurchase: 0,
    minimumQuantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    maxUsage: 50,
    wholeSubscription: true,
    status: 'active',
  });

  const table = useTableState(discounts, {
    searchFields: ['name', 'code', 'type'],
    initialSort: 'name',
    initialSortDir: 'asc',
  });

  const handleOpenAdd = () => {
    setSelectedDiscount(null);
    setFormData({
      name: '',
      code: '',
      type: 'percentage',
      value: '',
      minimumPurchase: 0,
      minimumQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      maxUsage: 50,
      wholeSubscription: true,
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (disc) => {
    setSelectedDiscount(disc);
    setFormData({
      name: disc.name,
      code: disc.code,
      type: disc.type,
      value: disc.value,
      minimumPurchase: disc.minimumPurchase || 0,
      minimumQuantity: disc.minimumQuantity || 1,
      startDate: disc.startDate || '',
      endDate: disc.endDate || '',
      maxUsage: disc.maxUsage || 50,
      wholeSubscription: !!disc.wholeSubscription,
      status: disc.status,
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.value) {
      toast.error('Name, Code, and Value are required');
      return;
    }

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().replace(/\s+/g, ''),
      value: Number(formData.value),
      minimumPurchase: Number(formData.minimumPurchase || 0),
      minimumQuantity: Number(formData.minimumQuantity || 1),
      maxUsage: Number(formData.maxUsage || 50),
    };

    if (selectedDiscount) {
      updateDiscount(selectedDiscount.id, payload);
      toast.success('Discount updated');
    } else {
      addDiscount(payload);
      toast.success('Discount rule created');
    }
    setModalOpen(false);
  };

  const handleExport = () => {
    const data = discounts.map((d) => ({
      ID: d.id,
      Name: d.name,
      Code: d.code,
      Type: d.type,
      Value: d.value,
      MinPurchase: d.minimumPurchase,
      Start: d.startDate,
      End: d.endDate,
      CurrentUsage: d.currentUsage,
      MaxUsage: d.maxUsage,
      Status: d.status,
    }));
    downloadCSV(data, 'Brightloop_Discounts');
    toast.success('Discounts exported to CSV');
  };

  const columns = [
    {
      key: 'code',
      label: 'Discount Code & Campaign',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono text-xs font-bold text-action bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {val}
          </span>
          <p className="font-semibold text-xs text-navy mt-1">{row.name}</p>
        </div>
      ),
    },
    {
      key: 'value',
      label: 'Benefit Value',
      sortable: true,
      render: (val, row) => (
        <span className="font-bold text-sm text-success">
          {row.type === 'percentage' ? `${val}% OFF` : `-${formatCurrency(val)}`}
        </span>
      ),
    },
    {
      key: 'minimumPurchase',
      label: 'Eligibility Thresholds',
      render: (val, row) => (
        <div className="text-xs text-text-secondary space-y-0.5">
          <p>Min Purchase: <span className="font-medium text-text-primary">{formatCurrency(val)}</span></p>
          <p>Min Seats: <span className="font-medium text-text-primary">{row.minimumQuantity || 1}</span></p>
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Validity Period',
      render: (_, row) => (
        <div className="text-xs text-text-secondary">
          <span>{formatDate(row.startDate)}</span>
          <span className="mx-1">→</span>
          <span>{formatDate(row.endDate)}</span>
        </div>
      ),
    },
    {
      key: 'currentUsage',
      label: 'Redemptions',
      align: 'center',
      render: (val, row) => (
        <div className="text-xs text-center">
          <span className="font-bold text-navy">{val}</span>
          <span className="text-text-secondary"> / {row.maxUsage}</span>
          <div className="w-16 bg-gray-200 h-1 rounded-full mx-auto mt-1 overflow-hidden">
            <div
              className="bg-action h-full rounded-full"
              style={{ width: `${Math.min(100, (val / row.maxUsage) * 100)}%` }}
            />
          </div>
        </div>
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
          title="Edit Discount"
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
            Discount & Promotional Coupons
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Create percentage discounts, fixed vouchers, redemption caps, and minimum purchase thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search coupons by code or campaign name..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'type',
            label: 'Discount Type',
            options: [
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed', label: 'Fixed Value' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'exhausted', label: 'Exhausted' },
              { value: 'expired', label: 'Expired' },
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

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedDiscount ? 'Edit Discount Rule' : 'Create Promotional Discount'}
        subtitle="Govern pricing deductions applicable at quotation and subscription checkout."
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Campaign Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Diwali Special"
              />
            </div>
            <div>
              <label className="label">Coupon Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field font-mono uppercase font-bold"
                placeholder="DIWALI2026"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="select-field"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Deduction (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">
                {formData.type === 'percentage' ? 'Deduction (%) *' : 'Amount (₹) *'}
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="input-field font-bold text-navy"
                placeholder={formData.type === 'percentage' ? '10' : '5000'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Purchase (₹)</label>
              <input
                type="number"
                value={formData.minimumPurchase}
                onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                className="input-field"
                placeholder="15000"
              />
            </div>
            <div>
              <label className="label">Max Allowed Redemptions</label>
              <input
                type="number"
                value={formData.maxUsage}
                onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                className="input-field"
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Effective Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Expiration Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
              <input
                type="checkbox"
                checked={formData.wholeSubscription}
                onChange={(e) => setFormData({ ...formData, wholeSubscription: e.target.checked })}
                className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
              />
              <span>Applies to Entire Subscription Package</span>
            </label>
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
              Save Discount
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
