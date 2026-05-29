import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
  StickyNote, Phone, Mail, Users, MessageCircle, RefreshCw,
  CalendarDays, Plus, ChevronDown, UserCircle2, Loader2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { leadService } from '../../services/leadService';
import toast from 'react-hot-toast';
import Avatar from '../ui/Avatar';

const TYPE_CONFIG = {
  note:          { icon: StickyNote,    color: 'bg-gray-100 text-gray-500',     label: 'Note' },
  call:          { icon: Phone,         color: 'bg-green-100 text-green-600',   label: 'Call' },
  email:         { icon: Mail,          color: 'bg-blue-100 text-blue-600',     label: 'Email' },
  meeting:       { icon: Users,         color: 'bg-violet-100 text-violet-600', label: 'Meeting' },
  whatsapp:      { icon: MessageCircle, color: 'bg-emerald-100 text-emerald-600', label: 'WhatsApp' },
  status_change: { icon: RefreshCw,     color: 'bg-amber-100 text-amber-600',   label: 'Status Change' },
  other:         { icon: CalendarDays,  color: 'bg-gray-100 text-gray-500',     label: 'Activity' },
};

const NOTE_TYPES = ['note', 'call', 'email', 'meeting', 'whatsapp', 'other'];

function TimelineEntry({ entry }) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.other;
  const Icon = cfg.icon;

  return (
    <div className="relative flex gap-3.5 pb-6 last:pb-0">
      {/* Vertical connector line */}
      <div className="absolute left-[18px] top-9 bottom-0 w-px bg-gray-100 last:hidden" />

      {/* Icon dot */}
      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center z-10 ${cfg.color}`}>
        <Icon size={15} strokeWidth={1.75} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {entry.createdBy ? (
              <Avatar name={entry.createdBy.name} size="xs" />
            ) : (
              <UserCircle2 size={16} className="text-gray-300" />
            )}
            <span className="text-xs font-semibold text-dark">
              {entry.createdBy?.name || 'System'}
            </span>
            <span className="text-xs text-gray-400">
              {entry.type === 'status_change' ? 'changed status' :
               entry.type === 'call' ? 'logged a call' :
               entry.type === 'email' ? 'sent an email' :
               entry.type === 'meeting' ? 'logged a meeting' :
               entry.type === 'whatsapp' ? 'sent a WhatsApp' :
               'added a note'}
            </span>
          </div>
          <time
            title={format(new Date(entry.createdAt), 'PPpp')}
            className="text-[10px] text-gray-400 shrink-0"
          >
            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
          </time>
        </div>

        {/* Note body */}
        {entry.type === 'status_change' && entry.metadata ? (
          <div className="mt-1.5 text-xs text-gray-600">
            Moved from{' '}
            <span className="font-semibold capitalize text-dark">{entry.metadata.from}</span>
            {' → '}
            <span className="font-semibold capitalize text-primary">{entry.metadata.to}</span>
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {entry.text}
          </p>
        )}
      </div>
    </div>
  );
}

function CreationEntry({ lead }) {
  return (
    <div className="relative flex gap-3.5 pb-6">
      <div className="absolute left-[18px] top-9 bottom-0 w-px bg-gray-100" />
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center z-10 bg-primary-light text-primary">
        <UserCircle2 size={15} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {lead.createdBy && <Avatar name={lead.createdBy.name} size="xs" />}
            <span className="text-xs font-semibold text-dark">{lead.createdBy?.name || 'System'}</span>
            <span className="text-xs text-gray-400">created this lead</span>
          </div>
          <time className="text-[10px] text-gray-400 shrink-0">
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </time>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          Lead created via <span className="capitalize font-medium text-dark">{lead.source?.replace('_', ' ')}</span>
        </p>
      </div>
    </div>
  );
}

export default function LeadTimeline({ lead, notes = [], isLoading }) {
  const queryClient = useQueryClient();
  const [noteType, setNoteType] = useState('note');
  const [text, setText] = useState('');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const textRef = useRef(null);

  const addMutation = useMutation(
    (data) => leadService.addNote(lead._id, data),
    {
      onSuccess: (res) => {
        queryClient.setQueryData(['lead-notes', lead._id], (old) => ({
          ...old,
          data: [...(old?.data || []), res.data],
        }));
        setText('');
        toast.success('Note added');
      },
      onError: () => toast.error('Failed to add note'),
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addMutation.mutate({ type: noteType, text: text.trim() });
  };

  const cfg = TYPE_CONFIG[noteType];
  const TypeIcon = cfg.icon;

  // Merge notes with creation event, sorted oldest-first
  const entries = [...notes].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="space-y-5">
      {/* Add note form */}
      <form onSubmit={handleSubmit} className="card !p-4">
        {/* Type selector */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTypeMenu((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${cfg.color} hover:opacity-80`}
            >
              <TypeIcon size={13} strokeWidth={1.75} />
              {cfg.label}
              <ChevronDown size={11} />
            </button>
            {showTypeMenu && (
              <div className="absolute left-0 top-full mt-1 z-20 w-36 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
                {NOTE_TYPES.map((t) => {
                  const c = TYPE_CONFIG[t];
                  const TIcon = c.icon;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setNoteType(t); setShowTypeMenu(false); textRef.current?.focus(); }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${t === noteType ? 'font-semibold' : ''}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center ${c.color}`}>
                        <TIcon size={11} />
                      </span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">Add to timeline</span>
        </div>

        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            noteType === 'call' ? 'What was discussed on the call?' :
            noteType === 'email' ? 'Summarize the email...' :
            noteType === 'meeting' ? 'Meeting summary...' :
            noteType === 'whatsapp' ? 'WhatsApp conversation summary...' :
            'Add a note...'
          }
          className="input resize-none h-20 text-sm w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e);
          }}
        />

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[10px] text-gray-400">Ctrl+Enter to submit</span>
          <button
            type="submit"
            disabled={!text.trim() || addMutation.isLoading}
            className="flex items-center gap-1.5 btn-primary !h-7 !px-3 !text-xs disabled:opacity-50"
          >
            {addMutation.isLoading ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Plus size={11} />
            )}
            Add {cfg.label}
          </button>
        </div>
      </form>

      {/* Timeline entries */}
      <div className="relative">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3.5 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-8 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <CreationEntry lead={lead} />
        ) : (
          <>
            <CreationEntry lead={lead} />
            {entries.map((entry) => (
              <TimelineEntry key={entry._id} entry={entry} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
