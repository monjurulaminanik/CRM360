import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { FileText, Download, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import projectService from '../../../services/projectService';

export default function InitiationPhase({ projectId, project, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessCaseProblem: '',
    inScope: '',
    successCriteria: ''
  });

  const { data: charterData, isLoading, refetch } = useQuery(
    ['charter', projectId],
    () => projectService.getCharter(projectId)
  );

  const charter = charterData?.data;

  useEffect(() => {
    if (charter) {
      setFormData({
        businessCaseProblem: charter.businessCase?.problem || typeof charter.businessCase === 'string' ? charter.businessCase : '',
        inScope: charter.inScope ? charter.inScope.join('\n') : '',
        successCriteria: charter.objectives ? charter.objectives.map(o => o.description).join('\n') : ''
      });
    }
  }, [charter]);

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

  const updateMutation = useMutation(
    (data) => projectService.updateCharter(projectId, data),
    {
      onSuccess: () => {
        toast.success('Charter updated successfully!');
        setIsEditing(false);
        refetch();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update')
    }
  );

  const handleSave = () => {
    updateMutation.mutate({
      businessCase: { problem: formData.businessCaseProblem },
      inScope: formData.inScope.split('\n').filter(Boolean),
      objectives: formData.successCriteria.split('\n').filter(Boolean).map(desc => ({ description: desc }))
    });
  };

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
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={updateMutation.isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>

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
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Business Case</h3>
            {isEditing ? (
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                rows="4"
                value={formData.businessCaseProblem}
                onChange={(e) => setFormData({...formData, businessCaseProblem: e.target.value})}
                placeholder="Enter the business problem or case..."
              />
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {charter?.businessCase?.problem || (typeof charter?.businessCase === 'string' ? charter.businessCase : 'No business case provided.')}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Project Scope</h3>
            {isEditing ? (
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                rows="4"
                value={formData.inScope}
                onChange={(e) => setFormData({...formData, inScope: e.target.value})}
                placeholder="Enter scope items (one per line)..."
              />
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {charter?.inScope?.length > 0 ? (
                  charter.inScope.map((c, i) => <li key={i}>{c}</li>)
                ) : (
                  <li>No scope defined.</li>
                )}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Success Criteria (Objectives)</h3>
            {isEditing ? (
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                rows="4"
                value={formData.successCriteria}
                onChange={(e) => setFormData({...formData, successCriteria: e.target.value})}
                placeholder="Enter success criteria (one per line)..."
              />
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {charter?.objectives?.length > 0 ? (
                  charter.objectives.map((o, i) => <li key={i}>{o.description}</li>)
                ) : (
                  <li>No success criteria defined.</li>
                )}
              </ul>
            )}
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

