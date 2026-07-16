import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
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
import { CheckSquare, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import projectService from '../../../services/projectService';

const COLUMNS = [
  { key: 'todo', label: 'Todo' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

function TaskCard({ task, isDragging = false }) {
  return (
    <div
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 select-none transition-colors ${
        isDragging ? 'opacity-40 scale-95' : 'hover:border-primary/30'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
          {task.taskCode}
        </span>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-2">
        {task.name || task.title}
      </h4>
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {task.progressPercent > 0 && <span>{task.progressPercent}%</span>}
        </div>
        {task.assignedTo && (
          <div
            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold"
            title={task.assignedTo.name}
          >
            {task.assignedTo.name.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
}

function SortableTaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}

function KanbanColumn({ col, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 flex flex-col rounded-xl p-3 border transition-colors ${
        isOver ? 'bg-primary/5 border-primary/30' : 'bg-gray-100 border-gray-200'
      }`}
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          {col.label}
        </h3>
        <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} />
          ))}
          {!tasks.length && (
            <div className="h-16 rounded-lg border-2 border-dashed border-gray-200 bg-white/50 flex items-center justify-center">
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                Drop here
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function ExecutionPhase({ projectId }) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [localTasks, setLocalTasks] = useState(null);

  const { data: tasksData, isLoading } = useQuery(
    ['tasks', projectId],
    () => projectService.getTasks(projectId),
    {
      onSuccess: (res) => setLocalTasks(res?.data || []),
    }
  );

  const tasks = localTasks ?? tasksData?.data ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    let targetColKey = null;
    if (COLUMNS.some((col) => col.key === over.id)) {
      targetColKey = over.id;
    } else {
      const targetCol = COLUMNS.find((col) =>
        byStatus[col.key].some((t) => t._id === over.id)
      );
      if (targetCol) targetColKey = targetCol.key;
    }

    if (!targetColKey) return;

    const src = tasks.find((t) => t._id === active.id);
    if (!src || src.status === targetColKey) return;

    const prev = tasks;
    setLocalTasks(tasks.map((t) => (t._id === active.id ? { ...t, status: targetColKey } : t)));

    try {
      await projectService.updateTask(active.id, { status: targetColKey });
      queryClient.invalidateQueries(['tasks', projectId]);
      toast.success('Task moved!');
    } catch (error) {
      setLocalTasks(prev);
      toast.error('Failed to update task status');
    }
  };

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading tasks...</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            Execution Phase
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag cards between columns to update status.
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.key} col={col} tasks={byStatus[col.key]} />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div className="w-80 rotate-1 shadow-modal opacity-95">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
