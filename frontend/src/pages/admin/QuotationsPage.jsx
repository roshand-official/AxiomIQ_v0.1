// src/pages/admin/QuotationsPage.jsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Eye,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, Modal, ConfirmationDialog } from '../../components/common';

export default function QuotationsPage() {
  const navigate = useNavigate();
  const {
    quotations,
    customers,
    plans,
    products,
    productVariants,
    discounts,
    addQuotation,
    updateQuotation,
    convertQuotationToSubscription,
  } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [convertConfirmOpen, setConvertConfirmOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Form State for Structured Quotation Creation
  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('PLAN-001');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState(30);
  const [discountId, setDiscountId] = useState('');
  const [terms, setTerms] = useState('Payment within 15 days of invoice generation. Subscriptions auto-renew unless cancelled in writing 30 days prior.');
  const [notes, setNotes] = useState('');

  // Selected product lines
  const [lines, setLines] = useState([
    { productId: 'PROD-001', variantId: '', quantity: 1, unitPrice: 4500, subtotal: 4500 },
  ]);

  const quotationsWithDetails = useMemo(() => {
    return quotations.map((q) => {
      const cust = customers.find((c) => c.id === q.customerId);
      const plan = plans.find((p) => p.id === q.planId);
      return {
        ...q,
        customerName: cust?.company || cust?.name || q.customerId,
        planName: plan?.name || q.planId,
      };
    });
  }, [quotations, customers, plans]);

  const table = useTableState(quotationsWithDetails, {
    searchFields: ['id', 'customerName', 'planName', 'status'],
    initialSort: 'quotationDate',
    initialSortDir: 'desc',
  });

  const handleOpenCreate = () => {
    if (customers.length > 0) setCustomerId(customers[0].id);
    setPlanId('PLAN-001');
    setQuotationDate(new Date().toISOString().split('T')[0]);
    setDiscountId('');
    setLines([
      { productId: 'PROD-001', variantId: '', quantity: 1, unitPrice: 4500, subtotal: 4500 },
    ]);
    setCreateModalOpen(true);
  };

  const handleAddLine = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setLines([
      ...lines,
      { productId: firstProd.id, variantId: '', quantity: 1, unitPrice: firstProd.salesPrice, subtotal: firstProd.salesPrice },
    ]);
  };

  const handleRemoveLine = (idx) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineProductChange = (idx, prodId) => {
    const prod = products.find((p) => p.id === prodId);
    const updated = [...lines];
    updated[idx].productId = prodId;
    updated[idx].variantId = '';
    updated[idx].unitPrice = prod ? prod.salesPrice : 0;
    updated[idx].subtotal = (prod ? prod.salesPrice : 0) * updated[idx].quantity;
    setLines(updated);
  };

  const handleLineVariantChange = (idx, varId) => {
    const variant = productVariants.find((v) => v.id === varId);
    const prod = products.find((p) => p.id === lines[idx].productId);
    const updated = [...lines];
    updated[idx].variantId = varId;
    const price = variant ? variant.salesPrice : (prod ? prod.salesPrice : 0);
    updated[idx].unitPrice = price;
    updated[idx].subtotal = price * updated[idx].quantity;
    setLines(updated);
  };

  const handleLineQtyChange = (idx, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    const updated = [...lines];
    updated[idx].quantity = q;
    updated[idx].subtotal = updated[idx].unitPrice * q;
    setLines(updated);
  };

  // Calculations
  const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const selectedDiscount = discounts.find((d) => d.id === discountId);
  const discountAmount = selectedDiscount
    ? selectedDiscount.type === 'percentage'
      ? Math.round((subtotal * selectedDiscount.value) / 100)
      : selectedDiscount.value
    : 0;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxable * 0.18);
  const totalAmount = taxable + taxAmount;

  const handleSaveQuotation = (asStatus = 'draft') => {
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    const expDate = new Date(new Date(quotationDate).getTime() + validityDays * 86400000)
      .toISOString()
      .split('T')[0];

    const newQuo = addQuotation({
      customerId,
      planId,
      quotationDate,
      expiryDate: expDate,
      status: asStatus,
      subtotal,
      taxRate: 18,
      taxAmount,
      discountId: discountId || null,
      discountAmount,
      totalAmount,
      termsAndConditions: terms,
      notes,
      lines,
    });

    toast.success(`Quotation ${newQuo.id} created as ${asStatus}`);
    setCreateModalOpen(false);
  };

  const handleSendSimulation = (quo) => {
    updateQuotation(quo.id, { status: 'sent' });
    toast.success(`Quotation ${quo.id} emailed to customer.`);
  };

  const handleConvertToSub = () => {
    if (selectedQuote) {
      const sub = convertQuotationToSubscription(selectedQuote.id);
      if (sub) {
        toast.success(`Quotation converted! Subscription ${sub.subscriptionNumber} created.`);
        setConvertConfirmOpen(false);
        navigate(`/admin/subscriptions/${sub.id}`);
      }
    }
  };

  const handleExport = () => {
    const data = quotationsWithDetails.map((q) => ({
      QuotationID: q.id,
      Customer: q.customerName,
      Plan: q.planName,
      Date: q.quotationDate,
      Expiry: q.expiryDate,
      Subtotal: q.subtotal,
      Tax: q.taxAmount,
      Total: q.totalAmount,
      Status: q.status,
    }));
    downloadCSV(data, 'AxiomIQ_Quotations');
    toast.success('Quotations exported to CSV');
  };

  const columns = [
    {
      key: 'id',
      label: 'Quotation #',
      width: '120px',
      sortable: true,
      render: (val) => (
        <Link
          to={`/admin/quotations/${val}`}
          className="font-mono text-xs font-semibold text-navy hover:text-action hover:underline"
        >
          {val}
        </Link>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (_, row) => (
        <div>
          <Link
            to={`/admin/customers/${row.customerId}`}
            className="font-medium text-navy hover:text-action hover:underline"
          >
            {row.customerName}
          </Link>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Plan: <span className="font-medium text-text-primary">{row.planName}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'quotationDate',
      label: 'Date & Validity',
      sortable: true,
      render: (_, row) => (
        <div className="text-xs">
          <p className="font-medium text-text-primary">{formatDate(row.quotationDate)}</p>
          <p className="text-[11px] text-text-secondary">Exp: {formatDate(row.expiryDate)}</p>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-navy">{formatCurrency(val)}</span>
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
            to={`/admin/quotations/${row.id}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {row.status === 'draft' && (
            <button
              type="button"
              onClick={() => handleSendSimulation(row)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors cursor-pointer"
              title="Send to Customer"
            >
              <Send className="w-4 h-4" />
            </button>
          )}

          {(row.status === 'draft' || row.status === 'sent') && (
            <button
              type="button"
              onClick={() => {
                setSelectedQuote(row);
                setConvertConfirmOpen(true);
              }}
              className="btn btn-secondary btn-sm py-1 px-2 text-[11px] flex items-center gap-1 text-success border-success/30 hover:bg-emerald-50"
              title="Convert to Active Subscription"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Convert</span>
            </button>
          )}
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
            Quotation Management
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Prepare, price, discount, and convert commercial proposals into recurring subscriptions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search quotations by #, customer, plan..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'converted', label: 'Converted' },
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

      {/* Multi-section Create Quotation Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Subscription Quotation"
        subtitle="Multi-step pricing calculation with automatic taxes and discount validation."
        size="xl"
      >
        <div className="space-y-6">
          {/* Step 1 & 2: Customer & Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-border">
            <div>
              <label className="label">Client Account *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="select-field"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Recurrence Plan *</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="select-field"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.billingFrequency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Product Lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
                Product & Module Lines
              </h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-action hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product Line</span>
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => {
                const prod = products.find((p) => p.id === line.productId);
                const availableVariants = productVariants.filter(
                  (v) => v.productId === line.productId
                );

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-border rounded-xl grid grid-cols-12 gap-2.5 items-center text-xs"
                  >
                    <div className="col-span-5">
                      <select
                        value={line.productId}
                        onChange={(e) => handleLineProductChange(idx, e.target.value)}
                        className="select-field py-1.5 text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatCurrency(p.salesPrice)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <select
                        value={line.variantId}
                        onChange={(e) => handleLineVariantChange(idx, e.target.value)}
                        className="select-field py-1.5 text-xs"
                        disabled={availableVariants.length === 0}
                      >
                        <option value="">Base Edition</option>
                        {availableVariants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} (+{formatCurrency(v.additionalPrice)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleLineQtyChange(idx, e.target.value)}
                        className="input-field py-1.5 text-xs text-center"
                      />
                    </div>

                    <div className="col-span-2 text-right font-bold text-navy">
                      {formatCurrency(line.subtotal)}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length <= 1}
                        className="text-gray-400 hover:text-danger disabled:opacity-30 cursor-pointer"
                      >
                        <Trash className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Discounts & Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border">
            <div>
              <label className="label">Applicable Coupon Discount</label>
              <select
                value={discountId}
                onChange={(e) => setDiscountId(e.target.value)}
                className="select-field mb-3"
              >
                <option value="">No Discount</option>
                {discounts
                  .filter((d) => d.status === 'active')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name} ({d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)} off)
                    </option>
                  ))}
              </select>

              <label className="label">Terms & Commercial Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field text-xs resize-none"
                placeholder="Special billing instructions, payment terms, or custom delivery SLAs..."
              />
            </div>

            {/* Price Breakdown Summary */}
            <div className="bg-gray-50 p-4 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Line Subtotal:</span>
                <span className="font-semibold text-text-primary">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({selectedDiscount?.code}):</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Taxable Amount:</span>
                <span className="font-semibold text-text-primary">{formatCurrency(taxable)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST (18%):</span>
                <span className="font-semibold text-text-primary">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
                <span className="font-bold text-navy">Total Contract Value:</span>
                <span className="font-bold text-navy text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveQuotation('draft')}
              className="btn btn-secondary btn-sm"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveQuotation('sent')}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Save & Send to Client</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Convert to Subscription Confirmation */}
      <ConfirmationDialog
        open={convertConfirmOpen}
        onClose={() => setConvertConfirmOpen(false)}
        onConfirm={handleConvertToSub}
        title="Convert Quotation to Subscription"
        message={`Convert ${selectedQuote?.id} for ${selectedQuote?.customerName}? This will activate the commercial agreement and create subscription record ${selectedQuote?.id} in application state.`}
        confirmText="Confirm & Convert"
        confirmVariant="primary"
      />
    </div>
  );
}
