import { useQuery, useMutation } from 'react-query';
import { Award, FileCheck, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import projectService from '../../../services/projectService';

export default function ClosurePhase({ projectId, project, onUpdate }) {
  const { data: closureData, refetch } = useQuery(['closure', projectId], () => projectService.getClosure(projectId));
  const closure = closureData?.data || {};

  const initiateMutation = useMutation(
    () => projectService.initiateClosure(projectId, { closureType: 'successful' }),
    {
      onSuccess: () => {
        toast.success('Closure initiated');
        refetch();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to initiate')
    }
  );

  const finalizeMutation = useMutation(
    () => projectService.finalizeClosure(projectId),
    {
      onSuccess: () => {
        toast.success('Project finalized successfully!');
        refetch();
        onUpdate();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to finalize')
    }
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Project Closure</h2>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          Finalize financials, obtain sign-off, capture lessons learned, and formally close the project.
        </p>
      </div>

      {!closure.closureType ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Close?</h3>
          <p className="text-sm text-gray-500 mb-6">Initiating closure will freeze new task creation and generate the final financial variance report.</p>
          <button 
            onClick={() => initiateMutation.mutate()}
            disabled={initiateMutation.isLoading}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Initiate Closure Phase
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase">Final Budget</p>
                <p className="text-xl font-bold text-gray-900 mt-1">৳{(closure.financialClosure?.finalBudget || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase">Final Spent</p>
                <p className="text-xl font-bold text-gray-900 mt-1">৳{(closure.financialClosure?.finalSpent || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase">Variance</p>
                <p className={`text-xl font-bold mt-1 ${(closure.financialClosure?.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ৳{(closure.financialClosure?.variance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => projectService.downloadClosureReportPDF(projectId)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Preview Final Report PDF
            </button>
            <button 
              onClick={() => finalizeMutation.mutate()}
              disabled={project.overallStatus === 'completed' || finalizeMutation.isLoading}
              className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                project.overallStatus === 'completed' 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              {project.overallStatus === 'completed' ? 'Project Completed' : 'Finalize & Close Project'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
