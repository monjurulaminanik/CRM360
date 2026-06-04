import { useQuery, useMutation } from 'react-query';
import { Calendar, DollarSign, Target, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import projectService from '../../../services/projectService';

export default function PlanningPhase({ projectId, project, onUpdate }) {
  const { data: budgetData } = useQuery(['budget', projectId], () => projectService.getBudget(projectId));
  const { data: scheduleData, refetch: refetchSchedule } = useQuery(['schedule', projectId], () => projectService.getSchedule(projectId));
  const { data: milestonesData } = useQuery(['milestones', projectId], () => projectService.getMilestones(projectId));

  const budget = budgetData?.data;
  const schedule = scheduleData?.data;
  const milestones = milestonesData?.data || [];

  const baselineMutation = useMutation(
    () => projectService.lockBaseline(projectId),
    {
      onSuccess: () => {
        toast.success('Schedule Baseline Locked');
        refetchSchedule();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to lock baseline')
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Planning Phase
          </h2>
          <p className="text-sm text-gray-500 mt-1">Define the budget, schedule baseline, and key milestones.</p>
        </div>
        <div>
          <button 
            onClick={() => baselineMutation.mutate()}
            disabled={schedule?.baselineLocked || baselineMutation.isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              schedule?.baselineLocked 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> 
            {schedule?.baselineLocked ? 'Baseline Locked' : 'Lock Schedule Baseline'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Budget Baseline</h3>
          </div>
          
          <dl className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <dt className="text-xs font-semibold text-gray-500 uppercase">Total Budget (BAC)</dt>
              <dd className="mt-1 text-xl font-bold text-gray-900">৳{(budget?.totalBudget || 0).toLocaleString()}</dd>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <dt className="text-xs font-semibold text-gray-500 uppercase">Contingency Reserve</dt>
              <dd className="mt-1 text-xl font-bold text-gray-900">৳{(budget?.contingencyReserve || 0).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Key Milestones</h3>
          </div>

          <div className="space-y-3">
            {milestones.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No milestones defined yet.</p>
            ) : (
              milestones.map(m => (
                <div key={m._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{new Date(m.targetDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                    m.status === 'achieved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
