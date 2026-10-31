// src/pages/admin/ProductDetailPage.jsx
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Layers,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, Modal } from '../../components/common';

export default function ProductDetailPage() {
  const { id } = useParams();
  const {
    products,
    productVariants,
    subscriptions,
    plans,
    updateProduct,
    addVariant,
    updateVariant,
  } = useApp();

  const product = products.find((p) => p.id === id);

  const variants = useMemo(
    () => productVariants.filter((v) => v.productId === id),
    [productVariants, id]
  );

  // Subscriptions using this product
  const associatedSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => s.lines.some((l) => l.productId === id));
  }, [subscriptions, id]);

  const [editProductOpen, setEditProductOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

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

  const [variantForm, setVariantForm] = useState({
    name: '',
    attribute: 'Edition',
    additionalPrice: '',
    status: 'active',
  });

  const handleOpenEditProduct = () => {
    if (!product) return;
    setFormData({
      name: product.name,
      internalRef: product.internalRef,
      type: product.type,
      salesPrice: product.salesPrice,
      costPrice: product.costPrice,
      description: product.description || '',
      internalNotes: product.internalNotes || '',
      availableForSubscription: product.availableForSubscription,
      status: product.status,
    });
    setEditProductOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    updateProduct(id, {
      ...formData,
      salesPrice: Number(formData.salesPrice),
      costPrice: Number(formData.costPrice || 0),
    });
    toast.success('Product updated successfully');
    setEditProductOpen(false);
  };

  const handleOpenAddVariant = () => {
    setSelectedVariant(null);
    setVariantForm({
      name: '',
      attribute: 'Edition',
      additionalPrice: '',
      status: 'active',
    });
    setVariantModalOpen(true);
  };

  const handleOpenEditVariant = (v) => {
    setSelectedVariant(v);
    setVariantForm({
      name: v.name,
      attribute: v.attribute,
      additionalPrice: v.additionalPrice,
      status: v.status,
    });
    setVariantModalOpen(true);
  };

  const handleSaveVariant = (e) => {
    e.preventDefault();
    if (!variantForm.name) {
      toast.error('Variant name is required');
      return;
    }

    const addPrice = Number(variantForm.additionalPrice || 0);

    if (selectedVariant) {
      updateVariant(selectedVariant.id, {
        name: variantForm.name,
        attribute: variantForm.attribute,
        additionalPrice: addPrice,
        salesPrice: product.salesPrice + addPrice,
        status: variantForm.status,
      });
      toast.success('Variant updated');
    } else {
      addVariant({
        productId: id,
        name: variantForm.name,
        attribute: variantForm.attribute,
        additionalPrice: addPrice,
        salesPrice: product.salesPrice + addPrice,
        status: variantForm.status,
      });
      toast.success('Variant created');
    }
    setVariantModalOpen(false);
  };

  if (!product) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Product Not Found</h2>
        <Link to="/admin/products" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Catalog</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEditProduct}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Product</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddVariant}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variant</span>
          </button>
        </div>
      </div>

      {/* Product Overview Card */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-action-subtle text-action border border-action/20 flex items-center justify-center font-bold text-base flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-navy">{product.name}</h1>
                <StatusBadge status={product.status} />
              </div>
              <p className="text-xs font-mono text-text-secondary mt-0.5">
                Ref: {product.internalRef} • Type: <span className="capitalize font-semibold text-text-primary">{product.type}</span>
              </p>
              <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
                {product.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-surface-subtle p-3 rounded-lg border border-border">
            <div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Base Sales Price
              </p>
              <p className="text-base font-bold text-navy mt-0.5 font-mono tabular-nums">
                {formatCurrency(product.salesPrice)}
              </p>
            </div>
            <div className="w-px h-7 bg-border" />
            <div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Cost Price
              </p>
              <p className="text-base font-semibold text-text-secondary mt-0.5 font-mono tabular-nums">
                {formatCurrency(product.costPrice)}
              </p>
            </div>
            <div className="w-px h-7 bg-border" />
            <div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Active Contracts
              </p>
              <p className="text-base font-bold text-action mt-0.5 font-mono tabular-nums">
                {associatedSubscriptions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Variants & Associated Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Variants Card */}
        <div className="card overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between bg-surface-subtle">
            <div>
              <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
                Product Variants & Pricing Additions ({variants.length})
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Configured editions, tiers, and user capacity tiers
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddVariant}
              className="btn btn-secondary btn-sm text-xs py-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="divide-y divide-border">
            {variants.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-xs">
                <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>No variants configured for this product.</p>
                <button
                  type="button"
                  onClick={handleOpenAddVariant}
                  className="mt-2 text-action hover:underline font-medium"
                >
                  Create standard / branded variant
                </button>
              </div>
            ) : (
              variants.map((v) => (
                <div
                  key={v.id}
                  className="p-3 flex items-center justify-between hover:bg-surface-subtle/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-navy">{v.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-subtle text-text-secondary border border-border">
                        {v.attribute}
                      </span>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Surcharge: <span className="font-mono tabular-nums font-medium text-text-primary">+{formatCurrency(v.additionalPrice)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums font-bold text-xs text-navy">
                      {formatCurrency(v.salesPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditVariant(v)}
                      className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-subtle cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Associated Subscriptions */}
        <div className="card overflow-hidden">
          <div className="p-3 border-b border-border bg-surface-subtle">
            <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
              Associated Active Subscriptions ({associatedSubscriptions.length})
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Live customer contracts deploying this product
            </p>
          </div>

          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {associatedSubscriptions.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-xs">
                <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>No active customer subscriptions are using this product.</p>
              </div>
            ) : (
              associatedSubscriptions.map((sub) => {
                const plan = plans.find((p) => p.id === sub.planId);
                return (
                  <div
                    key={sub.id}
                    className="p-3 flex items-center justify-between hover:bg-surface-subtle/50 text-xs transition-colors"
                  >
                    <div>
                      <Link
                        to={`/admin/subscriptions/${sub.id}`}
                        className="font-mono font-medium text-navy hover:text-action hover:underline"
                      >
                        {sub.subscriptionNumber}
                      </Link>
                      <p className="text-text-secondary text-[11px] mt-0.5">
                        Plan: {plan?.name || sub.planId} • Renews: <span className="font-mono">{formatDate(sub.nextBillingDate)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono tabular-nums font-bold text-navy block">
                        {formatCurrency(sub.recurringAmount)}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <Modal
        open={editProductOpen}
        onClose={() => setEditProductOpen(false)}
        title="Edit Product Information"
        size="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Internal Reference</label>
              <input
                type="text"
                value={formData.internalRef}
                onChange={(e) => setFormData({ ...formData, internalRef: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="select-field"
              >
                <option value="subscription">Subscription</option>
                <option value="addon">Add-on</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
            <div>
              <label className="label">Sales Price (₹)</label>
              <input
                type="number"
                value={formData.salesPrice}
                onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Cost Price (₹)</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setEditProductOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Variant Modal */}
      <Modal
        open={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        title={selectedVariant ? 'Edit Variant' : `Add Variant to ${product.name}`}
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
              placeholder="e.g. Odoo Brand (+₹560)"
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
              />
            </div>
            <div>
              <label className="label">Surcharge Amount (₹)</label>
              <input
                type="number"
                value={variantForm.additionalPrice}
                onChange={(e) => setVariantForm({ ...variantForm, additionalPrice: e.target.value })}
                className="input-field"
              />
            </div>
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
    </div>
  );
}
