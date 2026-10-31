// src/pages/admin/InvoiceDetailPage.jsx
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Printer,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, Modal, AxiomLogo } from '../../components/common';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const {
    invoices,
    customers,
    subscriptions,
    payments,
    registerPayment,
  } = useApp();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const invoice = invoices.find((i) => i.id === id);
  const customer = customers.find((c) => c.id === invoice?.customerId);
  const subscription = subscriptions.find((s) => s.id === invoice?.subscriptionId);

  const relatedPayments = useMemo(() => {
    return payments.filter((p) => p.invoiceId === id);
  }, [payments, id]);

  const handleOpenPayment = () => {
    if (!invoice) return;
    setPaymentAmount(invoice.outstandingAmount);
    setPaymentRef(`TXN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentModalOpen(true);
  };

  const handleRegisterPayment = (e) => {
    e.preventDefault();
    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amt > invoice.outstandingAmount) {
      toast.error('Payment cannot exceed outstanding balance');
      return;
    }

    registerPayment({
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      paymentDate: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      amount: amt,
      referenceNumber: paymentRef,
      note: paymentNote,
    });

    toast.success(`Payment of ${formatCurrency(amt)} recorded`);
    setPaymentModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Invoice Not Found</h2>
        <Link to="/admin/invoices" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Action buttons */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/invoices"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Invoices</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          {invoice.outstandingAmount > 0 && (
            <button
              type="button"
              onClick={handleOpenPayment}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Register Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Tax Invoice Document */}
      <div className="card p-8 bg-white shadow-md border border-border space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-border">
          <div>
            <AxiomLogo variant="full" size="md" theme="light" />
            <p className="text-xs text-text-secondary mt-2">
              AxiomIQ Technologies India Pvt. Ltd.
            </p>
            <p className="text-xs text-text-secondary">
              Koramangala 4th Block, Bengaluru, KA 560034
            </p>
            <p className="text-xs text-text-secondary">
              GSTIN: 29AABCU9603R1ZM • PAN: AABCU9603R
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs uppercase font-bold text-text-muted tracking-wider block">
              Original Tax Invoice
            </span>
            <h1 className="text-2xl font-bold font-mono text-navy mt-0.5">
              {invoice.invoiceNumber}
            </h1>
            <div className="mt-1">
              <StatusBadge status={invoice.status} />
            </div>
            <div className="mt-3 text-xs text-text-secondary space-y-1">
              <p>
                Invoice Date:{' '}
                <span className="font-semibold text-text-primary">{formatDate(invoice.invoiceDate)}</span>
              </p>
              <p>
                Due Date:{' '}
                <span className="font-semibold text-text-primary">{formatDate(invoice.dueDate)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bill To & Subscription References */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <p className="font-bold text-navy uppercase tracking-wider mb-1.5">
              Billed To
            </p>
            <p className="font-semibold text-text-primary text-sm">
              {customer?.company || customer?.name}
            </p>
            <p className="text-text-secondary mt-0.5">Attn: {customer?.name}</p>
            <p className="text-text-secondary">{customer?.email}</p>
            <p className="text-text-secondary">{customer?.address}, {customer?.city}, {customer?.state}</p>
            <p className="text-text-secondary mt-1 font-mono">Place of Supply: {customer?.state || 'Karnataka'}</p>
          </div>

          <div className="sm:text-right">
            <p className="font-bold text-navy uppercase tracking-wider mb-1.5">
              Subscription Reference
            </p>
            <p className="font-mono font-semibold text-action text-sm">
              <Link to={`/admin/subscriptions/${invoice.subscriptionId}`} className="hover:underline">
                {subscription?.subscriptionNumber || invoice.subscriptionId}
              </Link>
            </p>
            <p className="text-text-secondary mt-0.5">Payment Terms: Net 15 Days</p>
            <p className="text-text-secondary">Invoice Status: {invoice.status.toUpperCase()}</p>
          </div>
        </div>

        {/* Invoice Line Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-y border-border text-text-secondary uppercase font-semibold">
                <th className="py-2.5 px-3">Item & Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Tax Rate</th>
                <th className="py-2.5 px-3 text-right">Line Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.lines.map((line, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-medium text-navy">
                    {line.description}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-navy">
                    {line.quantity}
                  </td>
                  <td className="py-3 px-3 text-right text-text-secondary">
                    {formatCurrency(line.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right text-text-secondary">
                    {line.taxRate || 18}% GST
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-navy">
                    {formatCurrency(line.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="flex justify-end text-xs">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal:</span>
              <span className="font-semibold text-navy">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount:</span>
                <span className="font-semibold">-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-secondary">
              <span>GST (18%):</span>
              <span className="font-semibold text-navy">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
              <span className="font-bold text-navy">Invoice Total:</span>
              <span className="font-bold text-navy text-base">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-success font-medium">
              <span>Paid to Date:</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
              <span className="font-bold text-danger">Balance Due:</span>
              <span className="font-bold text-danger text-base">{formatCurrency(invoice.outstandingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment History List */}
        <div className="pt-6 border-t border-border">
          <h4 className="font-bold text-navy text-xs uppercase tracking-wider mb-3">
            Recorded Payment Receipts ({relatedPayments.length})
          </h4>

          {relatedPayments.length === 0 ? (
            <p className="text-xs text-text-secondary italic">
              No payments recorded against this invoice yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-border text-text-secondary">
                    <th className="py-2 px-3">Receipt Ref</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Method</th>
                    <th className="py-2 px-3">Txn #</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {relatedPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-mono font-medium text-navy">{p.reference}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{formatDate(p.paymentDate)}</td>
                      <td className="py-2.5 px-3 uppercase text-text-primary">{p.method.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 font-mono text-text-secondary">{p.referenceNumber || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-success">{formatCurrency(p.amount)}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Register Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Register Payment"
        subtitle={`Invoice: ${invoice.invoiceNumber}`}
        size="md"
      >
        <form onSubmit={handleRegisterPayment} className="space-y-4 text-xs">
          <div>
            <label className="label">Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              max={invoice.outstandingAmount}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="input-field text-base font-bold text-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select-field"
              >
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="upi">UPI / Instant Pay</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="label">Reference / UTR #</label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              rows={2}
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="input-field resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
