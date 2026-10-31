// src/pages/admin/ProductsPage.jsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Layers,
  ArrowUpDown,
  Download,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, Modal, ConfirmationDialog } from '../../components/common';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, productVariants, addProduct, updateProduct, deleteProduct, addVariant } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    internalRef: '',
    type: 'subscription',
    salesPrice: '',
    costPrice: '',
    description: '',
    internalNotes: '',
    availableForSubscription: true,
    status: 'active',
  });

  // Variant Form State
  const [variantForm, setVariantForm] = useState({
    name: '',
    attribute: 'Edition',
    additionalPrice: '',
    status: 'active',
  });

  const productsWithVariants = useMemo(() => {
    return products.map((p) => {
      const vars = productVariants.filter((v) => v.productId === p.id);
      return {
        ...p,
        variantsCount: vars.length,
        variantsList: vars,
      };
    });
  }, [products, productVariants]);

  const table = useTableState(productsWithVariants, {
    searchFields: ['name', 'internalRef', 'type', 'description'],
    initialSort: 'name',
    initialSortDir: 'asc',
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      internalRef: `BL-PRD-${Math.floor(100 + Math.random() * 900)}`,
      type: 'subscription',
      salesPrice: '',
      costPrice: '',
      description: '',
      internalNotes: '',
      availableForSubscription: true,
      status: 'active',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setSelectedProduct(prod);
    setFormData({
      name: prod.name,
      internalRef: prod.internalRef,
      type: prod.type,
      salesPrice: prod.salesPrice,
      costPrice: prod.costPrice,
      description: prod.description || '',
      internalNotes: prod.internalNotes || '',
      availableForSubscription: prod.availableForSubscription,
      status: prod.status,
    });
    setEditModalOpen(true);
  };

  const handleOpenAddVariant = (prod) => {
    setSelectedProduct(prod);
    setVariantForm({
      name: '',
      attribute: 'Edition',
      additionalPrice: '',
      status: 'active',
    });
    setVariantModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.salesPrice) {
      toast.error('Product name and sales price are required');
      return;
    }

    const payload = {
      ...formData,
      salesPrice: Number(formData.salesPrice),
      costPrice: Number(formData.costPrice || 0),
    };

    if (editModalOpen && selectedProduct) {
      updateProduct(selectedProduct.id, payload);
      toast.success('Product updated successfully');
      setEditModalOpen(false);
    } else {
      addProduct(payload);
      toast.success('Product created successfully');
      setAddModalOpen(false);
    }
  };

  const handleSaveVariant = (e) => {
    e.preventDefault();
    if (!variantForm.name) {
      toast.error('Variant name is required');
      return;
    }

    const addPrice = Number(variantForm.additionalPrice || 0);
    addVariant({
      productId: selectedProduct.id,
      name: variantForm.name,
      attribute: variantForm.attribute,
      additionalPrice: addPrice,
      salesPrice: selectedProduct.salesPrice + addPrice,
      status: variantForm.status,
    });

    toast.success(`Variant "${variantForm.name}" created for ${selectedProduct.name}`);
    setVariantModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      toast.success('Product archived successfully');
      setDeleteConfirmOpen(false);
    }
  };

  const handleExport = () => {
    const data = productsWithVariants.map((p) => ({
      ID: p.id,
      Name: p.name,
      Reference: p.internalRef,
      Type: p.type,
      SalesPrice: p.salesPrice,
      CostPrice: p.costPrice,
      Variants: p.variantsCount,
      Status: p.status,
      CreatedDate: formatDate(p.createdAt),
    }));
    downloadCSV(data, 'AxiomIQ_Products');
    toast.success('Products exported to CSV');
  };

  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <Link
            to={`/admin/products/${row.id}`}
            className="font-medium text-navy hover:text-action hover:underline text-xs"
          >
            {row.name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[10px] text-text-secondary bg-surface-subtle border border-border px-1 py-0.2 rounded">
              {row.internalRef}
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
      key: 'type',
      label: 'Product Type',
      sortable: true,
      render: (val) => {
        const types = {
          subscription: { label: 'Software Subscription', color: 'bg-action-light text-action border border-action/20' },
          addon: { label: 'Add-on Module', color: 'bg-purple-50 text-purple-700 border border-purple-200' },
          'one-time': { label: 'One-time Service', color: 'bg-warning-light text-warning-dark border border-warning/20' },
        };
        const t = types[val] || { label: val, color: 'bg-surface-subtle text-text-secondary border border-border' };
        return (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${t.color}`}>
            {t.label}
          </span>
        );
      },
    },
    {
      key: 'salesPrice',
      label: 'Sales Price',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-navy font-mono tabular-nums">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'costPrice',
      label: 'Cost Price',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className="text-text-secondary font-mono tabular-nums text-xs">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'variantsCount',
      label: 'Variants',
      align: 'center',
      render: (val, row) => (
        <button
          type="button"
          onClick={() => handleOpenAddVariant(row)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-surface-subtle border border-border hover:bg-action-light hover:text-action font-medium transition-colors cursor-pointer"
          title="Click to add/manage variants"
        >
          <Layers className="w-3 h-3 text-text-muted" />
          <span className="font-mono tabular-nums">{val} variants</span>
        </button>
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
            to={`/admin/products/${row.id}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-rose-50 transition-colors cursor-pointer"
            title="Archive Product"
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
            Product & Add-on Catalog
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Configure software subscriptions, add-ons, implementation services, and product variants.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search products by name or code..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'type',
            label: 'Product Type',
            options: [
              { value: 'subscription', label: 'Subscription' },
              { value: 'addon', label: 'Add-on' },
              { value: 'one-time', label: 'One-time' },
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

      {/* Add / Edit Product Modal */}
      <Modal
        open={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={editModalOpen ? 'Edit Product' : 'Create New Product'}
        subtitle="Specify commercial pricing, category, and recurring availability."
        size="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g. AxiomIQ Analytics Suite"
              />
            </div>
            <div>
              <label className="label">Internal Reference</label>
              <input
                type="text"
                value={formData.internalRef}
                onChange={(e) => setFormData({ ...formData, internalRef: e.target.value })}
                className="input-field"
                placeholder="BL-ANL-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Product Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="select-field"
              >
                <option value="subscription">Software Subscription</option>
                <option value="addon">Add-on Module</option>
                <option value="one-time">One-time Service</option>
              </select>
            </div>
            <div>
              <label className="label">Sales Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.salesPrice}
                onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                className="input-field"
                placeholder="4500"
              />
            </div>
            <div>
              <label className="label">Cost Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="input-field"
                placeholder="1200"
              />
            </div>
          </div>

          <div>
            <label className="label">Product Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              placeholder="Commercial description displayed on quotation lines..."
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
              <input
                type="checkbox"
                checked={formData.availableForSubscription}
                onChange={(e) => setFormData({ ...formData, availableForSubscription: e.target.checked })}
                className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
              />
              <span>Available for Recurring Subscription</span>
            </label>

            <div className="flex items-center gap-2 ml-auto text-xs">
              <span className="text-text-secondary">Status:</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select-field py-1 text-xs"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              {editModalOpen ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Variant Modal */}
      <Modal
        open={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        title={`Add Variant to ${selectedProduct?.name}`}
        subtitle={`Base product price: ${formatCurrency(selectedProduct?.salesPrice || 0)}`}
        size="md"
      >
        <form onSubmit={handleSaveVariant} className="space-y-4">
          <div>
            <label className="label">Variant Name *</label>
            <input
              type="text"
              required
              value={variantForm.name}
              onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Odoo Brand, Enterprise Edition, Team 10-pack"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Attribute Type</label>
              <input
                type="text"
                value={variantForm.attribute}
                onChange={(e) => setVariantForm({ ...variantForm, attribute: e.target.value })}
                className="input-field"
                placeholder="Edition / Tier / User Limit"
              />
            </div>
            <div>
              <label className="label">Additional Surcharge (₹)</label>
              <input
                type="number"
                value={variantForm.additionalPrice}
                onChange={(e) => setVariantForm({ ...variantForm, additionalPrice: e.target.value })}
                className="input-field"
                placeholder="e.g. 560"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs">
            <div className="flex justify-between items-center text-text-primary">
              <span>Calculated Total Sales Price:</span>
              <span className="font-bold text-navy text-sm">
                {formatCurrency(
                  (selectedProduct?.salesPrice || 0) + Number(variantForm.additionalPrice || 0)
                )}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Example: Odoo Brand variant adds ₹560 to base price.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setVariantModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Variant
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Confirmation */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Archive Product"
        message={`Are you sure you want to archive "${selectedProduct?.name}"? It will no longer be available for new subscriptions.`}
        confirmText="Archive"
        confirmVariant="danger"
      />
    </div>
  );
}
