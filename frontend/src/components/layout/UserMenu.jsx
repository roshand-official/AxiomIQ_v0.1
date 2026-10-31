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
        className="flex items-center gap-2 p-1 rounded-md hover:bg-surface-subtle transition-colors cursor-pointer border border-transparent hover:border-border"
      >
        <div className="w-7 h-7 rounded-md bg-[#172B4D] text-white flex items-center justify-center font-bold text-[11px] font-mono select-none">
          {getInitials(user.name)}
        </div>
        <div className="hidden md:block text-left pr-0.5">
          <p className="text-xs font-semibold text-text-primary leading-tight">
            {user.name}
          </p>
          <p className="text-[10px] text-text-secondary capitalize leading-none mt-0.5">
            {user.role}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-md bg-white shadow-lg border border-border py-1 z-50 text-xs">
          {/* User info banner */}
          <div className="px-3.5 py-2.5 border-b border-border bg-surface-subtle">
            <p className="font-semibold text-text-primary text-xs">{user.name}</p>
            <p className="text-text-secondary text-[11px] truncate mt-0.5 font-mono">{user.email}</p>
            <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-action-light text-action border border-action/20">
              {user.role} role
            </span>
          </div>

          {/* Role switcher simulation */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Demo Role Switcher
            </div>
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-surface-subtle text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-text-primary">
                <Shield className="w-3.5 h-3.5 text-action" />
                <span className="font-medium">Administrator</span>
              </div>
              {user.role === 'admin' && <Check className="w-3.5 h-3.5 text-action" />}
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('staff')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-surface-subtle text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-text-primary">
                <Briefcase className="w-3.5 h-3.5 text-warning" />
                <span className="font-medium">Internal Staff</span>
              </div>
              {user.role === 'staff' && <Check className="w-3.5 h-3.5 text-warning" />}
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('customer')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-surface-subtle text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-text-primary">
                <Users className="w-3.5 h-3.5 text-success" />
                <span className="font-medium">Customer Portal</span>
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
            className="w-full flex items-center gap-2 px-3.5 py-1.5 text-text-primary hover:bg-surface-subtle text-left cursor-pointer font-medium"
          >
            <User className="w-3.5 h-3.5 text-text-muted" />
            <span>Profile & Settings</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-1.5 text-danger hover:bg-danger-light text-left cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5 text-danger" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
