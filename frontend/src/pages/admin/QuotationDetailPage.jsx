// src/pages/admin/QuotationDetailPage.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Send,
  RefreshCw,
  Printer,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, ConfirmationDialog } from '../../components/common';

export default function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    quotations,
    customers,
    plans,
    products,
    productVariants,
    discounts,
    updateQuotation,
    convertQuotationToSubscription,
  } = useApp();

  const [convertConfirmOpen, setConvertConfirmOpen] = useState(false);

  const quotation = quotations.find((q) => q.id === id);
  const customer = customers.find((c) => c.id === quotation?.customerId);
  const plan = plans.find((p) => p.id === quotation?.planId);
  const discount = discounts.find((d) => d.id === quotation?.discountId);

  const handleSendSimulation = () => {
    updateQuotation(id, { status: 'sent' });
    toast.success(`Quotation ${id} sent to ${customer?.email}`);
  };

  const handleConvertToSub = () => {
    const sub = convertQuotationToSubscription(id);
    if (sub) {
      toast.success(`Quotation converted to subscription ${sub.subscriptionNumber}`);
      setConvertConfirmOpen(false);
      navigate(`/admin/subscriptions/${sub.id}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!quotation) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Quotation Not Found</h2>
        <Link to="/admin/quotations" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/quotations"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quotations</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          {quotation.status === 'draft' && (
            <button
              type="button"
              onClick={handleSendSimulation}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Customer</span>
            </button>
          )}

          {(quotation.status === 'draft' || quotation.status === 'sent') && (
            <button
              type="button"
              onClick={() => setConvertConfirmOpen(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Convert to Subscription</span>
            </button>
          )}

          {quotation.status === 'converted' && quotation.convertedToSubscription && (
            <Link
              to={`/admin/subscriptions/${quotation.convertedToSubscription}`}
              className="btn btn-success btn-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View Subscription</span>
            </Link>
          )}
        </div>
      </div>

      {/* Printable Quotation Document Card */}
      <div className="card p-8 bg-white shadow-md border border-border space-y-8">
        {/* Header Branding & Metadata */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-action font-bold text-xl">
              <span>AxoimIQQI</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              AxoimIQQI Technologies India Pvt. Ltd.
            </p>
            <p className="text-xs text-text-secondary">
              Koramangala 4th Block, Bengaluru, KA 560034
            </p>
            <p className="text-xs text-text-secondary">
              GSTIN: 29AABCU9603R1ZM
            </p>
          </div>

          <div className="sm:text-right">
            <h1 className="text-2xl font-bold font-mono text-navy">{quotation.id}</h1>
            <div className="mt-1">
              <StatusBadge status={quotation.status} />
            </div>
            <div className="mt-3 text-xs text-text-secondary space-y-1">
              <p>
                Quotation Date: <span className="font-semibold text-text-primary">{formatDate(quotation.quotationDate)}</span>
              </p>
              <p>
                Valid Until: <span className="font-semibold text-text-primary">{formatDate(quotation.expiryDate)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Client & Plan Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <p className="font-bold text-navy uppercase tracking-wider mb-1.5">
              Prepared For
            </p>
            <p className="font-semibold text-text-primary text-sm">
              {customer?.company || customer?.name}
            </p>
            <p className="text-text-secondary mt-0.5">{customer?.name}</p>
            <p className="text-text-secondary">{customer?.email}</p>
            <p className="text-text-secondary">{customer?.phone}</p>
            <p className="text-text-secondary mt-1">{customer?.address}, {customer?.city}</p>
          </div>

          <div className="sm:text-right">
            <p className="font-bold text-navy uppercase tracking-wider mb-1.5">
              Subscription Plan & Terms
            </p>
            <p className="font-semibold text-text-primary text-sm">
              {plan?.name || quotation.planId}
            </p>
            <p className="text-text-secondary capitalize">
              Billing Cadence: {plan?.billingFrequency} (Every {plan?.billingInterval} interval)
            </p>
            <p className="text-text-secondary mt-1">
              Payment Terms: Net 15 Days
            </p>
          </div>
        </div>

        {/* Product Lines Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-y border-border text-text-secondary uppercase font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Edition / Variant</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quotation.lines.map((l, idx) => {
                const prod = products.find((p) => p.id === l.productId);
                const variant = productVariants.find((v) => v.id === l.variantId);
                return (
                  <tr key={idx}>
                    <td className="py-3 px-3">
                      <span className="font-medium text-navy block">{prod?.name || l.productId}</span>
                      <span className="text-[11px] text-text-secondary">{prod?.internalRef}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-text-secondary">
                      {variant?.name || 'Base'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-navy">
                      {l.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-text-secondary">
                      {formatCurrency(l.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-navy">
                      {formatCurrency(l.subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Summary */}
        <div className="flex justify-end text-xs">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal:</span>
              <span className="font-semibold text-navy">{formatCurrency(quotation.subtotal)}</span>
            </div>
            {quotation.discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount ({discount?.code || 'Applied'}):</span>
                <span className="font-semibold">-{formatCurrency(quotation.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-secondary">
              <span>GST (18%):</span>
              <span className="font-semibold text-navy">{formatCurrency(quotation.taxAmount)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
              <span className="font-bold text-navy">Total Contract Price:</span>
              <span className="font-bold text-navy text-base">{formatCurrency(quotation.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="pt-4 border-t border-border text-[11px] text-text-secondary space-y-1">
          <p className="font-semibold text-text-primary">Terms & Conditions:</p>
          <p>{quotation.termsAndConditions || 'Standard subscription terms apply.'}</p>
          {quotation.notes && <p className="italic mt-1">Note: {quotation.notes}</p>}
        </div>
      </div>

      {/* Convert confirmation */}
      <ConfirmationDialog
        open={convertConfirmOpen}
        onClose={() => setConvertConfirmOpen(false)}
        onConfirm={handleConvertToSub}
        title="Convert Quotation to Subscription"
        message={`Convert this quotation into a live recurring subscription for ${customer?.company || customer?.name}?`}
        confirmText="Confirm & Convert"
        confirmVariant="primary"
      />
    </div>
  );
}
