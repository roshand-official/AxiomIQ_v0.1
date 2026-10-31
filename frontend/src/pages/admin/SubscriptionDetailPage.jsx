// src/pages/admin/SubscriptionDetailPage.jsx
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  RefreshCw,
  ArrowLeft,
  Calendar,
  Building,
  CreditCard,
  Layers,
  Pause,
  Play,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, ConfirmationDialog, Tabs } from '../../components/common';

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const {
    subscriptions,
    customers,
    plans,
    products,
    productVariants,
    invoices,
    billingCycles,
    updateSubscriptionStatus,
    requestRenewal,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  const subscription = subscriptions.find((s) => s.id === id);
  const customer = customers.find((c) => c.id === subscription?.customerId);
  const plan = plans.find((p) => p.id === subscription?.planId);

  const relatedInvoices = useMemo(() => {
    return invoices.filter((i) => i.subscriptionId === id);
  }, [invoices, id]);

  const relatedBillingCycles = useMemo(() => {
    return billingCycles.filter((b) => b.subscriptionId === id);
  }, [billingCycles, id]);

  const handleOpenAction = (action) => {
    setActionType(action);
    setActionConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (!actionType) return;

    if (actionType === 'renew') {
      requestRenewal(id, subscription.customerId, null);
      toast.success(`Renewal requested for ${subscription.subscriptionNumber}`);
    } else {
      updateSubscriptionStatus(id, actionType);
      toast.success(`Subscription transitioned to ${actionType}`);
    }
    setActionConfirmOpen(false);
  };

  if (!subscription) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Subscription Not Found</h2>
        <Link to="/admin/subscriptions" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscriptions</span>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview & Products', icon: Layers },
    { key: 'invoices', label: 'Invoices', badge: relatedInvoices.length, icon: FileText },
    { key: 'billing', label: 'Billing Cycles', badge: relatedBillingCycles.length, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Subscription Contracts</span>
        </Link>

        {/* Dynamic Lifecycle Actions based on status */}
        <div className="flex items-center gap-2 flex-wrap">
          {subscription.status === 'draft' && (
            <button
              type="button"
              onClick={() => handleOpenAction('confirmed')}
              className="btn btn-primary btn-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Order</span>
            </button>
          )}

          {subscription.status === 'confirmed' && (
            <button
              type="button"
              onClick={() => handleOpenAction('active')}
              className="btn btn-success btn-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Activate Contract</span>
            </button>
          )}

          {subscription.status === 'active' && (
            <>
              <button
                type="button"
                onClick={() => handleOpenAction('paused')}
                className="btn btn-secondary btn-sm text-warning"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Billing</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAction('renew')}
                className="btn btn-primary btn-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Renewal</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAction('closed')}
                className="btn btn-secondary btn-sm text-danger"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Close Early</span>
              </button>
            </>
          )}

          {subscription.status === 'paused' && (
            <button
              type="button"
              onClick={() => handleOpenAction('active')}
              className="btn btn-success btn-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Subscription</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Subscription Summary Card */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-action-subtle text-action border border-action/20 flex items-center justify-center font-bold text-base flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold font-mono text-navy">
                  {subscription.subscriptionNumber}
                </h1>
                <StatusBadge status={subscription.status} />
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Client:{' '}
                <Link
                  to={`/admin/customers/${customer?.id}`}
                  className="font-medium text-navy hover:text-action hover:underline"
                >
                  {customer?.company || customer?.name}
                </Link>
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-text-muted" />
                  <span>Plan: {plan?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  <span>Started <span className="font-mono">{formatDate(subscription.startDate)}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-text-muted" />
                  <span>{subscription.paymentTerms}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-surface-subtle p-3 rounded-lg border border-border">
            <div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Recurring Value
              </p>
              <p className="text-base font-bold text-navy mt-0.5 font-mono tabular-nums">
                {formatCurrency(subscription.recurringAmount)}
              </p>
            </div>
            <div className="w-px h-7 bg-border" />
            <div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Next Billing Date
              </p>
              <p className="text-base font-bold text-action mt-0.5 font-mono">
                {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'Paused / None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Subscribed Product Lines Table */}
          <div className="card overflow-hidden">
            <div className="p-3 border-b border-border bg-surface-subtle">
              <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
                Contracted Products & Services ({subscription.lines.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-text-secondary uppercase font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Variant Edition</th>
                    <th className="py-2.5 px-3 text-center">Seats / Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Tax Rate</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscription.lines.map((l, idx) => {
                    const prod = products.find((p) => p.id === l.productId);
                    const variant = productVariants.find((v) => v.id === l.variantId);
                    return (
                      <tr key={idx} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-navy block">{prod?.name || l.productId}</span>
                          <span className="text-[11px] text-text-muted font-mono">{prod?.internalRef}</span>
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary">
                          {variant?.name || 'Standard Edition'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-navy font-mono tabular-nums">
                          {l.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-text-secondary font-mono tabular-nums">
                          {formatCurrency(l.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-text-secondary font-mono">
                          {l.taxRate || 18}% GST
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-navy font-mono tabular-nums">
                          {formatCurrency(l.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-secondary uppercase font-semibold text-[11px]">
                <th className="px-3 py-2.5">Invoice #</th>
                <th className="px-3 py-2.5">Invoice Date</th>
                <th className="px-3 py-2.5">Due Date</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right">Paid</th>
                <th className="px-3 py-2.5 text-right">Outstanding</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {relatedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3 py-2.5 font-mono font-medium text-navy">
                    <Link to={`/admin/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary font-mono">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-3 py-2.5 text-text-secondary font-mono">{formatDate(inv.dueDate)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-navy font-mono tabular-nums">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-3 py-2.5 text-right text-success font-semibold font-mono tabular-nums">{formatCurrency(inv.amountPaid)}</td>
                  <td className="px-3 py-2.5 text-right text-danger font-semibold font-mono tabular-nums">{formatCurrency(inv.outstandingAmount)}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <Link to={`/admin/invoices/${inv.id}`} className="btn btn-secondary btn-sm py-1 px-2 text-[11px]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing Cycles Tab */}
      {activeTab === 'billing' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-secondary uppercase font-semibold text-[11px]">
                <th className="px-3 py-2.5">Cycle ID</th>
                <th className="px-3 py-2.5">Period Start</th>
                <th className="px-3 py-2.5">Period End</th>
                <th className="px-3 py-2.5">Billing Date</th>
                <th className="px-3 py-2.5 text-right">Cycle Amount</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Generated Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {relatedBillingCycles.map((bc) => (
                <tr key={bc.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-navy">{bc.id}</td>
                  <td className="px-3 py-2.5 text-text-secondary font-mono">{formatDate(bc.periodStart)}</td>
                  <td className="px-3 py-2.5 text-text-secondary font-mono">{formatDate(bc.periodEnd)}</td>
                  <td className="px-3 py-2.5 text-text-secondary font-mono">{formatDate(bc.billingDate)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-navy font-mono tabular-nums">{formatCurrency(bc.amount)}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={bc.status} /></td>
                  <td className="px-3 py-2.5 font-mono text-action">
                    {bc.invoiceId ? (
                      <Link to={`/admin/invoices/${bc.invoiceId}`} className="hover:underline">
                        {bc.invoiceId}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={actionConfirmOpen}
        onClose={() => setActionConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={`Confirm Action: ${actionType?.toUpperCase()}`}
        message={`Are you sure you want to perform "${actionType}" on subscription ${subscription.subscriptionNumber}?`}
        confirmText="Confirm"
        confirmVariant={actionType === 'closed' ? 'danger' : 'primary'}
      />
    </div>
  );
}
