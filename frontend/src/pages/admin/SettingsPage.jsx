// src/pages/admin/SettingsPage.jsx
import { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  Bell,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const [companySettings, setCompanySettings] = useState({
    companyName: 'Brightloop Technologies India Pvt. Ltd.',
    legalEntity: 'Private Limited Company',
    gstin: '29AABCU9603R1ZM',
    pan: 'AABCU9603R',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    address: '42, Koramangala Industrial Area, 4th Block, Bengaluru, Karnataka, 560034',
  });

  const [billingSettings, setBillingSettings] = useState({
    defaultPaymentTerms: 'Net 15 Days',
    taxRate: 18,
    enableAutoDunning: true,
    retryIntervalDays: 3,
    maxRetryAttempts: 3,
    gracePeriodDays: 7,
    autoCloseAfterDays: 30,
  });

  const [notificationsSettings, setNotificationsSettings] = useState({
    emailOnNewInvoice: true,
    emailOnPaymentSuccess: true,
    emailOnPaymentFailure: true,
    smsReminderOverdue: false,
    renewalAlertDaysBefore: 30,
  });

  const handleSaveCompany = (e) => {
    e.preventDefault();
    toast.success('Organization settings saved');
  };

  const handleSaveBilling = (e) => {
    e.preventDefault();
    toast.success('Billing & cadence governance rules updated');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    toast.success('Notification preferences updated');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          System Configuration & Settings
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Manage corporate billing identities, GST compliance parameters, payment governance, and automated dunning.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-action text-action font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Corporate Identity & GST</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`py-3 border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'billing'
                ? 'border-action text-action font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing Governance & Dunning</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`py-3 border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-action text-action font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Communication & Alerts</span>
          </button>
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveCompany} className="card p-6 space-y-4 text-xs">
          <h3 className="text-sm font-semibold text-navy pb-2 border-b border-border">
            Corporate Entity & Tax Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Company Legal Name</label>
              <input
                type="text"
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Legal Entity Structure</label>
              <input
                type="text"
                value={companySettings.legalEntity}
                onChange={(e) => setCompanySettings({ ...companySettings, legalEntity: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">GSTIN (India)</label>
              <input
                type="text"
                value={companySettings.gstin}
                onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label">Permanent Account Number (PAN)</label>
              <input
                type="text"
                value={companySettings.pan}
                onChange={(e) => setCompanySettings({ ...companySettings, pan: e.target.value })}
                className="input-field font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Platform Base Currency</label>
              <input
                type="text"
                disabled
                value={companySettings.currency}
                className="input-field bg-gray-50 text-text-secondary cursor-not-allowed"
              />
            </div>
            <div>
              <label className="label">Operating Timezone</label>
              <input
                type="text"
                disabled
                value={companySettings.timezone}
                className="input-field bg-gray-50 text-text-secondary cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="label">Registered Office Address</label>
            <textarea
              rows={2}
              value={companySettings.address}
              onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
              className="input-field resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              <span>Save Corporate Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Billing Governance */}
      {activeTab === 'billing' && (
        <form onSubmit={handleSaveBilling} className="card p-6 space-y-4 text-xs">
          <h3 className="text-sm font-semibold text-navy pb-2 border-b border-border">
            Recurring Billing & Invoicing Automation Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Default Invoice Payment Terms</label>
              <select
                value={billingSettings.defaultPaymentTerms}
                onChange={(e) => setBillingSettings({ ...billingSettings, defaultPaymentTerms: e.target.value })}
                className="select-field"
              >
                <option value="Immediate">Due Upon Receipt (Immediate)</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
              </select>
            </div>
            <div>
              <label className="label">Standard GST Tax Rate (%)</label>
              <input
                type="number"
                value={billingSettings.taxRate}
                onChange={(e) => setBillingSettings({ ...billingSettings, taxRate: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Grace Period for Renewal (Days)</label>
              <input
                type="number"
                value={billingSettings.gracePeriodDays}
                onChange={(e) => setBillingSettings({ ...billingSettings, gracePeriodDays: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Max Failed Billing Retries</label>
              <input
                type="number"
                value={billingSettings.maxRetryAttempts}
                onChange={(e) => setBillingSettings({ ...billingSettings, maxRetryAttempts: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Auto-Close Unpaid After (Days)</label>
              <input
                type="number"
                value={billingSettings.autoCloseAfterDays}
                onChange={(e) => setBillingSettings({ ...billingSettings, autoCloseAfterDays: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
              <input
                type="checkbox"
                checked={billingSettings.enableAutoDunning}
                onChange={(e) => setBillingSettings({ ...billingSettings, enableAutoDunning: e.target.checked })}
                className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
              />
              <span>Enable Automated Dunning & Payment Reminder Escalations</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              <span>Save Governance Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="card p-6 space-y-4 text-xs">
          <h3 className="text-sm font-semibold text-navy pb-2 border-b border-border">
            Customer Notification Triggers
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
              <input
                type="checkbox"
                checked={notificationsSettings.emailOnNewInvoice}
                onChange={(e) => setNotificationsSettings({ ...notificationsSettings, emailOnNewInvoice: e.target.checked })}
                className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
              />
              <span>Send PDF Tax Invoice upon automated billing run completion</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
              <input
                type="checkbox"
                checked={notificationsSettings.emailOnPaymentSuccess}
                onChange={(e) => setNotificationsSettings({ ...notificationsSettings, emailOnPaymentSuccess: e.target.checked })}
                className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
              />
              <span>Send Instant Payment Receipt confirmation email</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary">
              <input
                type="checkbox"
                checked={notificationsSettings.emailOnPaymentFailure}
                onChange={(e) => setNotificationsSettings({ ...notificationsSettings, emailOnPaymentFailure: e.target.checked })}
                className="w-4 h-4 rounded text-action border-border focus:ring-action cursor-pointer"
              />
              <span>Alert Account Executive and Customer on bank payment failure</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="label">Upcoming Renewal Alert Notice (Days Prior)</label>
            <input
              type="number"
              value={notificationsSettings.renewalAlertDaysBefore}
              onChange={(e) => setNotificationsSettings({ ...notificationsSettings, renewalAlertDaysBefore: Number(e.target.value) })}
              className="input-field w-32"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              <span>Save Notification Rules</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
