// src/pages/admin/RevenueRiskPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Eye,
  Check,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { mockRevenueRiskData } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, Modal } from '../../components/common';

export default function RevenueRiskPage() {
  const { customers, subscriptions, invoices } = useApp();

  const [risks, setRisks] = useState(() => [...mockRevenueRiskData]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [noteText, setNoteText] = useState('');

  const filteredRisks = risks.filter((r) => {
    if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    return true;
  });

  const totalAtRisk = filteredRisks
    .filter((r) => !r.reviewed)
    .reduce((sum, r) => sum + r.amountAtRisk, 0);

  const highSeverityCount = filteredRisks.filter((r) => r.severity === 'high' && !r.reviewed).length;

  const handleMarkReviewed = (id) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reviewed: !r.reviewed } : r))
    );
    toast.success('Risk item review status updated');
  };

  const handleOpenNote = (risk) => {
    setSelectedRisk(risk);
    setNoteText(risk.notes || '');
    setNoteModalOpen(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!selectedRisk) return;

    setRisks((prev) =>
      prev.map((r) => (r.id === selectedRisk.id ? { ...r, notes: noteText } : r))
    );
    toast.success('Follow-up note recorded');
    setNoteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Revenue Risk & Churn Monitor
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Proactively detect expiring subscriptions, dunning failures, unpaid balances, and churn threats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 text-danger" />
            <span className="text-text-secondary">Unreviewed Capital at Risk:</span>
            <span className="font-bold text-danger">{formatCurrency(totalAtRisk)}</span>
          </div>
        </div>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-danger">
          <span className="text-xs text-text-secondary font-medium">Critical Risk Items</span>
          <p className="text-2xl font-bold text-danger mt-1">{highSeverityCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Requires immediate commercial contact</p>
        </div>
        <div className="card p-4 border-l-4 border-l-warning">
          <span className="text-xs text-text-secondary font-medium">Medium Risk Items</span>
          <p className="text-2xl font-bold text-warning mt-1">
            {filteredRisks.filter((r) => r.severity === 'medium' && !r.reviewed).length}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Pending renewal or partial settlement</p>
        </div>
        <div className="card p-4 border-l-4 border-l-success">
          <span className="text-xs text-text-secondary font-medium">Reviewed & Mitigated</span>
          <p className="text-2xl font-bold text-success mt-1">
            {risks.filter((r) => r.reviewed).length}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Logged action plans</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filter Severity:</span>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="select-field py-1 text-xs w-36"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>

          <span className="text-border">|</span>

          <span className="text-text-secondary font-medium">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="select-field py-1 text-xs w-48"
          >
            <option value="all">All Categories</option>
            <option value="overdue_invoice">Overdue Invoices</option>
            <option value="partial_payment">Partial Payment</option>
            <option value="subscription_paused">Paused Subscriptions</option>
            <option value="expiring_subscription">Expiring Subscriptions</option>
            <option value="billing_failed">Billing Execution Failed</option>
          </select>
        </div>

        <span className="text-xs text-text-secondary">
          Showing {filteredRisks.length} flagged risk items
        </span>
      </div>

      {/* Risk Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/75 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Client Account</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Risk Category</th>
                <th className="px-4 py-3">Trigger Date</th>
                <th className="px-4 py-3 text-right">Amount at Risk</th>
                <th className="px-4 py-3 text-center">Severity</th>
                <th className="px-4 py-3">Recommended Mitigation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRisks.map((item) => {
                const cust = customers.find((c) => c.id === item.customerId);
                const sub = subscriptions.find((s) => s.id === item.subscriptionId);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/50 ${
                      item.reviewed ? 'opacity-60 bg-gray-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-navy">
                      <Link to={`/admin/customers/${item.customerId}`} className="hover:text-action">
                        {cust?.company || cust?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">
                      {sub?.subscriptionNumber || item.invoiceId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-semibold text-text-primary">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(item.riskDate)}</td>
                    <td className="px-4 py-3 text-right font-bold text-danger">
                      {formatCurrency(item.amountAtRisk)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.severity === 'high'
                            ? 'bg-rose-50 text-danger'
                            : item.severity === 'medium'
                            ? 'bg-amber-50 text-warning'
                            : 'bg-blue-50 text-action'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text-primary font-medium">{item.action}</p>
                      {item.notes && (
                        <p className="text-[11px] text-action italic mt-0.5">Note: {item.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMarkReviewed(item.id)}
                          className={`btn btn-sm py-1 px-2 text-[11px] ${
                            item.reviewed
                              ? 'btn-secondary text-success'
                              : 'btn-primary'
                          }`}
                          title="Toggle reviewed status"
                        >
                          <Check className="w-3 h-3" />
                          <span>{item.reviewed ? 'Reviewed' : 'Review'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenNote(item)}
                          className="btn btn-secondary btn-sm py-1 px-2 text-[11px]"
                          title="Add mitigation follow-up note"
                        >
                          Note
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up Note Modal */}
      <Modal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Record Risk Follow-up Action"
        subtitle={`Client: ${customers.find((c) => c.id === selectedRisk?.customerId)?.name}`}
        size="md"
      >
        <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
          <div>
            <label className="label">Mitigation Notes & Follow-up History</label>
            <textarea
              rows={4}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="input-field resize-none"
              placeholder="e.g. Spoke with Chief Procurement Officer. Wire transfer scheduled for Friday..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setNoteModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
