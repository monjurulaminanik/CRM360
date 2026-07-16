import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, Users, MessageCircle, CheckSquare, FolderKanban,
  FileText, BarChart3, FolderOpen, Settings, HelpCircle, DollarSign, Briefcase,
  LogOut, ChevronLeft, ChevronRight, Sparkles, BookOpen
} from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

export default function Sidebar({ collapsed, setCollapsed, user, counts = {} }) {
  const navigate = useNavigate();
  const { t } = useLanguageStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const adminMenuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
    { to: '/leads', icon: Target, label: 'Leads', badge: counts.leads, key: 'leads' },
    { to: '/clients', icon: Users, label: 'Clients', badge: counts.clients, key: 'clients' },
    { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp', badge: counts.whatsapp, badgeColor: 'bg-green-500', key: 'whatsapp' },
    { to: '/messenger', icon: MessageCircle, label: 'Messenger', key: 'messenger' },
    { to: '/projects', icon: FolderKanban, label: 'Projects', key: 'projects' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks', key: 'tasks' },
    { to: '/invoices', icon: FileText, label: 'Invoices', key: 'invoices' },
    { to: '/expenses', icon: DollarSign, label: 'Expenses', key: 'expenses' },
    { to: '/reports', icon: BarChart3, label: 'Reports', key: 'reports' },
    { to: '/files', icon: FolderOpen, label: 'Files', key: 'files' },
    { to: '/proposals', icon: FileText, label: 'Proposals', key: 'proposals' },
    { to: '/competitors', icon: FolderOpen, label: 'Competitors', key: 'competitors' },
    { to: '/ai-hub', icon: Sparkles, label: 'AI Hub', key: 'aiHub' },
    { to: '/recruitment', icon: Briefcase, label: 'Recruitment', key: 'recruitment' },
    { to: '/sops', icon: BookOpen, label: 'SOPs', key: 'sops' },
    { to: '/hr', icon: Users, label: 'HR & Shift', key: 'hrShift' },
    { to: '/settings', icon: Settings, label: 'Settings', key: 'settings' },
  ];

  const clientMenuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Portal Cockpit', key: 'portalCockpit' },
    { to: '/competitors', icon: FolderOpen, label: 'Competitors', key: 'competitors' },
    { to: '/invoices', icon: FileText, label: 'Invoices', key: 'invoices' },
    { to: '/sops', icon: BookOpen, label: 'Onboarding SOPs', key: 'onboardingSops' },
  ];

  const employeeMenuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Work Cockpit', key: 'workCockpit' },
    { to: '/sops', icon: BookOpen, label: 'My SOPs', key: 'mySops' },
    { to: '/settings', icon: Settings, label: 'Settings', key: 'settings' },
  ];

  const menuItems = user?.role === 'client' 
    ? clientMenuItems 
    : user?.role === 'employee' 
      ? employeeMenuItems 
      : adminMenuItems;

  return (
    <aside
      className={`${
        collapsed ? 'w-[70px]' : 'w-[260px]'
      } fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-30`}
    >
      {/* Logo + Collapse Toggle */}
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-5'} border-b border-gray-100 flex-shrink-0`}>
        {!collapsed && (
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-primary leading-none">D360</h1>
            <p className="text-[10px] text-gray-400 tracking-widest mt-0.5">DAWAT IT</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-primary transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Profile Card */}
      {!collapsed && user && (
        <div className="mx-3 mt-4 p-3 bg-gradient-to-br from-primary-light to-blue-50 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark truncate">{user.name || 'User'}</p>
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-primary text-white rounded-full mt-0.5">
                {user.role || 'member'}
              </span>
            </div>
          </div>
        </div>
      )}

      {collapsed && user && (
        <div className="mx-auto mt-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 ${
                    collapsed ? 'justify-center px-2' : 'px-3'
                  } py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-dark'
                  }`
                }
                 title={collapsed ? t(item.key) : ''}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></span>
                    )}
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{t(item.key)}</span>
                        {item.badge > 0 && (
                          <span className={`${item.badgeColor || 'bg-primary'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-100 p-3 space-y-1 flex-shrink-0">
        <button
          className={`w-full flex items-center gap-3 ${
            collapsed ? 'justify-center px-2' : 'px-3'
          } py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-dark transition-all`}
          title={collapsed ? t('helpSupport') : ''}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t('helpSupport')}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 ${
            collapsed ? 'justify-center px-2' : 'px-3'
          } py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all`}
          title={collapsed ? t('logout') : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
}