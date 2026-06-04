import { useQuery } from 'react-query';
import { CheckSquare, MoreHorizontal } from 'lucide-react';
import projectService from '../../../services/projectService';

export default function ExecutionPhase({ projectId, project, onUpdate }) {
  const { data: tasksData, isLoading } = useQuery(
    ['tasks', projectId],
    () => projectService.getTasks(projectId)
  );

  const tasks = tasksData?.data || [];
  
  const columns = ['todo', 'in-progress', 'review', 'done'];

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading tasks...</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            Execution Phase
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage tasks, assignments, and execution progress via Kanban.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col} className="w-80 flex-shrink-0 flex flex-col bg-gray-100 rounded-xl p-3 border border-gray-200">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{col.replace('-', ' ')}</h3>
              <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === col).length}
              </span>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
              {tasks.filter(t => t.status === col).map(task => (
                <div key={task._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                      {task.taskCode}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-2">
                    {task.name}
                  </h4>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {task.progressPercent > 0 && <span>{task.progressPercent}%</span>}
                    </div>
                    {task.assignedTo && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold" title={task.assignedTo.name}>
                        {task.assignedTo.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
