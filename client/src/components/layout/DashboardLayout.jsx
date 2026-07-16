import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout() {
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed);
  }, [collapsed]);

  // Close drawer on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: drawer on mobile, sticky on desktop */}
      <div
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex items-center gap-2 bg-white border-b border-gray-100 lg:border-0">
          <button
            type="button"
            className="lg:hidden ml-3 w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-gray-600"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <Header />
          </div>
          {mobileOpen && (
            <button
              type="button"
              className="lg:hidden mr-3 w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
