import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Flame, Snowflake } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';

const COLUMNS = [
  { key: 'new',         label: 'New',         dot: 'bg-blue-400',    light: 'bg-blue-50',    text: 'text-blue-700',    count: 'bg-blue-100 text-blue-700' },
  { key: 'contacted',   label: 'Contacted',   dot: 'bg-yellow-400',  light: 'bg-yellow-50',  text: 'text-yellow-700',  count: 'bg-yellow-100 text-yellow-700' },
  { key: 'qualified',   label: 'Qualified',   dot: 'bg-violet-400',  light: 'bg-violet-50',  text: 'text-violet-700',  count: 'bg-violet-100 text-violet-700' },
  { key: 'proposal',    label: 'Proposal',    dot: 'bg-orange-400',  light: 'bg-orange-50',  text: 'text-orange-700',  count: 'bg-orange-100 text-orange-700' },
  { key: 'negotiation', label: 'Negotiation', dot: 'bg-pink-400',    light: 'bg-pink-50',    text: 'text-pink-700',    count: 'bg-pink-100 text-pink-700' },
  { key: 'won',         label: 'Won',         dot: 'bg-emerald-400', light: 'bg-emerald-50', text: 'text-emerald-700', count: 'bg-emerald-100 text-emerald-700' },
  { key: 'lost',        label: 'Lost',        dot: 'bg-red-400',     light: 'bg-red-50',     text: 'text-red-700',     count: 'bg-red-100 text-red-700' },
];

const SOURCE_LABELS = {
  website:      'Website',
  whatsapp:     'WhatsApp',
  facebook:     'Facebook',
  facebook_ads: 'FB Ads',
  messenger:    'Messenger',
  referral:     'Referral',
  social_media: 'Social',
  cold_call:    'Direct',
  email:        'Email',
  other:        'Other',
};

function ScoreIcon({ priority }) {
  if (priority === 'high') return <Flame size={12} className="text-orange-500 shrink-0" />;
  if (priority === 'low')  return <Snowflake size={12} className="text-blue-400 shrink-0" />;
  return <span className="text-xs leading-none shrink-0">🌡️</span>;
}

function LeadCard({ lead, isDragging = false }) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-3 transition-all select-none ${
        isDragging ? 'opacity-40 scale-95' : 'hover:shadow-card-hover hover:border-primary/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={lead.name} size="xs" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-dark truncate leading-snug">{lead.name}</div>
            {lead.company && (
              <div className="text-[10px] text-gray-400 truncate">{lead.company}</div>
            )}
          </div>
        </div>
        <ScoreIcon priority={lead.priority} />
      </div>

      {lead.interestedServices?.length > 0 && (
        <div className="text-[10px] text-gray-500 truncate mb-2 bg-gray-50 px-2 py-0.5 rounded-md">
          {lead.interestedServices[0]}
        </div>
      )}

      <div className="flex items-center justify-between mt-1 gap-2">
        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
          {SOURCE_LABELS[lead.source] || lead.source}
        </span>
        {lead.lastContactedAt && (
          <span className="text-[10px] text-gray-400 truncate">
            {formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}

function SortableCard({ lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead._id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative cursor-grab active:cursor-grabbing"
    >
      <LeadCard lead={lead} isDragging={isDragging} />
    </div>
  );
}

function KanbanColumn({ col, leads }) {
  const { setNodeRef } = useDroppable({
    id: col.key,
  });

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[190px] max-w-[240px]">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-2.5 ${col.light}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
          <span className={`text-xs font-semibold ${col.text}`}>{col.label}</span>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.count}`}>
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={leads.map((l) => l._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[140px] bg-slate-50/50 p-1.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-200">
          {leads.map((lead) => (
            <SortableCard key={lead._id} lead={lead} />
          ))}
          {leads.length === 0 && (
            <div className="h-16 rounded-xl border-2 border-dashed border-slate-200/60 bg-white flex items-center justify-center shadow-2xs select-none">
              <span className="text-[10px] text-gray-300 font-bold tracking-wider uppercase">Drop here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function LeadKanban({ leads = [], onStatusChange }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = leads.filter((l) => l.status === col.key);
    return acc;
  }, {});

  const activeLead = activeId ? leads.find((l) => l._id === activeId) : null;

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    let targetColKey = null;
    const isColKey = COLUMNS.some(col => col.key === over.id);
    if (isColKey) {
      targetColKey = over.id;
    } else {
      const targetCol = COLUMNS.find((col) =>
        byStatus[col.key].some((l) => l._id === over.id)
      );
      if (targetCol) targetColKey = targetCol.key;
    }

    if (!targetColKey) return;

    const src = leads.find((l) => l._id === active.id);
    if (src && src.status !== targetColKey) {
      onStatusChange(active.id, targetColKey);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin -mx-1 px-1">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.key} col={col} leads={byStatus[col.key]} />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeLead && (
          <div className="w-[210px] rotate-1 shadow-modal opacity-95">
            <LeadCard lead={activeLead} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
