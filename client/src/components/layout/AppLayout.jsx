import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLanguageStore } from '../../store/languageStore';

export default function AppLayout() {
  // Sidebar collapsed state — saved in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { language: lang, setLanguage: setLang } = useLanguageStore();

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed);
  }, [collapsed]);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  // Redirect to login if not authenticated
  if (!token) return <Navigate to="/login" replace />;

  // Mock counts — replace with real API later
  const counts = {
    leads: 0,
    clients: 0,
    whatsapp: 0,
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex ${lang === 'bn' ? 'font-bn' : ''}`}>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
          counts={counts}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="lg:hidden fixed top-0 left-0 z-50 animate-slide-down">
            <Sidebar
              collapsed={false}
              setCollapsed={() => setMobileSidebarOpen(false)}
              user={user}
              counts={counts}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={user}
          setMobileSidebarOpen={setMobileSidebarOpen}
          lang={lang}
          setLang={setLang}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}