import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, FileText, CheckSquare, MessageCircle, LogOut } from 'lucide-react';
import Header from './Header';

export default function ClientLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { to: '/client-portal', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/client-portal/projects', icon: FileText, label: 'Projects' },
    { to: '/client-portal/invoices', icon: FileText, label: 'Invoices' },
    { to: '/client-portal/support', icon: MessageCircle, label: 'Support' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Client Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-inner">
              <span className="text-white font-extrabold text-xl">D</span>
            </div>
            <div>
              <span className="text-dark font-black tracking-tight text-xl block leading-none">Client Portal</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">D360 Workspace</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <div className="mb-4">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Main Menu</span>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/client-portal'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-500 hover:bg-slate-100 hover:text-dark'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
