// src/pages/portal/PortalProfilePage.jsx
import { useState } from 'react';
import { User, Building, Mail, Phone, MapPin, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

export default function PortalProfilePage() {
  const { user } = useAuth();
  const { customers, updateCustomer } = useApp();

  const customerId = user?.customerId || 'CUST-001';
  const customer = customers.find((c) => c.id === customerId);

  const [formData, setFormData] = useState({
    name: customer?.name || user?.name || '',
    company: customer?.company || '',
    email: customer?.email || user?.email || '',
    phone: customer?.phone || '+91 98765 43212',
    address: customer?.address || '42, MG Road, Koramangala',
    city: customer?.city || 'Bengaluru',
    state: customer?.state || 'Karnataka',
    postalCode: customer?.postalCode || '560034',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (customer) {
      updateCustomer(customer.id, formData);
    }
    toast.success('Commercial profile updated successfully');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please complete all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    toast.success('Password update simulated successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Corporate Profile & Contact Details
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Manage corporate billing address, authorized contact representative, and credentials.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="card p-6 space-y-4 text-xs">
        <h3 className="font-semibold text-sm text-navy pb-2 border-b border-border">
          Company & Contact Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Contact Person Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Company Legal Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Billing Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Contact Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label">Registered Street Address</label>
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

        <div className="pt-4 flex justify-end">
          <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* Password Change Simulation */}
      <form onSubmit={handleChangePassword} className="card p-6 space-y-4 text-xs">
        <h3 className="font-semibold text-sm text-navy pb-2 border-b border-border flex items-center gap-2">
          <Lock className="w-4 h-4 text-action" />
          <span>Security Credentials Simulation</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="btn btn-secondary btn-sm">
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
