// src/components/layout/Breadcrumbs.jsx
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels = {
  admin: 'Admin',
  staff: 'Staff',
  portal: 'Portal',
  dashboard: 'Dashboard',
  customers: 'Customers',
  products: 'Products',
  plans: 'Subscription Plans',
  quotations: 'Quotations',
  subscriptions: 'Subscriptions',
  billing: 'Billing Center',
  invoices: 'Invoices',
  payments: 'Payments',
  discounts: 'Discounts',
  reports: 'Financial Reports',
  'revenue-risk': 'Revenue Risk',
  analytics: 'Analytics',
  settings: 'Settings',
  profile: 'My Profile',
  renewals: 'Renewals',
  'billing-activity': 'Billing Activity',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length <= 1) return null;

  return (
    <nav className="hidden sm:flex items-center text-xs text-text-secondary space-x-1.5">
      <Link
        to={`/${pathnames[0]}/dashboard`}
        className="flex items-center hover:text-text-primary transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <div key={routeTo} className="flex items-center space-x-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            {isLast ? (
              <span className="font-semibold text-text-primary capitalize truncate max-w-[150px]">
                {label}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-text-primary transition-colors capitalize truncate max-w-[120px]"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
