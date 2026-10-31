// src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ShieldCheck } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import UserMenu from './UserMenu';
import NotificationPanel from './NotificationPanel';
import { useApp } from '../../contexts/AppContext';

export default function Topbar({ onSidebarToggle }) {
  const { notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSidebarToggle}
          className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumbs />
      </div>

      {/* Right side: Search, Notifications, User Menu */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Input */}
        <div className="relative">
          <div className="hidden md:flex items-center relative w-60">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search (entities, invoices)..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-surface-subtle border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-action focus:bg-white focus:ring-1 focus:ring-action transition-all"
            />
            <kbd className="hidden lg:inline-block absolute right-2 px-1 py-0.2 text-[10px] text-text-muted bg-white border border-border rounded font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* System Heartbeat Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-subtle border border-border text-[11px] text-text-secondary font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle relative transition-colors cursor-pointer border border-transparent hover:border-border"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 z-50">
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
