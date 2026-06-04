import { useQuery, useMutation } from 'react-query';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import projectService from '../../../services/projectService';

export default function InitiationPhase({ projectId, project, onUpdate }) {
  const { data: charterData, isLoading, refetch } = useQuery(
    ['charter', projectId],
    () => projectService.getCharter(projectId)
  );

  const charter = charterData?.data;

  const submitMutation = useMutation(
    () => projectService.submitCharterForApproval(projectId),
    {
      onSuccess: () => {
        toast.success('Charter submitted for approval');
        refetch();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit')
    }
  );

  const approveMutation = useMutation(
    () => projectService.approveCharter(projectId, { notes: 'Approved via UI' }),
    {
      onSuccess: () => {
        toast.success('Charter approved successfully!');
        refetch();
        onUpdate(); // update project workspace phase
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve')
    }
  );

  if (isLoading) return <div className="text-gray-500 text-center py-12">Loading charter...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Project Charter
          </h2>
          <p className="text-sm text-gray-500 mt-1">Formal authorization and high-level scope for the project.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => projectService.downloadCharterPDF(projectId)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          
          {charter?.status === 'draft' && (
            <button 
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Submit for Approval
            </button>
          )}

          {charter?.status === 'submitted' && (
            <button 
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Approve Charter
            </button>
          )}

          {charter?.status === 'approved' && (
            <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Approved
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Business Case</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {charter?.businessCase || 'No business case provided.'}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Project Scope</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {charter?.scope || 'No scope defined.'}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Success Criteria</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              {charter?.successCriteria?.length > 0 ? (
                charter.successCriteria.map((c, i) => <li key={i}>{c}</li>)
              ) : (
                <li>No success criteria defined.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">High-Level Constraints</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Estimated Budget</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900">৳{(project?.estimatedBudget || 0).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Target End Date</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {project?.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'TBD'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
