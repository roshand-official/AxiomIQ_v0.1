// src/components/layout/UserMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Briefcase,
  Users,
  LogOut,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/formatters';

export default function UserMenu() {
  const { user, logout, switchRole } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (role) => {
    await switchRole(role);
    setOpen(false);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'staff') navigate('/staff/dashboard');
    else if (role === 'customer') navigate('/portal/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
          {getInitials(user.name)}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-text-primary leading-tight">
            {user.name}
          </p>
          <p className="text-[10px] text-text-secondary capitalize">
            {user.role}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-border py-1.5 z-50 text-xs">
          {/* User info banner */}
          <div className="px-3.5 py-2.5 border-b border-border bg-gray-50/50">
            <p className="font-semibold text-navy text-sm">{user.name}</p>
            <p className="text-text-secondary truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-action">
              {user.role} role
            </span>
          </div>

          {/* Role switcher simulation */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Demo Role Switcher
            </div>
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-gray-50 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-text-primary">
                <Shield className="w-3.5 h-3.5 text-action" />
                <span>Administrator</span>
              </div>
              {user.role === 'admin' && <Check className="w-3.5 h-3.5 text-action" />}
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('staff')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-gray-50 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-text-primary">
                <Briefcase className="w-3.5 h-3.5 text-warning" />
                <span>Internal Staff</span>
              </div>
              {user.role === 'staff' && <Check className="w-3.5 h-3.5 text-warning" />}
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('customer')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-gray-50 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-text-primary">
                <Users className="w-3.5 h-3.5 text-success" />
                <span>Customer Portal</span>
              </div>
              {user.role === 'customer' && <Check className="w-3.5 h-3.5 text-success" />}
            </button>
          </div>

          <div className="border-t border-border my-1" />

          {/* Profile / Logout */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(user.role === 'customer' ? '/portal/profile' : '/admin/settings');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-1.5 text-text-primary hover:bg-gray-50 text-left cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-text-secondary" />
            <span>Profile & Account</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-1.5 text-danger hover:bg-danger/10 text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-danger" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
