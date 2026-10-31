// src/pages/portal/PortalRenewalsPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common';

export default function PortalRenewalsPage() {
  const { user } = useAuth();
  const { renewals, subscriptions, requestRenewal } = useApp();

  const customerId = user?.customerId || 'CUST-001';

  const myRenewals = useMemo(
    () => renewals.filter((r) => r.customerId === customerId),
    [renewals, customerId]
  );

  const mySubs = useMemo(
    () => subscriptions.filter((s) => s.customerId === customerId && s.status === 'active'),
    [subscriptions, customerId]
  );

  const handleQuickRenew = (subId) => {
    requestRenewal(subId, customerId, user?.id);
    toast.success('Renewal request submitted for subscription');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Renewal Requests & Status
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Track upcoming contract expiration schedules and submit renewal authorizations.
        </p>
      </div>

      {/* Active Subscriptions eligible for renewal */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-navy mb-3">
          Subscriptions Eligible for Forward Renewal
        </h3>

        <div className="space-y-3">
          {mySubs.map((sub) => {
            const hasPendingRenewal = myRenewals.some(
              (r) => r.subscriptionId === sub.id && r.status === 'requested'
            );

            return (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-navy text-xs">
                      {sub.subscriptionNumber}
                    </span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Renewal Target Date: <span className="font-semibold text-navy">{formatDate(sub.expiryDate || sub.nextBillingDate)}</span> • Value:{' '}
                    <span className="font-bold text-navy">{formatCurrency(sub.recurringAmount)}</span>
                  </p>
                </div>

                {hasPendingRenewal ? (
                  <span className="badge badge-warning text-xs py-1 px-3">
                    Renewal Requested • Pending Approval
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickRenew(sub.id)}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Authorize Early Renewal</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Renewal History Log */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50">
          <h3 className="font-semibold text-sm text-navy">
            Renewal Log & History ({myRenewals.length})
          </h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-text-secondary uppercase font-semibold">
              <th className="px-4 py-2.5">Request Ref #</th>
              <th className="px-4 py-2.5">Target Date</th>
              <th className="px-4 py-2.5 text-right">Estimated Amount</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {myRenewals.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-text-secondary">
                  No renewal requests logged yet.
                </td>
              </tr>
            ) : (
              myRenewals.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono font-medium text-navy">{r.id}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(r.renewalDate)}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy">{formatCurrency(r.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
