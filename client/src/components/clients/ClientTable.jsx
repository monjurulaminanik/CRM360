import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ellipsis, Eye, Pencil, Trash2, ChevronDown, ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  active:   { label: 'Active',   variant: 'success', dot: true },
  on_hold:  { label: 'Paused',   variant: 'warning', dot: true },
  inactive: { label: 'Inactive', variant: 'default', dot: true },
  churned:  { label: 'Churned',  variant: 'danger',  dot: true },
};

const TIER_CFG = {
  basic:      { label: 'Starter',  cls: 'bg-gray-100 text-gray-600' },
  standard:   { label: 'Growth',   cls: 'bg-blue-50 text-blue-700' },
  premium:    { label: 'Pro',      cls: 'bg-violet-50 text-violet-700' },
  enterprise: { label: 'Custom',   cls: 'bg-amber-50 text-amber-700' },
};

const SERVICE_ABBR = {
  seo:                  'SEO',
  social_media_marketing:'SMM',
  ppc:                  'PPC',
  web_design:           'Design',
  web_development:      'Web Dev',
  content_marketing:    'Content',
  email_marketing:      'Email',
  branding:             'Brand',
  video_marketing:      'Video',
  other:                'Other',
};

function HealthBar({ score = 0 }) {
  const color = score >= 75 ? 'bg-success' : score >= 45 ? 'bg-warning' : 'bg-danger';
  const textColor = score >= 75 ? 'text-success' : score >= 45 ? 'text-warning' : 'text-danger';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[60px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-semibold ${textColor}`}>{score}</span>
    </div>
  );
}

function useOutsideClick(ref, fn) {
  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) fn(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, fn]);
}

function StatusInline({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const cfg = STATUS_CFG[status] || STATUS_CFG.active;
  return (
    <div ref={ref} className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
        <Badge variant={cfg.variant} dot={cfg.dot} size="sm">{cfg.label}</Badge>
        <ChevronDown size={11} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-32 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
          {Object.entries(STATUS_CFG).map(([key, c]) => (
            <button key={key} onClick={(e) => { e.stopPropagation(); onChange(key); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors ${key === status ? 'font-semibold' : ''}`}>
              <Badge variant={c.variant} dot size="sm">{c.label}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionMenu({ client, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  return (
    <div ref={ref} className="relative flex justify-end">
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100">
        <Ellipsis size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-40 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
          <Link to={`/clients/${client._id}`} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
            <Eye size={14} className="text-gray-400" /> View Detail
          </Link>
          <button onClick={() => { onEdit(client); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Pencil size={14} className="text-gray-400" /> Edit
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button onClick={() => { onDelete(client._id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClientTable({ clients = [], loading, selected, onSelect, onSelectAll, onStatusChange, onEdit, onDelete, sortBy, sortDir, onSort }) {
  const allSelected = clients.length > 0 && selected.size === clients.length;

  function SortBtn({ field, label }) {
    return (
      <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={() => onSort(field)}>
        {label}<ArrowUpDown size={12} className={sortBy === field ? 'text-primary' : 'text-gray-300'} />
      </button>
    );
  }

  const monthlyValue = (client) =>
    (client.activeServices || []).reduce((s, svc) => s + (svc.monthlyRetainer || 0), 0);

  if (loading) {
    return (
      <div className="card p-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 animate-pulse last:border-0">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <div className="w-9 h-9 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-100 rounded w-1/4" /><div className="h-2.5 bg-gray-50 rounded w-1/3" /></div>
            <div className="w-16 h-5 bg-gray-100 rounded-full" />
            <div className="w-20 h-5 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[960px]">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="pl-4 pr-2 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer" />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"><SortBtn field="name" label="Client" /></th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Services</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Health</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell"><SortBtn field="monthlyValue" label="MRR" /></th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Renewal</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="pr-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.map((client) => {
              const tier = TIER_CFG[client.tier] || TIER_CFG.standard;
              const mrr  = monthlyValue(client);
              return (
                <tr key={client._id} className={`hover:bg-gray-50/70 transition-colors group ${selected.has(client._id) ? 'bg-primary-light/40' : ''}`}>
                  <td className="pl-4 pr-2 py-3">
                    <input type="checkbox" checked={selected.has(client._id)} onChange={() => onSelect(client._id)}
                      onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer" />
                  </td>
                  <td className="px-3 py-3">
                    <Link to={`/clients/${client._id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                      <Avatar name={client.name} size="sm" />
                      <div className="min-w-0">
                        <div className="font-semibold text-dark truncate leading-snug">{client.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {client.company || '—'} · Joined {client.createdAt ? format(new Date(client.createdAt), 'dd MMM yyyy') : '—'}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <div className="text-xs text-gray-600">{client.whatsappNumber || client.phone || '—'}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[120px]">{client.email || ''}</div>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(client.activeServices || []).slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] font-medium text-primary bg-primary-light px-1.5 py-0.5 rounded-full">
                          {SERVICE_ABBR[s.service] || s.service}
                        </span>
                      ))}
                      {(client.activeServices || []).length > 3 && (
                        <span className="text-[10px] text-gray-400">+{client.activeServices.length - 3}</span>
                      )}
                      {!(client.activeServices?.length) && <span className="text-xs text-gray-300">None</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.cls}`}>{tier.label}</span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <HealthBar score={client.healthScore ?? 75} />
                  </td>
                  <td className="px-3 py-3 hidden xl:table-cell">
                    <span className="text-sm font-semibold text-dark">
                      {mrr > 0 ? `৳${mrr.toLocaleString()}` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden xl:table-cell">
                    <span className="text-xs text-gray-500">
                      {client.renewalDate ? format(new Date(client.renewalDate), 'dd MMM yy') : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusInline status={client.status} onChange={(s) => onStatusChange(client._id, s)} />
                  </td>
                  <td className="pr-4 py-3">
                    <ActionMenu client={client} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-14 text-center text-sm text-gray-400">No clients match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
