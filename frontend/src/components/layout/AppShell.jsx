// src/components/layout/AppShell.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useApp } from '../../contexts/AppContext';

export default function AppShell({ role = 'admin' }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          role={role}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar (off-canvas) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-navy/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 h-full">
            <Sidebar
              role={role}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        <Topbar onSidebarToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
