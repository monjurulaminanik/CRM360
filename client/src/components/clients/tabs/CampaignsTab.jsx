import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import {
  Plus, TrendingUp, MousePointerClick, DollarSign, Users,
  Zap, Search, Mail, Share2, MessageCircle, Code2, Megaphone,
  Layers, Pause, Play, CheckCircle2, FileEdit, Trash2, Ellipsis,
  BarChart3, X, ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { campaignService } from '../../../services/campaignService';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import toast from 'react-hot-toast';

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CFG = {
  facebook_ads:     { label: 'Facebook Ads',   icon: Megaphone,      color: 'bg-blue-100 text-blue-700',    platform: 'Facebook / Instagram' },
  google_ads:       { label: 'Google Ads',     icon: Search,         color: 'bg-orange-100 text-orange-700', platform: 'Google' },
  seo:              { label: 'SEO',            icon: TrendingUp,     color: 'bg-emerald-100 text-emerald-700', platform: 'Organic Search' },
  email_marketing:  { label: 'Email',          icon: Mail,           color: 'bg-violet-100 text-violet-700', platform: 'Email' },
  social_media:     { label: 'Social Media',   icon: Share2,         color: 'bg-pink-100 text-pink-700',    platform: 'Social Media' },
  whatsapp:         { label: 'WhatsApp',       icon: MessageCircle,  color: 'bg-green-100 text-green-700',  platform: 'WhatsApp' },
  content_marketing:{ label: 'Content',        icon: FileEdit,       color: 'bg-cyan-100 text-cyan-700',    platform: 'Content' },
  web:              { label: 'Web',            icon: Code2,          color: 'bg-gray-100 text-gray-700',    platform: 'Website' },
  other:            { label: 'Other',          icon: Layers,         color: 'bg-gray-100 text-gray-600',    platform: 'Other' },
};

const STATUS_CFG = {
  active:    { label: 'Active',    variant: 'success', icon: Play },
  paused:    { label: 'Paused',    variant: 'warning', icon: Pause },
  completed: { label: 'Completed', variant: 'info',    icon: CheckCircle2 },
  draft:     { label: 'Draft',     variant: 'default', icon: FileEdit },
};

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricPill({ label, value, sub, highlight }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[80px] ${highlight ? 'bg-primary text-white' : 'bg-gray-50'}`}>
      <div className={`text-base font-bold leading-tight ${highlight ? 'text-white' : 'text-dark'}`}>{value}</div>
      <div className={`text-[10px] font-medium mt-0.5 ${highlight ? 'text-white/70' : 'text-gray-400'}`}>{label}</div>
      {sub && <div className={`text-[10px] ${highlight ? 'text-white/60' : 'text-gray-400'}`}>{sub}</div>}
    </div>
  );
}

function fmt(n = 0) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function BudgetBar({ spent = 0, total = 1, currency = 'BDT' }) {
  const pct = Math.min(100, total > 0 ? Math.round((spent / total) * 100) : 0);
  const color = pct > 90 ? 'bg-danger' : pct > 70 ? 'bg-warning' : 'bg-primary';
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 shrink-0 font-medium">{pct}% spent</span>
      <span className="text-xs text-gray-400 shrink-0">৳{spent.toLocaleString()} / ৳{total.toLocaleString()}</span>
    </div>
  );
}

// ── Campaign card ─────────────────────────────────────────────────────────────

function CampaignCard({ campaign, onEdit, onDelete, onToggleStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const type   = TYPE_CFG[campaign.type]   || TYPE_CFG.other;
  const status = STATUS_CFG[campaign.status] || STATUS_CFG.draft;
  const Icon   = type.icon;
  const m      = campaign.metrics || {};

  return (
    <div className="border border-gray-100 rounded-2xl p-4 hover:border-primary/30 hover:shadow-card-hover transition-all bg-white">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${type.color}`}>
            <Icon size={16} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-dark text-sm leading-tight truncate">{campaign.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {type.platform}
              {campaign.startDate && ` · Since ${format(new Date(campaign.startDate), 'MMM d, yyyy')}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={status.variant} dot size="sm">{status.label}</Badge>
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
              <Ellipsis size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
                <button onClick={() => { onToggleStatus(campaign); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  {campaign.status === 'active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Activate</>}
                </button>
                <button onClick={() => { onEdit(campaign); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FileEdit size={13} /> Edit Campaign
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { onDelete(campaign._id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex gap-2 flex-wrap">
        {m.roas > 0 && <MetricPill label="ROAS" value={`${m.roas.toFixed(2)}×`} highlight />}
        {m.reach > 0 && <MetricPill label="Reach" value={fmt(m.reach)} />}
        {m.impressions > 0 && <MetricPill label="Impressions" value={fmt(m.impressions)} />}
        {m.clicks > 0 && <MetricPill label="Clicks" value={fmt(m.clicks)} sub={m.ctr ? `${m.ctr.toFixed(2)}% CTR` : undefined} />}
        {m.conversions > 0 && <MetricPill label="Conversions" value={m.conversions} />}
        {m.spend > 0 && <MetricPill label="Spend" value={`৳${fmt(m.spend)}`} />}
        {m.revenue > 0 && <MetricPill label="Revenue" value={`৳${fmt(m.revenue)}`} />}
      </div>

      {/* Budget bar */}
      {(campaign.budget?.total > 0) && (
        <BudgetBar spent={campaign.budget.spent} total={campaign.budget.total} currency={campaign.budget.currency} />
      )}

      {/* Expandable notes */}
      {campaign.notes && expanded && (
        <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500 leading-relaxed">
          {campaign.notes}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        {campaign.notes ? (
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            {expanded ? 'Hide notes' : 'Show notes'}
          </button>
        ) : <div />}
        <button
          onClick={() => toast('Full campaign report — coming soon', { icon: '📊' })}
          className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:gap-2.5 transition-all"
        >
          View Report <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}

// ── Campaign form modal ───────────────────────────────────────────────────────

function CampaignFormModal({ open, onClose, campaign, clientId, onSave, isSaving }) {
  const isEdit = Boolean(campaign);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useState(() => {
    if (!open) return;
    reset(campaign ? {
      name:      campaign.name,
      type:      campaign.type || 'facebook_ads',
      status:    campaign.status || 'active',
      platform:  campaign.platform || '',
      budgetTotal:  campaign.budget?.total || '',
      budgetSpent:  campaign.budget?.spent || '',
      reach:        campaign.metrics?.reach || '',
      impressions:  campaign.metrics?.impressions || '',
      clicks:       campaign.metrics?.clicks || '',
      conversions:  campaign.metrics?.conversions || '',
      spend:        campaign.metrics?.spend || '',
      revenue:      campaign.metrics?.revenue || '',
      roas:         campaign.metrics?.roas || '',
      ctr:          campaign.metrics?.ctr || '',
      startDate:    campaign.startDate ? campaign.startDate.slice(0, 10) : '',
      endDate:      campaign.endDate   ? campaign.endDate.slice(0, 10)   : '',
      notes:        campaign.notes || '',
    } : { type: 'facebook_ads', status: 'active' });
  }, [open, campaign]);

  const onSubmit = (data) => {
    onSave({
      clientId,
      name:     data.name,
      type:     data.type,
      status:   data.status,
      platform: data.platform || TYPE_CFG[data.type]?.platform || '',
      budget:   { total: Number(data.budgetTotal) || 0, spent: Number(data.budgetSpent) || 0, currency: 'BDT' },
      metrics:  {
        reach:       Number(data.reach) || 0,
        impressions: Number(data.impressions) || 0,
        clicks:      Number(data.clicks) || 0,
        conversions: Number(data.conversions) || 0,
        spend:       Number(data.spend) || 0,
        revenue:     Number(data.revenue) || 0,
        roas:        Number(data.roas) || 0,
        ctr:         Number(data.ctr) || 0,
        cpc:         data.clicks > 0 ? (Number(data.spend) / Number(data.clicks)) : 0,
      },
      startDate: data.startDate || undefined,
      endDate:   data.endDate   || undefined,
      notes:     data.notes     || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Campaign' : 'New Campaign'}
      description={isEdit ? 'Update campaign details and metrics' : 'Set up a new campaign for this client'}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSaving}>{isEdit ? 'Save Changes' : 'Create Campaign'}</Button></>}
    >
      <form className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group col-span-2">
            <label className="text-sm font-medium text-dark">Campaign Name <span className="text-danger">*</span></label>
            <input className={`input ${errors.name ? '!border-danger' : ''}`} placeholder="Summer Sale 2026"
              {...register('name', { required: 'Name is required' })} />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Type</label>
            <select className="input" {...register('type')}>
              {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Status</label>
            <select className="input" {...register('status')}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Start Date</label>
            <input type="date" className="input" {...register('startDate')} />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">End Date</label>
            <input type="date" className="input" {...register('endDate')} />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Platform</label>
            <input className="input" placeholder="Facebook, Google..." {...register('platform')} />
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-1">Budget</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Total Budget (BDT)</label>
            <input type="number" className="input" placeholder="50000" {...register('budgetTotal')} />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Amount Spent</label>
            <input type="number" className="input" placeholder="32000" {...register('budgetSpent')} />
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-1">Metrics</p>
        <div className="grid grid-cols-3 gap-3">
          {[['reach','Reach'],['impressions','Impressions'],['clicks','Clicks'],['conversions','Conversions'],['spend','Spend (BDT)'],['revenue','Revenue (BDT)'],['roas','ROAS'],['ctr','CTR (%)']].map(([f, l]) => (
            <div key={f} className="form-group">
              <label className="text-sm font-medium text-dark">{l}</label>
              <input type="number" step="0.01" className="input" placeholder="0" {...register(f)} />
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="text-sm font-medium text-dark">Notes</label>
          <textarea className="input h-16 resize-none" {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export default function CampaignsTab({ client }) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery(
    ['campaigns', client._id, statusFilter],
    () => campaignService.getAll({ clientId: client._id, status: statusFilter || undefined }),
    { staleTime: 30_000 }
  );

  const campaigns = data?.data || [];

  const createMutation = useMutation(campaignService.create, {
    onSuccess: () => { queryClient.invalidateQueries(['campaigns', client._id]); setFormOpen(false); toast.success('Campaign created'); },
    onError: () => toast.error('Failed to create campaign'),
  });

  const updateMutation = useMutation(({ id, data }) => campaignService.update(id, data), {
    onSuccess: () => { queryClient.invalidateQueries(['campaigns', client._id]); setFormOpen(false); setEditCampaign(null); toast.success('Campaign updated'); },
    onError: () => toast.error('Failed to update campaign'),
  });

  const deleteMutation = useMutation(campaignService.remove, {
    onSuccess: () => { queryClient.invalidateQueries(['campaigns', client._id]); toast.success('Campaign deleted'); },
    onError:   () => toast.error('Failed to delete campaign'),
  });

  const handleSave = (data) => {
    if (editCampaign) updateMutation.mutate({ id: editCampaign._id, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (c) => { setEditCampaign(c); setFormOpen(true); };
  const handleDelete = (id) => { if (window.confirm('Delete this campaign?')) deleteMutation.mutate(id); };
  const handleToggle = (c) => updateMutation.mutate({ id: c._id, data: { status: c.status === 'active' ? 'paused' : 'active' } });

  // Summary metrics
  const totals = campaigns.reduce((acc, c) => {
    acc.spend    += c.metrics?.spend    || 0;
    acc.revenue  += c.metrics?.revenue  || 0;
    acc.reach    += c.metrics?.reach    || 0;
    acc.conversions += c.metrics?.conversions || 0;
    return acc;
  }, { spend: 0, revenue: 0, reach: 0, conversions: 0 });
  const avgRoas = totals.spend > 0 ? totals.revenue / totals.spend : 0;

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg ROAS',      value: avgRoas > 0 ? `${avgRoas.toFixed(2)}×` : '—', icon: TrendingUp,        color: 'text-primary' },
            { label: 'Total Reach',   value: fmt(totals.reach),                             icon: Users,             color: 'text-emerald-600' },
            { label: 'Total Spend',   value: `৳${fmt(totals.spend)}`,                       icon: DollarSign,        color: 'text-amber-600' },
            { label: 'Conversions',   value: totals.conversions,                            icon: MousePointerClick, color: 'text-violet-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm ${color}`}>
                <Icon size={15} />
              </div>
              <div>
                <div className="text-base font-bold text-dark leading-tight">{value}</div>
                <div className="text-[10px] text-gray-400 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter + add button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['', 'active', 'paused', 'completed', 'draft'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:text-dark'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditCampaign(null); setFormOpen(true); }}>
          <Plus size={14} /> New Campaign
        </Button>
      </div>

      {/* Campaign list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-4 animate-pulse space-y-3">
              <div className="flex gap-3"><div className="w-9 h-9 bg-gray-100 rounded-xl" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 rounded w-1/3" /><div className="h-2.5 bg-gray-50 rounded w-1/4" /></div></div>
              <div className="flex gap-2">{[...Array(4)].map((_, j) => <div key={j} className="w-16 h-14 bg-gray-50 rounded-xl" />)}</div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
            <BarChart3 size={22} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-dark">No campaigns yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            {statusFilter ? `No ${statusFilter} campaigns` : 'Create your first campaign to start tracking performance metrics'}
          </p>
          {!statusFilter && (
            <Button variant="primary" size="sm" className="mt-4" onClick={() => { setEditCampaign(null); setFormOpen(true); }}>
              <Plus size={14} /> Create First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <CampaignCard key={c._id} campaign={c} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggle} />
          ))}
        </div>
      )}

      <CampaignFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditCampaign(null); }}
        campaign={editCampaign}
        clientId={client._id}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
