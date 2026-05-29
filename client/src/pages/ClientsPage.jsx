import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Search, Download, Trash2, Plus, X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientService } from '../services/clientService';
import ClientTable from '../components/clients/ClientTable';
import ClientFormModal from '../components/clients/ClientFormModal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const STATUSES = ['active', 'on_hold', 'inactive', 'churned'];
const TIERS    = [{ value: 'basic', label: 'Starter' }, { value: 'standard', label: 'Growth' }, { value: 'premium', label: 'Pro' }, { value: 'enterprise', label: 'Custom' }];
const PAGE_SIZE = 20;

function exportCSV(clients) {
  const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Tier', 'Industry', 'Created'];
  const rows = clients.map((c) => [c.name, c.company || '', c.email || '', c.whatsappNumber || c.phone || '', c.status, c.tier, c.industry || '', new Date(c.createdAt).toLocaleDateString()]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [tierFilter, setTier]     = useState('');
  const [page, setPage]           = useState(1);
  const [sortBy, setSortBy]       = useState('createdAt');
  const [sortDir, setSortDir]     = useState('desc');
  const [selected, setSelected]   = useState(new Set());
  const [formOpen, setFormOpen]   = useState(false);
  const [editClient, setEdit]     = useState(null);

  const params = { search: search || undefined, status: statusFilter || undefined, tier: tierFilter || undefined, page, limit: PAGE_SIZE };

  const { data, isLoading } = useQuery(['clients', params], () => clientService.getAll(params), { keepPreviousData: true, staleTime: 30_000 });

  const clients    = data?.data || [];
  const total      = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const createMutation = useMutation(clientService.create, {
    onSuccess: () => { queryClient.invalidateQueries('clients'); toast.success('Client created'); setFormOpen(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create client'),
  });

  const updateMutation = useMutation(({ id, data }) => clientService.update(id, data), {
    onMutate: async ({ id, data: changes }) => {
      await queryClient.cancelQueries('clients');
      const snaps = queryClient.getQueriesData('clients');
      queryClient.setQueriesData('clients', (old) => old?.data ? { ...old, data: old.data.map((c) => c._id === id ? { ...c, ...changes } : c) } : old);
      return { snaps };
    },
    onError: (_e, _v, ctx) => { ctx?.snaps?.forEach(([k, v]) => queryClient.setQueryData(k, v)); toast.error('Update failed'); },
    onSuccess: () => { queryClient.invalidateQueries('clients'); setFormOpen(false); setEdit(null); toast.success('Client updated'); },
  });

  const deleteMutation = useMutation(clientService.remove, {
    onMutate: async (id) => {
      await queryClient.cancelQueries('clients');
      const snaps = queryClient.getQueriesData('clients');
      queryClient.setQueriesData('clients', (old) => old?.data ? { ...old, data: old.data.filter((c) => c._id !== id) } : old);
      setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
      return { snaps };
    },
    onError: (_e, _v, ctx) => { ctx?.snaps?.forEach(([k, v]) => queryClient.setQueryData(k, v)); toast.error('Delete failed'); },
    onSuccess: () => { queryClient.invalidateQueries('clients'); toast.success('Client deleted'); },
  });

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
    setPage(1);
  };

  const handleSelect = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleSelectAll = (checked) => setSelected(checked ? new Set(clients.map((c) => c._id)) : new Set());

  const handleDelete = (id) => { if (!window.confirm('Delete this client?')) return; deleteMutation.mutate(id); };
  const handleBulkDelete = () => { if (!window.confirm(`Delete ${selected.size} client(s)?`)) return; [...selected].forEach((id) => deleteMutation.mutate(id)); };
  const handleEdit = (c) => { setEdit(c); setFormOpen(true); };
  const handleSave = (data) => { editClient ? updateMutation.mutate({ id: editClient._id, data }) : createMutation.mutate(data); };

  const hasFilters = search || statusFilter || tierFilter;
  const clearFilters = () => { setSearch(''); setStatus(''); setTier(''); setPage(1); };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[1.6rem] font-bold text-dark font-heading leading-tight">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your client relationships
            {total > 0 && <span className="ml-2 font-semibold text-primary">{total.toLocaleString()} total</span>}
          </p>
        </div>
        <Button variant="primary" onClick={() => { setEdit(null); setFormOpen(true); }}>
          <Plus size={15} /> Add New Client
        </Button>
      </div>

      {/* Filter bar */}
      <div className="card !py-3 !px-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px] max-w-[240px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input className="input pl-8 !h-8 text-xs" placeholder="Search name, email, company..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input !h-8 text-xs max-w-[130px]" value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'on_hold' ? 'Paused' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="input !h-8 text-xs max-w-[130px]" value={tierFilter} onChange={(e) => { setTier(e.target.value); setPage(1); }}>
            <option value="">All Packages</option>
            {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all">
              <X size={12} /> Clear
            </button>
          )}
          <div className="flex-1" />
          <button onClick={() => exportCSV(clients)} disabled={!clients.length}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-dark px-3 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-3 px-4 py-2.5 bg-primary-light border border-primary/20 rounded-xl flex items-center gap-3 animate-slide-down">
          <span className="text-sm font-semibold text-primary">{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-xs text-danger font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
            <Trash2 size={13} /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg transition-all">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Table / empty */}
      {clients.length === 0 && !isLoading ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={hasFilters ? 'No clients match your filters' : 'No clients yet'}
            description={hasFilters ? 'Try adjusting your search or clearing filters' : 'Add your first client to start managing relationships'}
            action={!hasFilters ? { label: 'Add First Client', onClick: () => { setEdit(null); setFormOpen(true); } } : undefined}
          />
        </div>
      ) : (
        <ClientTable
          clients={clients}
          loading={isLoading}
          selected={selected}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-400">
            Showing <span className="font-medium text-dark">{Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-medium text-dark">{total.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all">
              <ChevronLeft size={14} />
            </button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-7 h-7 text-xs rounded-lg font-medium transition-all ${page === i + 1 ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <ClientFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEdit(null); }}
        client={editClient}
        onSave={handleSave}
        isSaving={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
}
