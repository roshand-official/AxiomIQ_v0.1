// src/pages/admin/CustomerDetailPage.jsx
import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  RefreshCw,
  CreditCard,
  Clock,
  ArrowLeft,
  Plus,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../../utils/formatters';
import {
  StatusBadge,
  Tabs,
  ActivityTimeline,
  Modal,
} from '../../components/common';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    customers,
    subscriptions,
    quotations,
    invoices,
    payments,
    activities,
    updateCustomer,
    plans,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const customer = customers.find((c) => c.id === id);

  const customerSubs = useMemo(
    () => subscriptions.filter((s) => s.customerId === id),
    [subscriptions, id]
  );

  const customerQuotes = useMemo(
    () => quotations.filter((q) => q.customerId === id),
    [quotations, id]
  );

  const customerInvoices = useMemo(
    () => invoices.filter((i) => i.customerId === id),
    [invoices, id]
  );

  const customerPayments = useMemo(
    () => payments.filter((p) => p.customerId === id),
    [payments, id]
  );

  const customerActivities = useMemo(
    () => activities.filter((a) => a.customerId === id),
    [activities, id]
  );

  // Financial calculations
  const totalInvoiced = customerInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = customerInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = customerInvoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.outstandingAmount, 0);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    customerType: 'business',
    status: 'active',
    notes: '',
  });

  const handleOpenEdit = () => {
    if (!customer) return;
    setFormData({
      name: customer.name || '',
      company: customer.company || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      postalCode: customer.postalCode || '',
      country: customer.country || 'India',
      customerType: customer.customerType || 'business',
      status: customer.status || 'active',
      notes: customer.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateCustomer(id, formData);
    toast.success('Customer details updated');
    setEditModalOpen(false);
  };

  if (!customer) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Customer Not Found</h2>
        <p className="text-sm text-text-secondary mt-1">
          The requested customer profile could not be located in frontend state.
        </p>
        <Link to="/admin/customers" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Building },
    { key: 'subscriptions', label: 'Subscriptions', badge: customerSubs.length, icon: RefreshCw },
    { key: 'quotations', label: 'Quotations', badge: customerQuotes.length, icon: FileText },
    { key: 'invoices', label: 'Invoices', badge: customerInvoices.length, icon: FileText },
    { key: 'payments', label: 'Payments', badge: customerPayments.length, icon: CreditCard },
    { key: 'activity', label: 'Activity Log', badge: customerActivities.length, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <Link
            to="/admin/quotations"
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-action/10 text-action flex items-center justify-center font-bold text-xl flex-shrink-0">
              {customer.company ? customer.company[0] : customer.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-navy">
                  {customer.company || customer.name}
                </h1>
                <StatusBadge status={customer.status} />
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                Primary Contact: <span className="font-medium text-text-primary">{customer.name}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{customer.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Joined {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Financial Snapshot */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-border">
            <div>
              <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
                Total Invoiced
              </p>
              <p className="text-base font-bold text-navy mt-0.5">
                {formatCurrency(totalInvoiced)}
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
                Total Paid
              </p>
              <p className="text-base font-bold text-success mt-0.5">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
                Outstanding
              </p>
              <p
                className={`text-base font-bold mt-0.5 ${
                  totalOutstanding > 0 ? 'text-danger' : 'text-text-muted'
                }`}
              >
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Active Subscriptions Summary */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-navy mb-3">
                Active Subscriptions ({customerSubs.filter((s) => s.status === 'active').length})
              </h3>
              {customerSubs.length === 0 ? (
                <p className="text-xs text-text-secondary py-4 text-center">
                  No subscriptions recorded yet for this client.
                </p>
              ) : (
                <div className="space-y-3">
                  {customerSubs.map((sub) => {
                    const plan = plans.find((p) => p.id === sub.planId);
                    return (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl border border-border flex items-center justify-between hover:border-action/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/subscriptions/${sub.id}`}
                              className="font-mono text-xs font-semibold text-navy hover:text-action hover:underline"
                            >
                              {sub.subscriptionNumber}
                            </Link>
                            <StatusBadge status={sub.status} />
                          </div>
                          <p className="text-xs text-text-secondary mt-1">
                            Plan: <span className="text-text-primary font-medium">{plan?.name || sub.planId}</span> • Renews:{' '}
                            {formatDate(sub.nextBillingDate || sub.expiryDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-navy">
                            {formatCurrency(sub.recurringAmount)}
                          </p>
                          <Link
                            to={`/admin/subscriptions/${sub.id}`}
                            className="text-[11px] text-action hover:underline font-medium inline-flex items-center gap-0.5 mt-0.5"
                          >
                            <span>Manage</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Address & Commercial Profile */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-navy mb-3">
                Commercial & Billing Address
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-text-secondary">Street Address</p>
                  <p className="font-medium text-text-primary mt-0.5">{customer.address || '—'}</p>
                </div>
                <div>
                  <p className="text-text-secondary">City, State & Zip</p>
                  <p className="font-medium text-text-primary mt-0.5">
                    {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Country</p>
                  <p className="font-medium text-text-primary mt-0.5">{customer.country}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Customer Type</p>
                  <p className="font-medium text-text-primary capitalize mt-0.5">{customer.customerType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Relationship Notes & Timeline */}
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-navy mb-2">
                Relationship Notes
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed bg-gray-50 p-3 rounded-lg border border-border">
                {customer.notes || 'No internal notes on file.'}
              </p>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-navy mb-3">
                Customer Activity
              </h3>
              <ActivityTimeline activities={customerActivities} maxItems={5} />
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Subscription #</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customerSubs.map((sub) => {
                const plan = plans.find((p) => p.id === sub.planId);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-navy">
                      <Link to={`/admin/subscriptions/${sub.id}`} className="hover:underline">
                        {sub.subscriptionNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{plan?.name || sub.planId}</td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(sub.startDate)}</td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(sub.expiryDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-navy">{formatCurrency(sub.recurringAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/subscriptions/${sub.id}`} className="btn btn-secondary btn-sm py-1 px-2 text-[11px]">
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Quotation #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customerQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-navy">
                    <Link to={`/admin/quotations/${q.id}`} className="hover:underline">
                      {q.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(q.quotationDate)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(q.expiryDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-navy">{formatCurrency(q.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/quotations/${q.id}`} className="btn btn-secondary btn-sm py-1 px-2 text-[11px]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Invoice Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customerInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-navy">
                    <Link to={`/admin/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-navy">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-4 py-3 text-right text-success font-medium">{formatCurrency(inv.amountPaid)}</td>
                  <td className="px-4 py-3 text-right text-danger font-semibold">{formatCurrency(inv.outstandingAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3 text-right">
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

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Payment Reference</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Payment Date</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customerPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-navy">{p.reference}</td>
                  <td className="px-4 py-3 font-mono text-action">{p.invoiceId}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(p.paymentDate)}</td>
                  <td className="px-4 py-3 uppercase font-medium">{p.method.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right font-semibold text-success">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="card p-6">
          <ActivityTimeline activities={customerActivities} maxItems={20} />
        </div>
      )}

      {/* Edit Customer Profile Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Customer Profile"
        subtitle="Update corporate details and contact information."
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Relationship Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
