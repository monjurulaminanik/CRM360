import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Clock, User, Flag, Filter } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import toast from 'react-hot-toast';

const SAMPLE_TASKS = [
  { id: 1, text: 'Submit monthly performance report',  due: '2026-05-16', assignee: 'Anik', priority: 'high',   done: false, tag: 'Reporting' },
  { id: 2, text: 'Review and approve creative assets',  due: '2026-05-18', assignee: 'Anik', priority: 'medium', done: false, tag: 'Creative' },
  { id: 3, text: 'Schedule quarterly strategy call',   due: '2026-05-20', assignee: 'Anik', priority: 'medium', done: false, tag: 'Strategy' },
  { id: 4, text: 'Set up Google Analytics 4 goals',    due: '2026-05-22', assignee: 'Anik', priority: 'low',    done: false, tag: 'Technical' },
  { id: 5, text: 'Send onboarding welcome package',    due: '2026-04-01', assignee: 'Anik', priority: 'high',   done: true,  tag: 'Onboarding' },
  { id: 6, text: 'Conduct initial SEO audit',          due: '2026-04-10', assignee: 'Anik', priority: 'high',   done: true,  tag: 'SEO' },
];

const PRIORITY_CFG = {
  high:   { label: 'High',   cls: 'text-danger',  dot: 'bg-danger' },
  medium: { label: 'Medium', cls: 'text-warning', dot: 'bg-warning' },
  low:    { label: 'Low',    cls: 'text-gray-400',dot: 'bg-gray-300' },
};

function dueLabel(date, done) {
  if (!date) return null;
  const d = new Date(date);
  if (done)     return <span className="text-[10px] text-gray-400">{format(d, 'MMM d')}</span>;
  if (isPast(d) && !isToday(d)) return <span className="text-[10px] font-semibold text-danger">Overdue · {format(d, 'MMM d')}</span>;
  if (isToday(d)) return <span className="text-[10px] font-semibold text-warning">Due Today</span>;
  return <span className="text-[10px] text-gray-400">{format(d, 'MMM d')}</span>;
}

export default function TasksTab({ client }) {
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [newText, setNewText] = useState('');
  const [filter, setFilter] = useState('open');

  const toggle = (id) => setTasks((t) => t.map((task) => task.id === id ? { ...task, done: !task.done } : task));

  const addTask = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setTasks((t) => [...t, { id: Date.now(), text: newText.trim(), due: null, assignee: 'Me', priority: 'medium', done: false, tag: 'General' }]);
    setNewText('');
  };

  const filtered = tasks.filter((t) => filter === 'all' ? true : filter === 'open' ? !t.done : t.done);

  return (
    <div className="space-y-4">
      {/* Add task */}
      <form onSubmit={addTask} className="flex gap-2">
        <input className="input flex-1 text-sm" placeholder="Add a task for this client..." value={newText} onChange={(e) => setNewText(e.target.value)} />
        <Button type="submit" variant="primary" size="sm"><Plus size={14} /> Add Task</Button>
      </form>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[['open','Open'],['done','Completed'],['all','All']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === k ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:text-dark'}`}>
              {l}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => {
          const p = PRIORITY_CFG[task.priority];
          return (
            <div key={task.id} onClick={() => toggle(task.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/30 ${task.done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:bg-primary-light/10'}`}>
              {task.done
                ? <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                : <Circle size={16} className="text-gray-300 shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-dark font-medium'}`}>{task.text}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {task.tag && <span className="text-[10px] bg-primary-light text-primary px-1.5 py-0.5 rounded-full font-medium">{task.tag}</span>}
                  <div className="flex items-center gap-1 text-[10px] text-gray-400"><User size={10} />{task.assignee}</div>
                  {dueLabel(task.due, task.done)}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <CheckCircle2 size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{filter === 'done' ? 'No completed tasks yet' : 'All caught up!'}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center pt-1">Sample tasks — persistent task tracking coming soon.</p>
    </div>
  );
}
