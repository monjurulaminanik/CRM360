import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, CheckSquare, Clock, Calendar, LogOut } from 'lucide-react';
import Header from './Header';

export default function EmployeeLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { to: '/employee-portal', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee-portal/tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/employee-portal/timesheet', icon: Clock, label: 'Timesheet' },
    { to: '/employee-portal/schedule', icon: Calendar, label: 'Schedule & Leaves' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Employee Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shadow-xl z-20 text-white">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-white font-extrabold text-xl">D</span>
            </div>
            <div>
              <span className="text-white font-black tracking-tight text-xl block leading-none">Employee Hub</span>
              <span className="text-[9px] text-blue-300 font-bold uppercase tracking-widest mt-1 block">D360 Workspace</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <div className="mb-4">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">My Workspace</span>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/employee-portal'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
