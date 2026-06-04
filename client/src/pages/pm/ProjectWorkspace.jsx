import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, Settings, 
  FileText, Calendar, CheckSquare, Activity, Award
} from 'lucide-react';
import projectService from '../../services/projectService';

// Phase Components
import InitiationPhase from './phases/InitiationPhase';
import PlanningPhase from './phases/PlanningPhase';
import ExecutionPhase from './phases/ExecutionPhase';
import MonitoringPhase from './phases/MonitoringPhase';
import ClosurePhase from './phases/ClosurePhase';

const PHASES = [
  { id: 'initiation', label: 'Initiation', icon: FileText },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'execution', label: 'Execution', icon: CheckSquare },
  { id: 'monitoring', label: 'Monitoring & Control', icon: Activity },
  { id: 'closure', label: 'Closure', icon: Award },
];

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('initiation');

  const { data: projectData, isLoading, refetch } = useQuery(
    ['project', id],
    () => projectService.getProject(id)
  );

  const project = projectData?.data;

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading project workspace...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Project not found.</div>;

  // Determine current phase index for the stepper
  const currentPhaseIndex = PHASES.findIndex(p => p.id === project.currentPhase);
  
  const getRagColor = (status) => {
    switch(status) {
      case 'red': return 'bg-red-500';
      case 'amber': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Workspace Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate('/projects')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold font-mono border border-gray-200">
                {project.projectCode}
              </span>
              <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${getRagColor(project.ragStatus)}`}></div>
                <span className="text-xs font-medium text-gray-700 capitalize">{project.ragStatus}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Client: {project.client?.company || project.client?.name || 'Internal'} • Type: {project.projectType}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium mb-1">Overall Progress</p>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${project.progressPercent || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-700">{project.progressPercent || 0}%</span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phase Stepper */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          <div className="relative z-10 flex justify-between">
            {PHASES.map((phase, idx) => {
              const isCompleted = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;
              const isPending = idx > currentPhaseIndex;

              return (
                <div key={phase.id} className="flex flex-col items-center bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isCurrent ? 'bg-primary border-primary text-white ring-4 ring-primary/20' :
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{idx + 1}</span>}
                  </div>
                  <span className={`mt-2 text-xs font-semibold ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {phase.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-6 flex-shrink-0">
        {PHASES.map(phase => {
          const isActive = activeTab === phase.id;
          return (
            <button
              key={phase.id}
              onClick={() => setActiveTab(phase.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                isActive 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <phase.icon className="w-4 h-4" />
              {phase.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === 'initiation' && <InitiationPhase projectId={id} project={project} onUpdate={refetch} />}
          {activeTab === 'planning' && <PlanningPhase projectId={id} project={project} onUpdate={refetch} />}
          {activeTab === 'execution' && <ExecutionPhase projectId={id} project={project} onUpdate={refetch} />}
          {activeTab === 'monitoring' && <MonitoringPhase projectId={id} project={project} onUpdate={refetch} />}
          {activeTab === 'closure' && <ClosurePhase projectId={id} project={project} onUpdate={refetch} />}
        </div>
      </div>
    </div>
  );
}
