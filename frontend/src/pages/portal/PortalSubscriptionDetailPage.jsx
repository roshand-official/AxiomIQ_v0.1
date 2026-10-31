// src/pages/portal/PortalSubscriptionDetailPage.jsx
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  RefreshCw,
  ArrowLeft,
  Calendar,
  Layers,
  Pause,
  XCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, ConfirmationDialog } from '../../components/common';

export default function PortalSubscriptionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    subscriptions,
    plans,
    products,
    productVariants,
    invoices,
    requestRenewal,
    addNotification,
  } = useApp();

  const customerId = user?.customerId || 'CUST-001';
  const subscription = subscriptions.find(
    (s) => s.id === id && s.customerId === customerId
  );
  const plan = plans.find((p) => p.id === subscription?.planId);

  const subInvoices = useMemo(
    () => invoices.filter((i) => i.subscriptionId === id),
    [invoices, id]
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [requestType, setRequestType] = useState('');

  const handleOpenRequest = (type) => {
    setRequestType(type);
    setConfirmOpen(true);
  };

  const handleConfirmRequest = () => {
    if (requestType === 'renewal') {
      requestRenewal(id, customerId, user?.id);
      toast.success('Renewal request submitted! Your account manager has been alerted.');
    } else if (requestType === 'pause') {
      addNotification('info', 'Customer Pause Request', `Customer requested pause for subscription ${subscription?.subscriptionNumber}.`, `/admin/subscriptions/${id}`);
      toast.success('Pause request logged. Our billing team will reach out within 24 hours.');
    } else if (requestType === 'cancel') {
      addNotification('warning', 'Customer Closure Request', `Customer requested closure for subscription ${subscription?.subscriptionNumber}.`, `/admin/subscriptions/${id}`);
      toast.info('Cancellation request logged. An account executive will contact you.');
    }
    setConfirmOpen(false);
  };

  if (!subscription) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Subscription Not Found</h2>
        <Link to="/portal/subscriptions" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Subscriptions</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/portal/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Subscriptions</span>
        </Link>

        {/* Customer Self-Service Actions */}
        <div className="flex items-center gap-2">
          {subscription.status === 'active' && (
            <>
              <button
                type="button"
                onClick={() => handleOpenRequest('renewal')}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Renewal</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenRequest('pause')}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Request Pause</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenRequest('cancel')}
                className="btn btn-secondary btn-sm text-danger flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Request Closure</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Card */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-action/10 text-action flex items-center justify-center font-bold text-lg flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold font-mono text-navy">
                  {subscription.subscriptionNumber}
                </h1>
                <StatusBadge status={subscription.status} />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Plan: <span className="font-semibold text-text-primary">{plan?.name}</span> • Terms: {subscription.paymentTerms}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border border-border">
            <div>
              <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
                Cycle Amount
              </p>
              <p className="text-lg font-bold text-navy mt-0.5">
                {formatCurrency(subscription.recurringAmount)}
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
                Next Billing Date
              </p>
              <p className="text-lg font-bold text-action mt-0.5">
                {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'Ongoing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracted Lines */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50">
          <h3 className="font-semibold text-sm text-navy">
            Subscribed Licences & Products ({subscription.lines.length})
          </h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-text-secondary uppercase font-semibold">
              <th className="py-2.5 px-4">Product Name</th>
              <th className="py-2.5 px-4">Edition</th>
              <th className="py-2.5 px-4 text-center">Seats / Qty</th>
              <th className="py-2.5 px-4 text-right">Unit Price</th>
              <th className="py-2.5 px-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscription.lines.map((l, idx) => {
              const prod = products.find((p) => p.id === l.productId);
              const variant = productVariants.find((v) => v.id === l.variantId);
              return (
                <tr key={idx}>
                  <td className="py-3 px-4 font-medium text-navy">
                    {prod?.name || l.productId}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {variant?.name || 'Standard'}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-navy">
                    {l.quantity}
                  </td>
                  <td className="py-3 px-4 text-right text-text-secondary">
                    {formatCurrency(l.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-navy">
                    {formatCurrency(l.subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Related Invoices */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50">
          <h3 className="font-semibold text-sm text-navy">
            Invoices for this Subscription ({subInvoices.length})
          </h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-text-secondary uppercase font-semibold">
              <th className="px-4 py-2.5">Invoice #</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Due Date</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-mono font-medium text-navy">
                  <Link to={`/portal/invoices/${inv.id}`} className="hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">{formatDate(inv.invoiceDate)}</td>
                <td className="px-4 py-3 text-text-secondary">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3 text-right font-bold text-navy">{formatCurrency(inv.totalAmount)}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/portal/invoices/${inv.id}`}
                    className="btn btn-secondary btn-sm py-1 px-2 text-[11px]"
                  >
                    View / Pay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Confirmation Modal */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmRequest}
        title={`Confirm ${requestType?.toUpperCase()} Request`}
        message={`Are you sure you wish to submit a ${requestType} request for subscription ${subscription.subscriptionNumber}? Our accounts team will review and confirm.`}
        confirmText="Submit Request"
        confirmVariant={requestType === 'cancel' ? 'danger' : 'primary'}
      />
    </div>
  );
}
