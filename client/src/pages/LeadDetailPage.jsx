import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  ArrowLeft, Phone, Mail, MessageCircle, UserCheck, Ellipsis,
  Pencil, Trash2, Archive, Flame, Snowflake, MapPin, Globe,
  Building2, CalendarDays, UserCircle2, Tag, Banknote,
  Clock, LayoutList, FileText, ChevronRight, LoaderCircle,
  CheckCircle2, Circle, Plus, Upload, FileUp, FilePlus2,
  RefreshCw, Star,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { leadService } from '../services/leadService';
import LeadFormModal from '../components/leads/LeadFormModal';
import LeadTimeline from '../components/leads/LeadTimeline';
import LeadMessages from '../components/leads/LeadMessages';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  new:         { label: 'New',         variant: 'info',    dot: true },
  contacted:   { label: 'Contacted',   variant: 'warning', dot: true },
  qualified:   { label: 'Qualified',   variant: 'info',    dot: true },
  proposal:    { label: 'Proposal',    variant: 'default', dot: true },
  negotiation: { label: 'Negotiation', variant: 'warning', dot: true },
  won:         { label: 'Won',         variant: 'success', dot: true },
  lost:        { label: 'Lost',        variant: 'danger',  dot: true },
};

const SOURCE_LABELS = {
  website:      'Website',
  whatsapp:     'WhatsApp',
  referral:     'Referral',
  social_media: 'Social Media',
  cold_call:    'Cold Call',
  email:        'Email',
  other:        'Other',
};

const SERVICE_LABELS = {
  seo:                  'SEO',
  social_media_marketing:'Social Media Marketing',
  ppc:                  'PPC / Paid Ads',
  web_design:           'Web Design',
  web_development:      'Web Development',
  content_marketing:    'Content Marketing',
  email_marketing:      'Email Marketing',
  branding:             'Branding',
  video_marketing:      'Video Marketing',
  other:                'Other',
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'timeline',  label: 'Timeline',  icon: RefreshCw },
  { key: 'messages',  label: 'Messages',  icon: MessageCircle },
  { key: 'tasks',     label: 'Tasks',     icon: CheckCircle2 },
  { key: 'files',     label: 'Files',     icon: FileText },
  { key: 'proposals', label: 'Proposals', icon: FilePlus2 },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="page-container animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
        <div className="space-y-4">
          <div className="card flex flex-col items-center py-8 gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100" />
            <div className="h-5 bg-gray-100 rounded w-32" />
            <div className="h-4 bg-gray-50 rounded w-20" />
          </div>
          <div className="card space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
          </div>
        </div>
        <div className="card h-64" />
      </div>
    </div>
  );
}

// ── Info row helper ───────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, href, className = '' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{label}</div>
        {href ? (
          <a href={href} className="text-sm text-primary font-medium truncate block hover:underline">{value}</a>
        ) : (
          <div className={`text-sm text-dark font-medium truncate ${className}`}>{value}</div>
        )}
      </div>
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ priority, className = '' }) {
  if (priority === 'high') return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full ${className}`}>
      <Flame size={12} /> Hot Lead
    </span>
  );
  if (priority === 'low') return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full ${className}`}>
      <Snowflake size={12} /> Cold Lead
    </span>
  );
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full ${className}`}>
      🌡️ Warm Lead
    </span>
  );
}

// ── Tasks placeholder ─────────────────────────────────────────────────────────

const SAMPLE_TASKS = [
  { id: 1, text: 'Follow up on proposal',  due: '2026-05-20', done: false },
  { id: 2, text: 'Schedule discovery call', due: '2026-05-18', done: true },
  { id: 3, text: 'Send product brochure',   due: '2026-05-16', done: false },
];

function TasksTab({ lead }) {
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [newTask, setNewTask] = useState('');

  const toggle = (id) => setTasks((t) => t.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  const add = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks((t) => [...t, { id: Date.now(), text: newTask.trim(), due: null, done: false }]);
    setNewTask('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Add a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button type="submit" variant="primary" size="sm">
          <Plus size={14} /> Add Task
        </Button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:border-primary/30 ${
              task.done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:bg-primary-light/20'
            }`}
            onClick={() => toggle(task.id)}
          >
            {task.done
              ? <CheckCircle2 size={16} className="text-success shrink-0" />
              : <Circle size={16} className="text-gray-300 shrink-0" />}
            <span className={`text-sm flex-1 ${task.done ? 'line-through text-gray-400' : 'text-dark'}`}>
              {task.text}
            </span>
            {task.due && (
              <span className="text-[10px] text-gray-400 shrink-0">
                {format(new Date(task.due), 'MMM d')}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        Task management coming soon — persisted tasks will be available in a future update.
      </p>
    </div>
  );
}

// ── Files placeholder ─────────────────────────────────────────────────────────

function FilesTab() {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); toast('File upload coming soon', { icon: '📁' }); }}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:border-primary/40 hover:bg-primary-light/20 ${
          dragging ? 'border-primary bg-primary-light/30' : 'border-gray-200'
        }`}
        onClick={() => toast('File upload coming soon', { icon: '📁' })}
      >
        <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
          <Upload size={20} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-dark">Drop files here</p>
        <p className="text-xs text-gray-400 mt-1">or click to browse — PDF, Word, Images up to 10MB</p>
      </div>
      <p className="text-xs text-gray-400 text-center">
        File storage coming soon — documents shared with this lead will appear here.
      </p>
    </div>
  );
}

// ── Proposals placeholder ─────────────────────────────────────────────────────

function ProposalsTab({ lead }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => toast('Proposal builder coming soon', { icon: '📄' })}>
          <FilePlus2 size={14} /> Create Proposal
        </Button>
      </div>
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
          <FileText size={20} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-dark">No proposals yet</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Proposal builder is coming soon. You'll be able to create, send, and track proposals directly from here.
        </p>
      </div>
    </div>
  );
}

// ── More menu ─────────────────────────────────────────────────────────────────

function MoreMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-dark transition-all"
      >
        <Ellipsis size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
          <button
            onClick={() => { onEdit(); close(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={14} className="text-gray-400" /> Edit Lead
          </button>
          <button
            onClick={() => { toast('Archive coming soon', { icon: '📦' }); close(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Archive size={14} className="text-gray-400" /> Archive Lead
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => { onDelete(); close(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} /> Delete Lead
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('timeline');
  const [editOpen, setEditOpen] = useState(false);

  const { data: leadRes, isLoading: leadLoading } = useQuery(
    ['lead', id],
    () => leadService.getOne(id),
    { staleTime: 30_000 }
  );

  const { data: notesRes, isLoading: notesLoading } = useQuery(
    ['lead-notes', id],
    () => leadService.getNotes(id),
    { staleTime: 30_000 }
  );

  const updateMutation = useMutation(
    (data) => leadService.update(id, data),
    {
      onSuccess: (res) => {
        queryClient.setQueryData(['lead', id], res);
        queryClient.invalidateQueries('leads');
        setEditOpen(false);
        toast.success('Lead updated');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update lead'),
    }
  );

  const convertMutation = useMutation(
    () => leadService.convert(id, {}),
    {
      onSuccess: (res) => {
        toast.success('Lead converted to client!');
        queryClient.invalidateQueries('leads');
        navigate(`/clients/${res.data._id}`);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Conversion failed'),
    }
  );

  const deleteMutation = useMutation(
    () => leadService.remove(id),
    {
      onSuccess: () => {
        toast.success('Lead deleted');
        queryClient.invalidateQueries('leads');
        navigate('/leads');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    }
  );

  const handleDelete = () => {
    if (!window.confirm('Delete this lead permanently?')) return;
    deleteMutation.mutate();
  };

  if (leadLoading) return <DetailSkeleton />;

  const lead = leadRes?.data;
  if (!lead) return (
    <div className="page-container flex flex-col items-center justify-center py-20 text-center">
      <UserCircle2 size={40} className="text-gray-200 mb-3" />
      <h2 className="text-lg font-semibold text-dark">Lead not found</h2>
      <p className="text-sm text-gray-400 mt-1">This lead may have been deleted or the ID is incorrect.</p>
      <Link to="/leads" className="mt-4 text-sm text-primary hover:underline">← Back to Leads</Link>
    </div>
  );

  const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
  const notes     = notesRes?.data || [];

  return (
    <div className="page-container">

      {/* ── Breadcrumb + page actions ───────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/leads" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Leads
          </Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-dark font-medium truncate max-w-[200px]">{lead.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {lead.convertedToClient ? (
            <Link to={`/clients/${lead.clientId?._id || lead.clientId}`}>
              <Button variant="secondary" size="sm">
                <CheckCircle2 size={14} className="text-success" /> View Client
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              loading={convertMutation.isLoading}
              onClick={() => convertMutation.mutate()}
            >
              <UserCheck size={14} /> Convert to Client
            </Button>
          )}
          <MoreMenu onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
        </div>
      </div>

      {/* ── Two-column grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-5 items-start">

        {/* ════════════════════════════════════════════════════════
            LEFT COLUMN — sticky sidebar
        ════════════════════════════════════════════════════════ */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Profile card */}
          <div className="card text-center pt-7 pb-5">
            <Avatar name={lead.name} size="xl" className="mx-auto mb-3" />
            <h2 className="text-lg font-bold text-dark font-heading leading-tight">{lead.name}</h2>
            {lead.company && (
              <p className="text-sm text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                <Building2 size={12} className="shrink-0" /> {lead.company}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <Badge variant={statusCfg.variant} dot={statusCfg.dot}>
                {statusCfg.label}
              </Badge>
              <ScoreBadge priority={lead.priority} />
            </div>

            {/* Converted banner */}
            {lead.convertedToClient && (
              <div className="mt-3 mx-2 bg-success/10 text-success text-xs font-semibold rounded-lg px-3 py-1.5 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={12} /> Converted to Client
              </div>
            )}

            {/* Quick action buttons */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 group"
                  title="WhatsApp"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                    <MessageCircle size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-gray-400">WhatsApp</span>
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex flex-col items-center gap-1 group"
                  title="Call"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <span className="text-[10px] text-gray-400">Call</span>
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex flex-col items-center gap-1 group"
                  title="Email"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <Mail size={16} className="text-orange-600" />
                  </div>
                  <span className="text-[10px] text-gray-400">Email</span>
                </a>
              )}
              <button
                onClick={() => setActiveTab('messages')}
                className="flex flex-col items-center gap-1 group"
                title="Message"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-light group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <LayoutList size={16} className="text-primary" />
                </div>
                <span className="text-[10px] text-gray-400">Timeline</span>
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div className="card space-y-3.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Info</h3>
            <InfoRow icon={Phone}    label="Phone"   value={lead.phone}   href={`tel:${lead.phone}`} />
            <InfoRow icon={Mail}     label="Email"   value={lead.email}   href={`mailto:${lead.email}`} />
            <InfoRow icon={Globe}    label="Website" value={lead.website} href={lead.website} />
            <InfoRow icon={Building2}label="Company" value={lead.company} />
            <InfoRow icon={MapPin}   label="Address" value={lead.address} />
          </div>

          {/* Lead info */}
          <div className="card space-y-3.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lead Info</h3>
            <InfoRow
              icon={Star}
              label="Source"
              value={SOURCE_LABELS[lead.source] || lead.source}
            />
            <InfoRow
              icon={UserCircle2}
              label="Assigned To"
              value={lead.assignedTo?.name || 'Unassigned'}
            />
            <InfoRow
              icon={UserCircle2}
              label="Created By"
              value={lead.createdBy?.name}
            />
            <InfoRow
              icon={CalendarDays}
              label="Created"
              value={format(new Date(lead.createdAt), 'dd MMM yyyy')}
            />
            {lead.nextFollowUp && (
              <InfoRow
                icon={Clock}
                label="Next Follow-up"
                value={format(new Date(lead.nextFollowUp), 'dd MMM yyyy')}
              />
            )}
            {lead.lastContactedAt && (
              <InfoRow
                icon={Clock}
                label="Last Contacted"
                value={formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })}
              />
            )}
          </div>

          {/* Budget */}
          {(lead.budget?.min || lead.budget?.max) && (
            <div className="card space-y-3.5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget</h3>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Banknote size={13} className="text-gray-400" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Range</div>
                  <div className="text-sm font-semibold text-dark">
                    {lead.budget.currency || 'BDT'}{' '}
                    {lead.budget.min?.toLocaleString()}
                    {lead.budget.max ? ` – ${lead.budget.max.toLocaleString()}` : '+'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service interests */}
          {lead.interestedServices?.length > 0 && (
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Service Interest</h3>
              <div className="flex flex-wrap gap-1.5">
                {lead.interestedServices.map((svc) => (
                  <span
                    key={svc}
                    className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full"
                  >
                    {SERVICE_LABELS[svc] || svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {lead.tags?.length > 0 && (
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                  >
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes preview */}
          {lead.notes && (
            <div className="card space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT COLUMN — Tabs
        ════════════════════════════════════════════════════════ */}
        <div>
          {/* Tab bar */}
          <div className="card !p-0 overflow-hidden mb-4">
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-thin">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                      active
                        ? 'border-primary text-primary bg-primary-light/30'
                        : 'border-transparent text-gray-500 hover:text-dark hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={14} strokeWidth={active ? 2 : 1.75} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="card">
            {activeTab === 'timeline' && (
              <LeadTimeline lead={lead} notes={notes} isLoading={notesLoading} />
            )}
            {activeTab === 'messages' && (
              <LeadMessages lead={lead} />
            )}
            {activeTab === 'tasks' && (
              <TasksTab lead={lead} />
            )}
            {activeTab === 'files' && (
              <FilesTab />
            )}
            {activeTab === 'proposals' && (
              <ProposalsTab lead={lead} />
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <LeadFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        lead={lead}
        onSave={(data) => updateMutation.mutate(data)}
        isSaving={updateMutation.isLoading}
      />
    </div>
  );
}
