import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Users, DollarSign, ShieldAlert, Plus, 
  Trash2, Globe, Award, RefreshCw, LogOut, Check, X,
  ExternalLink, Calendar, ChevronRight, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function SuperadminDashboardPage() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Provision Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [plan, setPlan] = useState('basic');
  const [expiryDays, setExpiryDays] = useState('30');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Admin@D360');

  // Edit Subscription State
  const [editPlan, setEditPlan] = useState('basic');
  const [editStatus, setEditStatus] = useState('active');

  const fetchTenants = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await api.get('/tenants');
      if (res.data.success) {
        setTenants(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load tenants directory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTenants(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out from Superadmin Panel');
    navigate('/login');
  };

  const handleProvisionTenant = async (e) => {
    e.preventDefault();
    if (!tenantName || !tenantSlug || !adminEmail) {
      toast.error('Please fill in company name, slug, and admin email.');
      return;
    }

    try {
      toast.loading('Provisioning new workspace...', { id: 'provision' });
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(expiryDays));

      const payload = {
        name: tenantName,
        slug: tenantSlug.toLowerCase().replace(/[^a-z0-9]/g, ''),
        subscriptionPlan: plan,
        expiresAt,
        adminName,
        adminEmail: adminEmail.toLowerCase(),
        adminPassword
      };

      const res = await api.post('/tenants', payload);
      if (res.data.success) {
        toast.success(`Workspace "${tenantName}" provisioned successfully!`, { id: 'provision' });
        setShowProvisionModal(false);
        // Reset form
        setTenantName('');
        setTenantSlug('');
        setPlan('basic');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('Admin@D360');
        fetchTenants(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Provisioning failed.', { id: 'provision' });
    }
  };

  const handleOpenSubscriptionModal = (tenant) => {
    setSelectedTenant(tenant);
    setEditPlan(tenant.subscriptionPlan);
    setEditStatus(tenant.subscriptionStatus);
    setShowSubscriptionModal(true);
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      toast.loading('Updating subscription details...', { id: 'sub-update' });
      const payload = {
        subscriptionPlan: editPlan,
        subscriptionStatus: editStatus
      };
      
      const res = await api.put(`/tenants/${selectedTenant._id}/subscription`, payload);
      if (res.data.success) {
        toast.success('Subscription plan updated!', { id: 'sub-update' });
        setShowSubscriptionModal(false);
        fetchTenants(false);
      }
    } catch (err) {
      toast.error('Failed to update subscription status.', { id: 'sub-update' });
    }
  };

  // Metrics
  const activeTenantsCount = tenants.filter(t => t.subscriptionStatus === 'active').length;
  const mrr = tenants.reduce((acc, t) => {
    if (t.subscriptionStatus !== 'active') return acc;
    const pricing = t.subscriptionPlan === 'premium' ? 12000 : t.subscriptionPlan === 'standard' ? 6500 : 3500;
    return acc + pricing;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12">
      {/* Premium Superadmin Navbar */}
      <header className="bg-slate-900 text-white h-16 px-8 flex items-center justify-between shrink-0 shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg leading-none tracking-tight">D360 SaaS COMMAND</h1>
            <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Global Superadmin Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-none text-slate-200">{user?.name}</p>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Root Superadmin</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-xs font-semibold text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900 transition-all duration-300"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </header>

      {/* Main dashboard viewport */}
      <main className="flex-1 px-8 py-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Workspace Tenant Command Center</h2>
            <p className="text-xs text-slate-400 mt-1">Monitor, license, and provision company workspaces for D360 CRM clients.</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-center text-slate-600 shadow-2xs h-9"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowProvisionModal(true)}
              className="btn-primary gap-1.5 text-xs h-9 px-4 rounded-xl flex items-center shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 border-none hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus size={15} />
              Provision New Workspace
            </button>
          </div>
        </div>

        {/* Global SaaS KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Workspaces</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1 leading-none">{tenants.length} Tenants</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
              <Building size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Licences</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1 leading-none">{activeTenantsCount} Subscribed</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Check size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated MRR</span>
              <h3 className="text-2xl font-black text-indigo-600 mt-1 leading-none">৳{mrr.toLocaleString()} BDT</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Platform Health</span>
              <h3 className="text-2xl font-black text-blue-600 mt-1 leading-none">100% Online</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <Globe size={20} />
            </div>
          </div>
        </div>

        {/* Tenants Database Grid */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Workspace Tenants Directory</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2.5 py-0.5 rounded-full">{tenants.length} Registered</span>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-7 w-7 text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Scanning workspaces database...</span>
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Building size={28} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">No Tenants Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">Start by provisioning your first corporate/client workspace subscription.</p>
              <button
                onClick={() => setShowProvisionModal(true)}
                className="btn-primary text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700"
              >
                Provision Workspace
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4">Workspace Name</th>
                    <th className="p-4">Slug / Subdomain</th>
                    <th className="p-4 text-center">Plan Tier</th>
                    <th className="p-4 text-center">License Status</th>
                    <th className="p-4">Renewal Expiry</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map(tenant => {
                    const expired = new Date(tenant.expiresAt) < new Date();
                    return (
                      <tr key={tenant._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50/70 text-indigo-600 font-bold flex items-center justify-center">
                              {tenant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-slate-800 font-semibold">{tenant.name}</p>
                              <p className="text-[10px] text-slate-400">Created: {new Date(tenant.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded-lg w-fit">
                            <Globe size={11} className="text-slate-400" />
                            {tenant.slug}.d360.com
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            tenant.subscriptionPlan === 'premium'
                              ? 'bg-purple-50 text-purple-600 border-purple-100'
                              : tenant.subscriptionPlan === 'standard'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-slate-50 text-slate-600 border-slate-150'
                          }`}>
                            {tenant.subscriptionPlan}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            tenant.subscriptionStatus === 'active' && !expired
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {tenant.subscriptionStatus === 'active' && !expired ? 'active' : 'suspended'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium font-mono text-[11px]">
                            <Calendar size={13} className="text-slate-400" />
                            <span className={expired ? 'text-red-500 font-bold' : ''}>
                              {new Date(tenant.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenSubscriptionModal(tenant)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 rounded-lg px-3 py-1 transition-all"
                          >
                            Manage Licence
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: Provision Workspace */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-heading font-black text-sm uppercase tracking-wide">Provision Workspace</h3>
                <p className="text-[10px] text-indigo-200 mt-0.5">Launches tenant dashboard workspace instantly</p>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProvisionTenant} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  value={tenantName}
                  onChange={(e) => {
                    setTenantName(e.target.value);
                    setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Slug / Subdomain</label>
                  <input
                    type="text"
                    placeholder="e.g. acme"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none font-mono"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Plan Tier</label>
                  <select
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                  >
                    <option value="basic">Basic (৳3,500/m)</option>
                    <option value="standard">Standard (৳6,500/m)</option>
                    <option value="premium">Premium (৳12,000/m)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subscription Expiry</label>
                <select
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                >
                  <option value="7">7 Days Trial</option>
                  <option value="30">30 Days (1 Month)</option>
                  <option value="90">90 Days (3 Months)</option>
                  <option value="365">365 Days (1 Year)</option>
                </select>
              </div>

              {/* Admin User Provisioning Details */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Workspace Tenant Admin Account</span>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin Email</label>
                  <input
                    type="email"
                    placeholder="admin@company.com"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none font-mono"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin Full Name</label>
                    <input
                      type="text"
                      placeholder="Acme Admin"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin Password</label>
                    <input
                      type="password"
                      placeholder="Admin@D360"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none font-mono"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-primary h-10 text-xs font-bold gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none rounded-xl"
                >
                  <Check size={14} /> Provision & Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Subscription */}
      {showSubscriptionModal && selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-heading font-black text-sm uppercase tracking-wide">Manage License</h3>
                <p className="text-[10px] text-indigo-200 mt-0.5">{selectedTenant.name}</p>
              </div>
              <button onClick={() => setShowSubscriptionModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubscription} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Plan Tier</label>
                <select
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                >
                  <option value="basic">Basic (৳3,500/m)</option>
                  <option value="standard">Standard (৳6,500/m)</option>
                  <option value="premium">Premium (৳12,000/m)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">License Status</label>
                <select
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="active">Active (Granted Access)</option>
                  <option value="inactive">Suspended (Blocked Access)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-primary h-10 text-xs font-bold gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none rounded-xl"
                >
                  <Check size={14} /> Update License Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
