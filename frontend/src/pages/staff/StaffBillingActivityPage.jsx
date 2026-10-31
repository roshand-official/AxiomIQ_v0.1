// src/pages/staff/StaffBillingActivityPage.jsx
import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { ActivityTimeline } from '../../components/common';

export default function StaffBillingActivityPage() {
  const { user } = useAuth();
  const { activities } = useApp();

  const assignedCustomerIds = useMemo(() => {
    return user?.assignedCustomers || ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-005'];
  }, [user]);

  const assignedActivities = useMemo(() => {
    return activities.filter(
      (a) => !a.customerId || assignedCustomerIds.includes(a.customerId)
    );
  }, [activities, assignedCustomerIds]);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="pb-1 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-navy">
          Portfolio Billing Activity & Events
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Audit timeline of subscription and billing events across your managed clients.
        </p>
      </div>

      <div className="card p-5">
        <ActivityTimeline activities={assignedActivities} maxItems={25} />
      </div>
    </div>
  );
}
