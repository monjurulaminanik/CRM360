import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown, Ellipsis, Eye, Pencil, UserCheck, Trash2,
  ChevronDown, Flame, Snowflake,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const STATUS_CONFIG = {
  new:         { label: 'New',         variant: 'info' },
  contacted:   { label: 'Contacted',   variant: 'warning' },
  qualified:   { label: 'Qualified',   variant: 'info' },
  proposal:    { label: 'Proposal',    variant: 'default' },
  negotiation: { label: 'Negotiation', variant: 'warning' },
  won:         { label: 'Won',         variant: 'success' },
  lost:        { label: 'Lost',        variant: 'danger' },
};

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

const SOURCE_LABELS = {
  website:     'Website',
  whatsapp:    'WhatsApp',
  referral:    'Referral',
  social_media:'Social',
  cold_call:   'Direct',
  email:       'Email',
  other:       'Other',
};

function ScoreBadge({ priority }) {
  if (priority === 'high') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
        <Flame size={11} /> Hot
      </span>
    );
  }
  if (priority === 'low') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
        <Snowflake size={11} /> Cold
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      🌡️ Warm
    </span>
  );
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current?.contains(e.target)) handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

function StatusInline({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
      >
        <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
        <ChevronDown size={11} className="text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-38 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
          {STATUSES.map((s) => {
            const c = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors ${s === status ? 'opacity-100' : 'opacity-70'}`}
              >
                <Badge variant={c.variant} dot size="sm">{c.label}</Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionMenu({ lead, onEdit, onDelete, onConvert }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100"
      >
        <Ellipsis size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
          <Link
            to={`/leads/${lead._id}`}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            <Eye size={14} className="text-gray-400" />
            View Detail
          </Link>
          <button
            onClick={() => { onEdit(lead); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={14} className="text-gray-400" />
            Edit Lead
          </button>
          <button
            onClick={() => { onConvert(lead); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <UserCheck size={14} className="text-success" />
            Convert to Client
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => { onDelete(lead._id); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function LeadTable({
  leads = [],
  loading,
  selected,
  onSelect,
  onSelectAll,
  onStatusChange,
  onEdit,
  onDelete,
  onConvert,
  sortBy,
  sortDir,
  onSort,
}) {
  const allSelected = leads.length > 0 && selected.size === leads.length;

  function SortBtn({ field, label }) {
    return (
      <button
        className="flex items-center gap-1 hover:text-primary transition-colors"
        onClick={() => onSort(field)}
      >
        {label}
        <ArrowUpDown
          size={12}
          className={sortBy === field ? 'text-primary' : 'text-gray-300'}
        />
      </button>
    );
  }

  if (loading) {
    return (
      <div className="card p-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 animate-pulse last:border-0">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <div className="w-8 h-8 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-2.5 bg-gray-50 rounded w-1/3" />
            </div>
            <div className="w-16 h-5 bg-gray-100 rounded-full" />
            <div className="w-20 h-5 bg-gray-100 rounded-full" />
            <div className="w-12 h-5 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <SortBtn field="name" label="Lead" />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                Phone
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                Source
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Score
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">
                <SortBtn field="lastContactedAt" label="Last Contact" />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">
                Assigned To
              </th>
              <th className="pr-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className={`hover:bg-gray-50/70 transition-colors group ${
                  selected.has(lead._id) ? 'bg-primary-light/40' : ''
                }`}
              >
                <td className="pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(lead._id)}
                    onChange={() => onSelect(lead._id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                  />
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={lead.name} size="sm" />
                    <div className="min-w-0">
                      <div className="font-semibold text-dark truncate leading-snug">{lead.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {lead.email || lead.company || '—'}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-gray-500 text-xs hidden md:table-cell">
                  {lead.phone || '—'}
                </td>

                <td className="px-3 py-3 hidden lg:table-cell">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    {SOURCE_LABELS[lead.source] || lead.source}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <StatusInline
                    status={lead.status}
                    onChange={(s) => onStatusChange(lead._id, s)}
                  />
                </td>

                <td className="px-3 py-3">
                  <ScoreBadge priority={lead.priority} />
                </td>

                <td className="px-3 py-3 hidden xl:table-cell">
                  <span className="text-xs text-gray-400">
                    {lead.lastContactedAt
                      ? formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })
                      : '—'}
                  </span>
                </td>

                <td className="px-3 py-3 hidden xl:table-cell">
                  {lead.assignedTo ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={lead.assignedTo.name || ''} size="xs" />
                      <span className="text-xs text-gray-500 truncate max-w-[72px]">
                        {lead.assignedTo.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">Unassigned</span>
                  )}
                </td>

                <td className="pr-4 py-3">
                  <ActionMenu
                    lead={lead}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onConvert={onConvert}
                  />
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center text-gray-400 text-sm">
                  No leads match your current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
