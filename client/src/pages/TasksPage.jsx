import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, AlertTriangle, CheckCircle, Search, Trash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('Monjurul Amin Anik');

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
    try {
      const res = await updateTask(id, { status: newStatus });
      if (res.success) {
        setTasks(tasks.map(t => t._id === id ? res.data : t));
        toast.success('Task status updated!');
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await deleteTask(id);
      if (res.success) {
        setTasks(tasks.filter(t => t._id !== id));
        toast.success('Task deleted');
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (filterPriority === 'all' || t.priority === filterPriority)
  );

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Clock className="h-4.5 w-4.5 text-gray-400" />;
      case 'in-progress': return <AlertTriangle className="h-4.5 w-4.5 text-amber-500 animate-pulse" />;
      case 'review': return <CheckSquare className="h-4.5 w-4.5 text-primary" />;
      default: return <CheckCircle className="h-4.5 w-4.5 text-success" />;
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
          <p className="text-xs text-gray-500 mt-0.5">Manage tasks and assignments for client deliverables.</p>
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

      {/* Task List Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['todo', 'in-progress', 'review', 'completed'].map((colStatus) => {
          const colTasks = filteredTasks.filter(t => t.status === colStatus);
          
          return (
            <div key={colStatus} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col h-[500px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  {getStatusIcon(colStatus)}
                  {colStatus.replace('-', ' ')}
                </span>
                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Tasks Scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
                {colTasks.map((t) => (
                  <div key={t._id} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm space-y-3 group hover:border-primary/20 transition-all duration-200">
                    <p className="text-xs font-semibold text-gray-800 leading-normal">{t.title}</p>
                    
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full border font-bold ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : 'No date'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <div className="w-5 h-5 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-[9px]">
                          {t.assignee ? t.assignee.name.charAt(0) : 'U'}
                        </div>
                        <span className="truncate max-w-[80px]">{t.assignee ? t.assignee.name : 'Unassigned'}</span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className="bg-gray-100 border border-gray-200 rounded p-0.5 text-[9px] text-gray-600 font-semibold focus:outline-none"
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">Doing</option>
                          <option value="review">Review</option>
                          <option value="completed">Done</option>
                        </select>
                        
                        <button
                          onClick={() => handleDeleteTask(t._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {!colTasks.length && (
                  <div className="text-center py-8 text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Create New Deliverable</h3>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Task Title</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Priority</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Due Date</label>
                  <input
                    type="date"
                    className="input text-xs"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group hidden">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assignee</label>
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
                <button
                  type="submit"
                  className="btn-primary h-8 text-xs px-4"
                >
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
