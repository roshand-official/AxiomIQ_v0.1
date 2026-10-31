// src/pages/admin/BillingCenterPage.jsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge, Modal, Tabs } from '../../components/common';

export default function BillingCenterPage() {
  const {
    subscriptions,
    customers,
    plans,
    invoices,
    billingEvents,
    billingCycles,
    executeBillingRun,
  } = useApp();

  const [activeTab, setActiveTab] = useState('queue');
  const [selectedBillingDate, setSelectedBillingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Analyze subscriptions for billing eligibility
  const billingQueue = useMemo(() => {
    return subscriptions.map((sub) => {
      const cust = customers.find((c) => c.id === sub.customerId);
      const plan = plans.find((p) => p.id === sub.planId);

      // Check if already invoiced on this date
      const alreadyInvoiced = invoices.some(
        (i) => i.subscriptionId === sub.id && i.invoiceDate === selectedBillingDate && i.status !== 'cancelled'
      );

      let eligible = true;
      let reason = 'Ready for billing';

      if (sub.status !== 'active') {
        eligible = false;
        reason = `Contract is ${sub.status} (only active contracts bill)`;
      } else if (alreadyInvoiced) {
        eligible = false;
        reason = 'Invoice already generated for this cycle';
      }

      return {
        ...sub,
        customerName: cust?.company || cust?.name || sub.customerId,
        planName: plan?.name || sub.planId,
        eligible,
        reason,
        alreadyInvoiced,
      };
    });
  }, [subscriptions, customers, plans, invoices, selectedBillingDate]);

  const eligibleSubs = billingQueue.filter((b) => b.eligible);
  const ineligibleSubs = billingQueue.filter((b) => !b.eligible);

  const totalEligibleValue = eligibleSubs.reduce((sum, s) => sum + s.recurringAmount, 0);

  // Overview metrics
  const totalInvoicedValue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingCollection = invoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.outstandingAmount, 0);
  const failedEvents = billingEvents.filter((e) => e.type === 'billing_failed');

  const handleRunBilling = async () => {
    setExecuting(true);
    setPreviewModalOpen(false);

    // Simulate batch execution delay
    await new Promise((r) => setTimeout(r, 1200));

    const eligibleIds = eligibleSubs.map((s) => s.id);
    const results = await executeBillingRun(selectedBillingDate, eligibleIds);

    const safeResults = {
      successful: results?.successful || [],
      failed: results?.failed || [],
      skipped: results?.skipped || [],
    };

    setExecuting(false);
    setExecutionResult(safeResults);
    toast.success(
      `Billing complete: ${safeResults.successful.length} invoices generated, ${safeResults.failed.length} failed.`
    );
  };

  // Derive billing execution history from live billingCycles
  const billingHistory = useMemo(() => {
    if (billingCycles && billingCycles.length > 0) {
      return billingCycles.map((c, i) => ({
        id: c.id || `BRUN-00${i + 1}`,
        executionDate: c.billingDate || c.createdAt || new Date().toISOString(),
        totalProcessed: 1,
        successful: c.status === 'invoiced' ? 1 : 0,
        failed: c.status === 'failed' ? 1 : 0,
        skipped: 0,
        totalInvoiceValue: c.amount || 0,
        duration: '1.2s',
        status: c.status === 'invoiced' ? 'completed' : c.status || 'completed',
      }));
    }
    return [];
  }, [billingCycles]);

  const tabs = [
    { key: 'queue', label: 'Subscription Billing Queue', badge: billingQueue.length, icon: Receipt },
    { key: 'history', label: 'Billing Run History', badge: billingHistory.length, icon: Clock },
    { key: 'events', label: 'Live Billing Events', badge: billingEvents.length, icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Billing Center & Automated Invoicing
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Execute recurring subscription billing runs, generate compliant invoices, and audit transaction batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-border text-xs">
            <Calendar className="w-3.5 h-3.5 text-text-secondary" />
            <span className="text-text-secondary">Billing Date:</span>
            <input
              type="date"
              value={selectedBillingDate}
              onChange={(e) => setSelectedBillingDate(e.target.value)}
              className="font-medium text-navy bg-transparent outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            disabled={eligibleSubs.length === 0 || executing}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{executing ? 'Executing Batch...' : `Execute Run (${eligibleSubs.length})`}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Integrated Ribbon */}
      <div className="card grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-3.5 flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Eligible to Bill</p>
          <p className="text-xl font-bold text-navy font-mono tabular-nums mt-1">{eligibleSubs.length}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Active contracts</p>
        </div>
        <div className="p-3.5 flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Run Amount</p>
          <p className="text-xl font-bold text-action font-mono tabular-nums mt-1">{formatCurrency(totalEligibleValue)}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Ready to invoice</p>
        </div>
        <div className="p-3.5 flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Excluded / Skip</p>
          <p className="text-xl font-bold text-text-secondary font-mono tabular-nums mt-1">{ineligibleSubs.length}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Paused or billed</p>
        </div>
        <div className="p-3.5 flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Run Failures</p>
          <p className="text-xl font-bold text-danger font-mono tabular-nums mt-1">{failedEvents.length}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Requires retry</p>
        </div>
        <div className="p-3.5 flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Total Invoiced</p>
          <p className="text-xl font-bold text-success font-mono tabular-nums mt-1">{formatCurrency(totalInvoicedValue)}</p>
          <p className="text-[10px] text-text-muted mt-0.5">All time records</p>
        </div>
        <div className="p-3.5 flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Pending AR</p>
          <p className="text-xl font-bold text-warning font-mono tabular-nums mt-1">{formatCurrency(pendingCollection)}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Unpaid invoices</p>
        </div>
      </div>

      {/* Execution Results Feedback Banner (if run recently) */}
      {executionResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-success font-bold text-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Billing Run Completed Successfully</span>
            </span>
            <span className="text-xs font-medium text-text-secondary">Just now</span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div>
              <span className="text-text-secondary">Processed:</span>{' '}
              <span className="font-semibold text-text-primary">
                {(executionResult?.successful?.length || 0) +
                  (executionResult?.failed?.length || 0) +
                  (executionResult?.skipped?.length || 0)}
              </span>
            </div>
            <div>
              <span className="text-success">Successful:</span>{' '}
              <span className="font-bold text-success">{executionResult?.successful?.length || 0}</span>
            </div>
            <div>
              <span className="text-danger">Failed:</span>{' '}
              <span className="font-bold text-danger">{executionResult?.failed?.length || 0}</span>
            </div>
            <div>
              <span className="text-text-secondary">Skipped:</span>{' '}
              <span className="font-semibold text-text-primary">{executionResult?.skipped?.length || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Queue Table */}
      {activeTab === 'queue' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between text-xs">
            <span className="font-semibold text-navy">
              Evaluation for Cycle Date: {formatDate(selectedBillingDate)}
            </span>
            <span className="text-text-secondary">
              {eligibleSubs.length} eligible of {billingQueue.length} subscriptions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/50 border-b border-border text-text-secondary font-semibold uppercase">
                  <th className="px-4 py-3">Subscription #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Cadence Plan</th>
                  <th className="px-4 py-3 text-right">Cycle Amount</th>
                  <th className="px-4 py-3 text-center">Eligibility</th>
                  <th className="px-4 py-3">Evaluation Details</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {billingQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-navy">
                      <Link to={`/admin/subscriptions/${item.id}`} className="hover:underline">
                        {item.subscriptionNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      <Link to={`/admin/customers/${item.customerId}`} className="hover:text-action">
                        {item.customerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{item.planName}</td>
                    <td className="px-4 py-3 text-right font-bold text-navy">
                      {formatCurrency(item.recurringAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.eligible ? (
                        <span className="badge badge-success">Eligible</span>
                      ) : (
                        <span className="badge badge-neutral">Excluded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-[11px]">
                      {item.reason}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/subscriptions/${item.id}`}
                        className="btn btn-secondary btn-sm py-1 px-2 text-[11px]"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Billing Run History */}
      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Run ID</th>
                <th className="px-4 py-3">Execution Date</th>
                <th className="px-4 py-3 text-center">Processed</th>
                <th className="px-4 py-3 text-center">Success</th>
                <th className="px-4 py-3 text-center">Failed</th>
                <th className="px-4 py-3 text-right">Invoiced Total</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {billingHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">
                    No billing runs executed yet. Trigger a billing run to record execution history.
                  </td>
                </tr>
              ) : (
                billingHistory.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-navy">{run.id}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(run.executionDate)}</td>
                  <td className="px-4 py-3 text-center font-medium">{run.totalProcessed}</td>
                  <td className="px-4 py-3 text-center font-bold text-success">{run.successful}</td>
                  <td className="px-4 py-3 text-center font-bold text-danger">{run.failed}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy">
                    {formatCurrency(run.totalInvoiceValue)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{run.duration}</td>
                  <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Billing Events Log */}
      {activeTab === 'events' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Event Message</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {billingEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-navy">{evt.id}</td>
                  <td className="px-4 py-3 font-mono text-action">
                    <Link to={`/admin/subscriptions/${evt.subscriptionId}`} className="hover:underline">
                      {evt.subscriptionId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        evt.type === 'billing_success'
                          ? 'bg-emerald-50 text-success'
                          : 'bg-rose-50 text-danger'
                      }`}
                    >
                      {evt.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-primary font-medium">{evt.message}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(evt.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview & Execution Confirmation Modal */}
      <Modal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Execute Recurring Billing Run"
        subtitle={`Scheduled Run Date: ${formatDate(selectedBillingDate)}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
            <h4 className="font-bold text-navy text-sm">Batch Run Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-text-secondary">Eligible Contracts:</span>{' '}
                <span className="font-bold text-navy">{eligibleSubs.length}</span>
              </div>
              <div>
                <span className="text-text-secondary">Total Value to Invoice:</span>{' '}
                <span className="font-bold text-action text-sm">{formatCurrency(totalEligibleValue)}</span>
              </div>
              <div>
                <span className="text-text-secondary">Excluded Subscriptions:</span>{' '}
                <span className="font-medium text-text-secondary">{ineligibleSubs.length}</span>
              </div>
              <div>
                <span className="text-text-secondary">GST Applied:</span>{' '}
                <span className="font-medium text-navy">Standard 18%</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-navy mb-2">Contracts Included in this Run:</h5>
            <div className="max-h-48 overflow-y-auto divide-y divide-border border border-border rounded-lg">
              {eligibleSubs.map((s) => (
                <div key={s.id} className="p-2.5 flex justify-between items-center bg-white">
                  <div>
                    <span className="font-mono font-semibold text-navy">{s.subscriptionNumber}</span>
                    <span className="text-text-secondary ml-2">({s.customerName})</span>
                  </div>
                  <span className="font-bold text-navy">{formatCurrency(s.recurringAmount)}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Note: This simulation updates subscription states in frontend state, creates compliant invoice records, and records billing event logs.
          </p>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRunBilling}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Confirm & Execute Billing</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
