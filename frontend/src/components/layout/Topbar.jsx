// src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import UserMenu from './UserMenu';
import NotificationPanel from './NotificationPanel';
import { useApp } from '../../contexts/AppContext';

export default function Topbar({ onSidebarToggle }) {
  const { notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onSidebarToggle}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumbs />
      </div>

      {/* Right side: Search, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative">
          <div className="hidden md:flex items-center relative w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-action focus:bg-white transition-all"
            />
            <kbd className="hidden lg:inline-block absolute right-2 px-1.5 py-0.5 text-[10px] text-text-muted bg-white border border-border rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 z-50">
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
