import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Search, Download, Trash2, Plus, LayoutList, Columns3,
  Target, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { leadService } from '../services/leadService';
import LeadTable from '../components/leads/LeadTable';
import LeadKanban from '../components/leads/LeadKanban';
import LeadFormModal from '../components/leads/LeadFormModal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const SOURCES  = ['website', 'whatsapp', 'facebook', 'facebook_ads', 'messenger', 'referral', 'social_media', 'cold_call', 'email', 'other'];
const SOURCE_LABELS = {
  website:      'Website',
  whatsapp:     'WhatsApp',
  facebook:     'Facebook',
  facebook_ads: 'FB Ads',
  messenger:    'Messenger',
  referral:     'Referral',
  social_media: 'Social Media',
  cold_call:    'Cold Call',
  email:        'Email',
  other:        'Other',
};

const PAGE_SIZE = 20;

function exportCSV(leads) {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Priority', 'Created'];
  const rows = leads.map((l) => [
    l.name,
    l.email || '',
    l.phone || '',
    l.company || '',
    l.source,
    l.status,
    l.priority,
    new Date(l.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  const queryClient = useQueryClient();

  const [view, setView]               = useState('table');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('');
  const [sourceFilter, setSource]     = useState('');
  const [scoreFilter, setScore]       = useState('');
  const [page, setPage]               = useState(1);
  const [sortBy, setSortBy]           = useState('createdAt');
  const [sortDir, setSortDir]         = useState('desc');
  const [selected, setSelected]       = useState(new Set());
  const [formOpen, setFormOpen]       = useState(false);
  const [editLead, setEditLead]       = useState(null);

  const queryParams = {
    search:   search   || undefined,
    status:   statusFilter || undefined,
    source:   sourceFilter || undefined,
    priority: scoreFilter  || undefined,
    page,
    limit: PAGE_SIZE,
    sortBy,
    sortDir,
  };

  const { data, isLoading } = useQuery(
    ['leads', queryParams],
    () => leadService.getAll(queryParams),
    { keepPreviousData: true, staleTime: 30_000 }
  );

  const leads      = data?.data || [];
  const total      = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation(leadService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('leads');
      toast.success('Lead created successfully');
      setFormOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create lead'),
  });

  const updateMutation = useMutation(
    ({ id, data: payload }) => leadService.update(id, payload),
    {
      onMutate: async ({ id, data: changes }) => {
        await queryClient.cancelQueries('leads');
        const snapshots = queryClient.getQueriesData('leads');
        queryClient.setQueriesData('leads', (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.map((l) => (l._id === id ? { ...l, ...changes } : l)) };
        });
        return { snapshots };
      },
      onError: (_err, _v, ctx) => {
        if (ctx?.snapshots) {
          ctx.snapshots.forEach(([key, val]) => queryClient.setQueryData(key, val));
        }
        toast.error('Failed to update lead');
      },
      onSuccess: (_data, vars) => {
        queryClient.invalidateQueries('leads');
        if (vars.showToast !== false) toast.success('Lead updated');
        setFormOpen(false);
        setEditLead(null);
      },
    }
  );

  const deleteMutation = useMutation(leadService.remove, {
    onMutate: async (id) => {
      await queryClient.cancelQueries('leads');
      const snapshots = queryClient.getQueriesData('leads');
      queryClient.setQueriesData('leads', (old) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((l) => l._id !== id) };
      });
      setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
      return { snapshots };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.snapshots) {
        ctx.snapshots.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      toast.error('Failed to delete lead');
    },
  });

  const convertMutation = useMutation(
    (id) => leadService.convert(id, {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('leads');
        queryClient.invalidateQueries('clients');
        toast.success('Lead converted to Client successfully! 🎉');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to convert lead to client');
      }
    }
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortDir('asc'); }
    setPage(1);
  };

  const handleSelect = (id) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSelectAll = (checked) => {
    setSelected(checked ? new Set(leads.map((l) => l._id)) : new Set());
  };

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({ id, data: { status }, showToast: false });
  };

  const handleEdit = (lead) => {
    setEditLead(lead);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this lead? This action cannot be undone.')) return;
    deleteMutation.mutate(id);
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selected.size} lead(s)? This cannot be undone.`)) return;
    [...selected].forEach((id) => deleteMutation.mutate(id));
  };

  const handleSave = (formData) => {
    if (editLead) {
      updateMutation.mutate({ id: editLead._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const hasFilters = search || statusFilter || sourceFilter || scoreFilter;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setSource('');
    setScore('');
    setPage(1);
  };

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[1.6rem] font-bold text-dark font-heading leading-tight">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your sales pipeline
            {total > 0 && (
              <span className="ml-2 font-semibold text-primary">{total.toLocaleString()} total</span>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setEditLead(null); setFormOpen(true); }}
        >
          <Plus size={15} className="shrink-0" />
          Add New Lead
        </Button>
      </div>

      {/* Filter bar */}
      <div className="card !py-3 !px-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">

          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-[240px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="input pl-8 !h-8 text-xs"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Status */}
          <select
            className="input !h-8 text-xs max-w-[130px]"
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          {/* Source */}
          <select
            className="input !h-8 text-xs max-w-[130px]"
            value={sourceFilter}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
          >
            <option value="">All Sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
            ))}
          </select>

          {/* Score */}
          <select
            className="input !h-8 text-xs max-w-[120px]"
            value={scoreFilter}
            onChange={(e) => { setScore(e.target.value); setPage(1); }}
          >
            <option value="">All Scores</option>
            <option value="high">🔥 Hot</option>
            <option value="medium">🌡️ Warm</option>
            <option value="low">❄️ Cold</option>
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all"
            >
              <X size={12} /> Clear
            </button>
          )}

          <div className="flex-1" />

          {/* Export CSV */}
          <button
            onClick={() => exportCSV(leads)}
            disabled={!leads.length}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-dark px-3 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={13} /> Export
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                view === 'table'
                  ? 'bg-white text-dark shadow-sm'
                  : 'text-gray-500 hover:text-dark'
              }`}
            >
              <LayoutList size={13} /> Table
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                view === 'kanban'
                  ? 'bg-white text-dark shadow-sm'
                  : 'text-gray-500 hover:text-dark'
              }`}
            >
              <Columns3 size={13} /> Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-3 px-4 py-2.5 bg-primary-light border border-primary/20 rounded-xl flex items-center gap-3 animate-slide-down">
          <span className="text-sm font-semibold text-primary">{selected.size} selected</span>
          <div className="flex-1" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs text-danger font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
          >
            <Trash2 size={13} /> Delete Selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg transition-all"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Main content */}
      {leads.length === 0 && !isLoading ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title={hasFilters ? 'No leads match your filters' : 'No leads yet'}
            description={
              hasFilters
                ? 'Try adjusting your search or clearing the filters'
                : 'Start building your pipeline by adding your first lead'
            }
            action={
              !hasFilters
                ? { label: 'Add First Lead', onClick: () => { setEditLead(null); setFormOpen(true); } }
                : undefined
            }
          />
        </div>
      ) : view === 'table' ? (
        <div className="table-scroll rounded-xl border border-gray-100 bg-white">
          <LeadTable
            leads={leads}
            loading={isLoading}
            selected={selected}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvert={(lead) => {
              if (window.confirm(`Are you sure you want to convert "${lead.name}" to an active client?`)) {
                convertMutation.mutate(lead._id);
              }
            }}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        </div>
      ) : (
        <LeadKanban leads={leads} onStatusChange={handleStatusChange} />
      )}

      {/* Pagination */}
      {view === 'table' && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-400">
            Showing{' '}
            <span className="font-medium text-dark">
              {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)}
            </span>{' '}
            of <span className="font-medium text-dark">{total.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition-all ${
                    page === p
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Lead form modal */}
      <LeadFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditLead(null); }}
        lead={editLead}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
