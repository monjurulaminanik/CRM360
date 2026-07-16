import { useState, useEffect } from 'react';
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
import { CheckSquare, Plus, Clock, AlertTriangle, CheckCircle, Search, Trash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';

const COLUMNS = [
  { key: 'todo',        label: 'Todo',        icon: Clock,          iconCls: 'text-gray-400' },
  { key: 'in-progress', label: 'In Progress', icon: AlertTriangle,  iconCls: 'text-amber-500' },
  { key: 'review',      label: 'Review',      icon: CheckSquare,    iconCls: 'text-primary' },
  { key: 'completed',   label: 'Completed',   icon: CheckCircle,    iconCls: 'text-success' },
];

function getPriorityBadge(prio) {
  switch (prio) {
    case 'high': return 'bg-red-50 text-red-600 border-red-100';
    case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
    default: return 'bg-blue-50 text-blue-600 border-blue-100';
  }
}

function TaskCard({ task, isDragging = false, onDelete }) {
  return (
    <div
      className={`bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm space-y-3 select-none transition-all duration-200 ${
        isDragging ? 'opacity-40 scale-95' : 'hover:border-primary/20 group'
      }`}
    >
      <p className="text-xs font-semibold text-gray-800 leading-normal">{task.title}</p>

      <div className="flex justify-between items-center text-[10px]">
        <span className={`px-2 py-0.5 rounded-full border font-bold ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>
        <span className="text-gray-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />{' '}
          {task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'No date'}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-gray-50 pt-2 text-[10px]">
        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
          <div className="w-5 h-5 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-[9px]">
            {task.assignee ? task.assignee.name.charAt(0) : 'U'}
          </div>
          <span className="truncate max-w-[80px]">
            {task.assignee ? task.assignee.name : 'Unassigned'}
          </span>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onDelete }) {
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
      className="relative cursor-grab active:cursor-grabbing"
    >
      <TaskCard task={task} isDragging={isDragging} onDelete={onDelete} />
    </div>
  );
}

function KanbanColumn({ col, tasks, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  const Icon = col.icon;

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-50/50 p-4 rounded-xl border flex flex-col h-[500px] transition-colors ${
        isOver ? 'border-primary/40 bg-primary/5' : 'border-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Icon className={`h-4 w-4 ${col.iconCls}`} />
          {col.label}
        </span>
        <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
          {tasks.map((t) => (
            <SortableTaskCard key={t._id} task={t} onDelete={onDelete} />
          ))}
          {!tasks.length && (
            <div className="text-center py-8 text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('Monjurul Amin Anik');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await getTasks();
      if (res.success) setTasks(res.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const newTask = {
        title: newTitle,
        priority: newPriority,
        status: 'todo',
        dueDate: newDueDate || new Date().toISOString().split('T')[0],
      };
      const res = await createTask(newTask);
      if (res.success) {
        setTasks([res.data, ...tasks]);
        setNewTitle('');
        setShowAddModal(false);
        toast.success('Task created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const prev = tasks;
    setTasks(tasks.map((t) => (t._id === id ? { ...t, status: newStatus } : t)));
    try {
      const res = await updateTask(id, { status: newStatus });
      if (res.success) {
        setTasks((curr) => curr.map((t) => (t._id === id ? res.data : t)));
        toast.success('Task moved!');
      } else {
        setTasks(prev);
      }
    } catch (error) {
      setTasks(prev);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await deleteTask(id);
      if (res.success) {
        setTasks(tasks.filter((t) => t._id !== id));
        toast.success('Task deleted');
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterPriority === 'all' || t.priority === filterPriority)
  );

  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = filteredTasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
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
    if (src && src.status !== targetColKey) {
      handleStatusChange(active.id, targetColKey);
    }
  };

  return (
    <div className="page-container animate-fade-in font-sans">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Task Board
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Drag cards between columns to update status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-1.5 text-xs"
        >
          <Plus className="h-4 w-4" /> Create Task
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            className="input pl-9 text-xs"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input sm:w-40 text-xs"
        >
          <option value="all">All Priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🔵 Low</option>
        </select>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.key}
                col={col}
                tasks={byStatus[col.key]}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <div className="w-[260px] rotate-1 shadow-modal opacity-95">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Create New Deliverable</h3>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Task Title
                </label>
                <input
                  required
                  className="input text-xs"
                  placeholder="e.g. Design branding guide"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="input text-xs"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group hidden">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Assignee
                </label>
                <input
                  className="input text-xs"
                  placeholder="Employee name"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary h-8 text-xs px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary h-8 text-xs px-4">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
