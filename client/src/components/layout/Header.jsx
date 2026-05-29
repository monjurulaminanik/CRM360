import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Bell, Command, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const menuItems = [
    { divider: true },
    { label: 'Logout', icon: <LogOut size={14} />, onClick: handleLogout, danger: true },
  ];

  return (
    <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between shrink-0">
      {/* Search Input Bar (Ctrl+K style) */}
      <div className="relative hidden md:flex items-center w-64 lg:w-80 group">
        <Search size={14} className="absolute left-3 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
        <input
          type="text"
          placeholder="Search leads, clients, tasks..."
          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary/50 text-xs rounded-xl pl-9 pr-12 h-9 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-200"
        />
        <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200/50 rounded text-[9px] font-bold text-gray-400 border border-slate-300/30">
          <Command size={8} /> K
        </div>
      </div>

      {/* Mobile Spacer if search is hidden */}
      <div className="md:hidden" />

      {/* Right Side Stats & Actions */}
      <div className="flex items-center gap-4">
        {/* System Health Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-full text-[10px] font-bold">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          D360 Cloud: Active
        </div>

        {/* Notification Bell Icon */}
        <button 
          onClick={() => toast.success('Workspace notifications are up to date!')}
          className="relative w-8.5 h-8.5 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 cursor-pointer group active:scale-95 border border-slate-100/20"
        >
          <Bell size={15} className="group-hover:rotate-12 transition-transform duration-200" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-white" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-100" />

        {/* User profile dropdown */}
        <Dropdown
          align="right"
          items={menuItems}
          trigger={
            <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none">
              <Avatar name={user?.name} size="sm" />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-dark leading-none">{user?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role}</p>
              </div>
            </button>
          }
        />
      </div>
    </header>
  );
}

