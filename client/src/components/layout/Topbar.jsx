import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, Moon, Sun, ChevronDown, User, Settings,
  LogOut, Menu, ChevronRight
} from 'lucide-react';

export default function Topbar({ user, setMobileSidebarOpen, lang, setLang }) {
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Page title mapping
  const pageTitles = {
    '/': 'Dashboard',
    '/leads': 'Leads',
    '/clients': 'Clients',
    '/whatsapp': 'WhatsApp',
    '/messenger': 'Messenger',
    '/tasks': 'Tasks',
    '/invoices': 'Invoices',
    '/reports': 'Reports',
    '/files': 'Files',
    '/settings': 'Settings',
  };
  const currentTitle = pageTitles[location.pathname] || 'D360';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 lg:px-6 gap-4">

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title + Breadcrumb */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <h2 className="text-lg font-heading font-semibold text-dark">{currentTitle}</h2>
        <ChevronRight className="w-4 h-4 text-gray-300 hidden md:block" />
        <span className="text-sm text-gray-400 hidden md:block">D360 / {currentTitle}</span>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search clients, leads, tasks..."
            className="w-full h-9 pl-10 pr-16 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[10px] text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Language Switcher */}
        <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
              lang === 'en' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('bn')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
              lang === 'bn' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
            }`}
          >
            বাংলা
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-gray-100 overflow-hidden animate-slide-down">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-dark">Notifications</h3>
                <span className="text-xs text-primary font-semibold cursor-pointer hover:text-primary-dark">Mark all read</span>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                <div className="p-8 text-center text-gray-400 text-sm">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-gray-100 overflow-hidden animate-slide-down">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-dark text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="my-1 border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}