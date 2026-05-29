import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  ArrowLeft, ChevronRight, Phone, Mail, MessageCircle, Globe,
  Building2, MapPin, UserCircle2, CalendarDays, Tag, Banknote,
  Clock, Star, Pencil, Trash2, Archive, Ellipsis, CheckCircle2,
  BarChart3, MessageSquare, CheckSquare, FolderOpen, FileText,
  Swords, Settings, TrendingUp,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { clientService } from '../services/clientService';
import CampaignsTab    from '../components/clients/tabs/CampaignsTab';
import OverviewTab     from '../components/clients/tabs/OverviewTab';
import CommunicationTab from '../components/clients/tabs/CommunicationTab';
import FilesTab        from '../components/clients/tabs/FilesTab';
import InvoicesTab     from '../components/clients/tabs/InvoicesTab';
import TasksTab        from '../components/clients/tabs/TasksTab';
import CompetitorTab   from '../components/clients/tabs/CompetitorTab';
import SettingsTab     from '../components/clients/tabs/SettingsTab';
import Avatar from '../components/ui/Avatar';
import Badge  from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useRef } from 'react';

// ── Config ─────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  active:   { label: 'Active',   variant: 'success', dot: true },
  on_hold:  { label: 'Paused',   variant: 'warning', dot: true },
  inactive: { label: 'Inactive', variant: 'default', dot: true },
  churned:  { label: 'Churned',  variant: 'danger',  dot: true },
};

const TIER_CFG = {
  basic:      { label: 'Starter', cls: 'bg-gray-100 text-gray-600' },
  standard:   { label: 'Growth',  cls: 'bg-blue-50 text-blue-700' },
  premium:    { label: 'Pro',     cls: 'bg-violet-50 text-violet-700' },
  enterprise: { label: 'Custom',  cls: 'bg-amber-50 text-amber-700' },
};

const SERVICE_LABELS = {
  seo: 'SEO', social_media_marketing: 'Social Media', ppc: 'PPC / Ads',
  web_design: 'Web Design', web_development: 'Web Dev', content_marketing: 'Content',
  email_marketing: 'Email', branding: 'Branding', video_marketing: 'Video', other: 'Other',
};

const TABS = [
  { key: 'campaigns',     label: 'Campaigns',     icon: BarChart3,      badge: null },
  { key: 'overview',      label: 'Overview',      icon: TrendingUp,     badge: null },
  { key: 'communication', label: 'Communication', icon: MessageSquare,  badge: null },
  { key: 'tasks',         label: 'Tasks',         icon: CheckSquare,    badge: null },
  { key: 'files',         label: 'Files',         icon: FolderOpen,     badge: null },
  { key: 'invoices',      label: 'Invoices',      icon: FileText,       badge: null },
  { key: 'competitors',   label: 'Competitors',   icon: Swords,         badge: null },
  { key: 'settings',      label: 'Settings',      icon: Settings,       badge: null },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-400" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{label}</div>
        {href ? (
          <a href={href} className="text-sm text-primary font-medium truncate block hover:underline">{value}</a>
        ) : (
          <div className="text-sm text-dark font-medium truncate">{value}</div>
        )}
      </div>
    </div>
  );
}

function HealthRing({ score = 75 }) {
  const color = score >= 75 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444';
  const r = 22, c = 25, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={50} height={50} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth={4} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function MoreMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-dark transition-all">
        <Ellipsis size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Pencil size={14} className="text-gray-400" /> Edit Client
          </button>
          <button onClick={() => { toast('Archive coming soon', { icon: '📦' }); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Archive size={14} className="text-gray-400" /> Archive
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50">
            <Trash2 size={14} /> Delete Client
          </button>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="page-container animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-5">
        <div className="space-y-4">
          <div className="card flex flex-col items-center py-8 gap-4"><div className="w-20 h-20 rounded-full bg-gray-100" /><div className="h-5 bg-gray-100 rounded w-32" /></div>
          <div className="card space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}</div>
        </div>
        <div className="card h-64" />
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [editOpen, setEditOpen] = useState(false);

  const { data: clientRes, isLoading } = useQuery(
    ['client', id],
    () => clientService.getOne(id),
    { staleTime: 30_000 }
  );

  const { data: notesRes, isLoading: notesLoading } = useQuery(
    ['client-notes', id],
    () => clientService.getNotes(id),
    { staleTime: 30_000 }
  );

  const updateMutation = useMutation(
    (data) => clientService.update(id, data),
    {
      onSuccess: (res) => {
        queryClient.setQueryData(['client', id], res);
        queryClient.invalidateQueries('clients');
        setEditOpen(false);
        toast.success('Client updated');
      },
      onError: () => toast.error('Failed to update client'),
    }
  );

  const deleteMutation = useMutation(() => clientService.remove(id), {
    onSuccess: () => { toast.success('Client deleted'); queryClient.invalidateQueries('clients'); navigate('/clients'); },
    onError: () => toast.error('Delete failed'),
  });

  const handleDelete = () => {
    if (!window.confirm('Delete this client permanently?')) return;
    deleteMutation.mutate();
  };

  if (isLoading) return <Skeleton />;

  const client = clientRes?.data;
  if (!client) return (
    <div className="page-container flex flex-col items-center justify-center py-20 text-center">
      <Building2 size={40} className="text-gray-200 mb-3" />
      <h2 className="text-lg font-semibold text-dark">Client not found</h2>
      <Link to="/clients" className="mt-4 text-sm text-primary hover:underline">← Back to Clients</Link>
    </div>
  );

  const statusCfg = STATUS_CFG[client.status] || STATUS_CFG.active;
  const tierCfg   = TIER_CFG[client.tier] || TIER_CFG.standard;
  const notes     = notesRes?.data || [];
  const mrr       = (client.activeServices || []).reduce((s, svc) => s + (svc.monthlyRetainer || 0), 0);

  return (
    <div className="page-container">

      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/clients" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Clients
          </Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-dark font-medium truncate max-w-[200px]">{client.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('campaigns')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary transition-all duration-200"
          >
            <BarChart3 size={13} className="text-gray-400" /> Campaigns
          </button>
          <MoreMenu onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

        {/* ══════════════════════════════
            LEFT COLUMN — sticky sidebar
        ══════════════════════════════ */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Profile card */}
          <div className="card text-center pt-7 pb-5">
            <Avatar name={client.name} size="xl" className="mx-auto mb-3" />
            <h2 className="text-lg font-bold text-dark font-heading leading-tight">{client.name}</h2>
            {client.company && (
              <p className="text-sm text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                <Building2 size={12} className="shrink-0" /> {client.company}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <Badge variant={statusCfg.variant} dot={statusCfg.dot}>{statusCfg.label}</Badge>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tierCfg.cls}`}>{tierCfg.label}</span>
            </div>

            {/* Health ring + MRR */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex flex-col items-center gap-1">
                <HealthRing score={client.healthScore ?? 75} />
                <span className="text-[10px] text-gray-400">Health Score</span>
              </div>
              {mrr > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-base font-bold text-dark">৳{mrr.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400">Monthly MRR</span>
                </div>
              )}
              {client.renewalDate && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-dark">{format(new Date(client.renewalDate), 'MMM d')}</span>
                  <span className="text-[10px] text-gray-400">Renewal</span>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {(client.whatsappNumber || client.phone) && (
                <a href={`https://wa.me/${(client.whatsappNumber || client.phone).replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group" title="WhatsApp">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                    <MessageCircle size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-gray-400">WhatsApp</span>
                </a>
              )}
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <span className="text-[10px] text-gray-400">Call</span>
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <Mail size={16} className="text-orange-600" />
                  </div>
                  <span className="text-[10px] text-gray-400">Email</span>
                </a>
              )}
              {client.website && (
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <Globe size={16} className="text-gray-600" />
                  </div>
                  <span className="text-[10px] text-gray-400">Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="card space-y-3.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>
            <InfoRow icon={Phone}    label="WhatsApp / Phone" value={client.whatsappNumber || client.phone} href={`tel:${client.whatsappNumber || client.phone}`} />
            <InfoRow icon={Mail}     label="Email"    value={client.email}    href={`mailto:${client.email}`} />
            <InfoRow icon={Globe}    label="Website"  value={client.website}  href={client.website} />
            <InfoRow icon={Building2}label="Company"  value={client.company} />
            <InfoRow icon={MapPin}   label="Address"  value={[client.address?.city, client.address?.country].filter(Boolean).join(', ')} />
          </div>

          {/* Business info */}
          <div className="card space-y-3.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business</h3>
            <InfoRow icon={Star}        label="Industry"     value={client.industry} />
            <InfoRow icon={Building2}   label="Type"         value={client.businessType ? client.businessType.charAt(0).toUpperCase() + client.businessType.slice(1) : null} />
            <InfoRow icon={UserCircle2} label="Account Mgr"  value={client.accountManager?.name || 'Unassigned'} />
            <InfoRow icon={CalendarDays}label="Client Since"  value={format(new Date(client.createdAt), 'dd MMM yyyy')} />
            {client.renewalDate && <InfoRow icon={Clock} label="Renewal Date" value={format(new Date(client.renewalDate), 'dd MMM yyyy')} />}
            {client.convertedFromLead && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><UserCircle2 size={13} className="text-gray-400" /></div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Converted Lead</div>
                  <Link to={`/leads/${client.convertedFromLead._id || client.convertedFromLead}`}
                    className="text-sm text-primary font-medium hover:underline">
                    {client.convertedFromLead.name || 'View Lead'}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Active services */}
          {client.activeServices?.length > 0 && (
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Services</h3>
              <div className="flex flex-wrap gap-1.5">
                {client.activeServices.map((svc, i) => (
                  <span key={i} className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full">
                    {SERVICE_LABELS[svc.service] || svc.service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {client.tags?.length > 0 && (
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {client.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    <Tag size={10} />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portal badge */}
          {client.portalAccess && (
            <div className="card flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <CheckCircle2 size={15} className="text-success" />
              </div>
              <div>
                <div className="text-sm font-semibold text-dark">Portal Active</div>
                <div className="text-xs text-gray-400">Client can access their portal</div>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════
            RIGHT COLUMN — Tabs
        ══════════════════════════════ */}
        <div>
          {/* Tab bar */}
          <div className="card !p-0 overflow-hidden mb-4">
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-thin">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                      active ? 'border-primary text-primary bg-primary-light/30' : 'border-transparent text-gray-500 hover:text-dark hover:bg-gray-50'
                    }`}>
                    <Icon size={12} strokeWidth={active ? 2 : 1.75} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="card">
            {activeTab === 'campaigns'     && <CampaignsTab client={client} />}
            {activeTab === 'overview'      && <OverviewTab client={client} />}
            {activeTab === 'communication' && <CommunicationTab client={client} notes={notes} notesLoading={notesLoading} />}
            {activeTab === 'tasks'         && <TasksTab client={client} />}
            {activeTab === 'files'         && <FilesTab client={client} />}
            {activeTab === 'invoices'      && <InvoicesTab client={client} />}
            {activeTab === 'competitors'   && <CompetitorTab client={client} />}
            {activeTab === 'settings'      && <SettingsTab client={client} onClientUpdated={() => queryClient.invalidateQueries(['client', id])} />}
          </div>
        </div>
      </div>
    </div>
  );
}
