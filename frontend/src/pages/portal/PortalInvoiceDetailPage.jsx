// src/pages/portal/PortalInvoiceDetailPage.jsx
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Printer,
  CreditCard,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, Modal } from '../../components/common';

export default function PortalInvoiceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { invoices, customers, payments, registerPayment } = useApp();

  const customerId = user?.customerId || 'CUST-001';
  const invoice = invoices.find((i) => i.id === id && i.customerId === customerId);
  const customer = customers.find((c) => c.id === customerId);

  const relatedPayments = useMemo(
    () => payments.filter((p) => p.invoiceId === id),
    [payments, id]
  );

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!invoice) return;

    setPaying(true);
    await new Promise((r) => setTimeout(r, 800));

    registerPayment({
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      paymentDate: new Date().toISOString().split('T')[0],
      method,
      amount: invoice.outstandingAmount,
      referenceNumber: `PORTAL/UPI/${Math.floor(100000 + Math.random() * 900000)}`,
      note: 'Settled via Customer Self-Service Portal checkout',
    });

    setPaying(false);
    setPayModalOpen(false);
    toast.success('Payment successfully processed! Thank you.');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Invoice Not Found</h2>
        <Link to="/portal/invoices" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/portal/invoices"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Invoices</span>
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
              onClick={() => setPayModalOpen(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Outstanding ({formatCurrency(invoice.outstandingAmount)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tax Invoice Paper */}
      <div className="card p-8 bg-white shadow-md border border-border space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-action font-bold text-xl">
              <span>Brightloop</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Brightloop Technologies India Pvt. Ltd.
            </p>
            <p className="text-xs text-text-secondary">
              GSTIN: 29AABCU9603R1ZM • Koramangala, Bengaluru
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs uppercase font-bold text-text-muted tracking-wider block">
              Original For Recipient
            </span>
            <h1 className="text-2xl font-bold font-mono text-navy mt-0.5">
              {invoice.invoiceNumber}
            </h1>
            <div className="mt-1">
              <StatusBadge status={invoice.status} />
            </div>
            <div className="mt-3 text-xs text-text-secondary space-y-1">
              <p>Invoice Date: <span className="font-semibold text-text-primary">{formatDate(invoice.invoiceDate)}</span></p>
              <p>Due Date: <span className="font-semibold text-text-primary">{formatDate(invoice.dueDate)}</span></p>
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div className="text-xs">
          <p className="font-bold text-navy uppercase tracking-wider mb-1.5">Billed To</p>
          <p className="font-semibold text-text-primary text-sm">{customer?.company || customer?.name}</p>
          <p className="text-text-secondary mt-0.5">{customer?.address}, {customer?.city}, {customer?.state}</p>
          <p className="text-text-secondary font-mono mt-1">GSTIN: Unregistered Consumer / B2B</p>
        </div>

        {/* Lines */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-y border-border text-text-secondary uppercase font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">GST</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.lines.map((l, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-medium text-navy">{l.description}</td>
                  <td className="py-3 px-3 text-center font-bold text-navy">{l.quantity}</td>
                  <td className="py-3 px-3 text-right text-text-secondary">{formatCurrency(l.unitPrice)}</td>
                  <td className="py-3 px-3 text-right text-text-secondary">{l.taxRate || 18}%</td>
                  <td className="py-3 px-3 text-right font-bold text-navy">{formatCurrency(l.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end text-xs">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal:</span>
              <span className="font-semibold text-navy">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>GST (18%):</span>
              <span className="font-semibold text-navy">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
              <span className="font-bold text-navy">Total Invoiced:</span>
              <span className="font-bold text-navy text-base">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-success font-medium">
              <span>Paid:</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold text-danger">
              <span>Balance Due:</span>
              <span className="text-base">{formatCurrency(invoice.outstandingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {relatedPayments.length > 0 && (
          <div className="pt-6 border-t border-border text-xs">
            <h4 className="font-bold text-navy uppercase tracking-wider mb-2">
              Payment Receipts for this Invoice
            </h4>
            <div className="space-y-1.5">
              {relatedPayments.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-semibold text-navy">{p.reference}</span>
                    <span className="text-text-secondary ml-2">via {p.method.toUpperCase()}</span>
                  </div>
                  <span className="font-bold text-success">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      <Modal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Settle Invoice Online"
        subtitle={`Amount: ${formatCurrency(invoice.outstandingAmount)}`}
        size="sm"
      >
        <form onSubmit={handlePayNow} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center gap-2 text-action font-medium">
            <Lock className="w-4 h-4" />
            <span>256-Bit SSL Encrypted Payment Simulation</span>
          </div>

          <div>
            <label className="label">Select Instant Payment Rail</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="rail"
                  value="upi"
                  checked={method === 'upi'}
                  onChange={() => setMethod('upi')}
                  className="w-4 h-4 text-action"
                />
                <span className="font-semibold text-navy">UPI / QR Code (GPay, PhonePe, Paytm)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="rail"
                  value="card"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                  className="w-4 h-4 text-action"
                />
                <span className="font-semibold text-navy">Corporate Debit / Credit Card</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="rail"
                  value="bank_transfer"
                  checked={method === 'bank_transfer'}
                  onChange={() => setMethod('bank_transfer')}
                  className="w-4 h-4 text-action"
                />
                <span className="font-semibold text-navy">NetBanking / NEFT Virtual Account</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{paying ? 'Authorizing...' : `Pay ${formatCurrency(invoice.outstandingAmount)}`}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
