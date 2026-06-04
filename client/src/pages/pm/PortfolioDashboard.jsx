import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, Plus, AlertCircle, CheckCircle, 
  Clock, DollarSign, Activity, ChevronRight
} from 'lucide-react';
import projectService from '../../services/projectService';
import CreateProjectModal from './components/CreateProjectModal';

export default function PortfolioDashboard() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', phase: '', rag: '' });

  // Fetch cross-project dashboard stats
  const { data: dashboardData, isLoading: isStatsLoading } = useQuery(
    'portfolio-dashboard',
    projectService.getPortfolioDashboard
  );

  // Fetch actual projects list
  const { data: projectsData, isLoading: isProjectsLoading, refetch } = useQuery(
    ['projects', filters],
    () => projectService.getProjects(filters)
  );

  const stats = dashboardData?.data || {};
  const projects = projectsData?.data || [];

  const getRagColor = (status) => {
    switch(status) {
      case 'red': return 'bg-red-500';
      case 'amber': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-primary" />
            Project Portfolio
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all active projects, health statuses, and financials.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Projects</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProjects || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">At Risk</p>
            <p className="text-2xl font-bold text-gray-900">{stats.atRiskCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold text-gray-900">৳{(stats.totalBudget || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Actual Spent</p>
            <p className="text-2xl font-bold text-gray-900">৳{(stats.totalSpent || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">All Projects</h2>
          <div className="flex gap-2">
            <select 
              value={filters.phase} 
              onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
              className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Phases</option>
              <option value="initiation">Initiation</option>
              <option value="planning">Planning</option>
              <option value="execution">Execution</option>
              <option value="monitoring">Monitoring & Control</option>
              <option value="closure">Closure</option>
            </select>
            <select 
              value={filters.rag} 
              onChange={(e) => setFilters({ ...filters, rag: e.target.value })}
              className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Health</option>
              <option value="green">On Track</option>
              <option value="amber">At Risk</option>
              <option value="red">Critical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Phase</th>
                <th className="px-6 py-3">Progress</th>
                <th className="px-6 py-3">Health</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isProjectsLoading ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Loading projects...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No projects found.</td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.projectCode} • {p.projectType}</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.client?.company || p.client?.name || 'Internal'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {p.currentPhase}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${p.progressPercent || 0}%` }}></div>
                        </div>
                        <span className="text-xs">{p.progressPercent || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getRagColor(p.ragStatus)}`}></span>
                        <span className="capitalize">{p.ragStatus || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/projects/${p._id}`)}
                        className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 justify-end w-full"
                      >
                        Workspace <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
