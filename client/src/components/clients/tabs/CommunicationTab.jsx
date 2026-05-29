import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { MessageCircle, Mail, StickyNote, Phone, Users, RefreshCw, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { clientService } from '../../../services/clientService';
import LeadMessages from '../../leads/LeadMessages';
import Avatar from '../../ui/Avatar';
import toast from 'react-hot-toast';

const TYPE_CFG = {
  note:          { icon: StickyNote,    color: 'bg-gray-100 text-gray-500',       label: 'Note' },
  call:          { icon: Phone,         color: 'bg-green-100 text-green-600',     label: 'Call' },
  email:         { icon: Mail,          color: 'bg-blue-100 text-blue-600',       label: 'Email' },
  meeting:       { icon: Users,         color: 'bg-violet-100 text-violet-600',   label: 'Meeting' },
  whatsapp:      { icon: MessageCircle, color: 'bg-emerald-100 text-emerald-600', label: 'WhatsApp' },
  status_change: { icon: RefreshCw,     color: 'bg-amber-100 text-amber-600',     label: 'Status Change' },
  other:         { icon: StickyNote,    color: 'bg-gray-100 text-gray-500',       label: 'Activity' },
};

const NOTE_TYPES = ['note', 'call', 'email', 'meeting', 'whatsapp', 'other'];

function NoteEntry({ entry }) {
  const cfg = TYPE_CFG[entry.type] || TYPE_CFG.other;
  const Icon = cfg.icon;
  return (
    <div className="relative flex gap-3.5 pb-5 last:pb-0">
      <div className="absolute left-[18px] top-9 bottom-0 w-px bg-gray-100 last:hidden" />
      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center z-10 ${cfg.color}`}>
        <Icon size={14} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {entry.createdBy && <Avatar name={entry.createdBy.name} size="xs" />}
            <span className="text-xs font-semibold text-dark">{entry.createdBy?.name || 'System'}</span>
            <span className="text-xs text-gray-400">
              {entry.type === 'call' ? 'logged a call' : entry.type === 'email' ? 'sent an email' : entry.type === 'meeting' ? 'logged a meeting' : 'added a note'}
            </span>
          </div>
          <time title={format(new Date(entry.createdAt), 'PPpp')} className="text-[10px] text-gray-400 shrink-0">
            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
          </time>
        </div>
        <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
      </div>
    </div>
  );
}

function NotesPanel({ client, notes, isLoading }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState('note');
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const textRef = useRef(null);

  const addMutation = useMutation(
    (data) => clientService.addNote(client._id, data),
    {
      onSuccess: (res) => {
        queryClient.setQueryData(['client-notes', client._id], (old) => ({
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
    addMutation.mutate({ type, text: text.trim() });
  };

  const cfg = TYPE_CFG[type];
  const TypeIcon = cfg.icon;

  return (
    <div className="space-y-5">
      {/* Add note form */}
      <form onSubmit={handleSubmit} className="card !p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${cfg.color} hover:opacity-80`}>
              <TypeIcon size={13} />{cfg.label}<ChevronDown size={11} />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full mt-1 z-20 w-36 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 animate-slide-down">
                {NOTE_TYPES.map((t) => {
                  const c = TYPE_CFG[t]; const TI = c.icon;
                  return (
                    <button key={t} type="button" onClick={() => { setType(t); setMenuOpen(false); textRef.current?.focus(); }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 ${t === type ? 'font-semibold' : ''}`}>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center ${c.color}`}><TI size={11} /></span>{c.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">Add to communication log</span>
        </div>
        <textarea ref={textRef} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Log a note, call summary, meeting outcome..."
          className="input resize-none h-20 text-sm w-full"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e); }} />
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[10px] text-gray-400">Ctrl+Enter to submit</span>
          <button type="submit" disabled={!text.trim() || addMutation.isLoading}
            className="flex items-center gap-1.5 btn-primary !h-7 !px-3 !text-xs disabled:opacity-50">
            {addMutation.isLoading ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
            Add {cfg.label}
          </button>
        </div>
      </form>

      {/* Notes timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3.5 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2 pt-1"><div className="h-3 bg-gray-100 rounded w-1/3" /><div className="h-8 bg-gray-50 rounded" /></div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="py-8 text-center">
          <StickyNote size={24} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No communication logged yet</p>
        </div>
      ) : (
        <div>{notes.map((n) => <NoteEntry key={n._id} entry={n} />)}</div>
      )}
    </div>
  );
}

export default function CommunicationTab({ client, notes = [], notesLoading }) {
  const [view, setView] = useState('notes');
  const phone = client.whatsappNumber || client.phone;

  return (
    <div className="space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 w-fit">
        {[{ key: 'notes', label: 'Activity Log', icon: StickyNote }, { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === key ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {view === 'notes' ? (
        <NotesPanel client={client} notes={notes} isLoading={notesLoading} />
      ) : (
        <LeadMessages lead={{ ...client, _id: client._id, phone }} />
      )}
    </div>
  );
}
