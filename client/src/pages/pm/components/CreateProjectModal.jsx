import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import projectService from '../../../services/projectService';
import api from '../../../services/api';

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    projectType: 'web-design',
    client: '',
    description: '',
  });

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery('clients-list', async () => {
    const res = await api.get('/clients');
    return res.data;
  });

  const createMutation = useMutation(
    (data) => projectService.createProject(data),
    {
      onSuccess: () => {
        toast.success('Project created successfully!');
        setFormData({ name: '', projectType: 'web-design', client: '', description: '' });
        onSuccess();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to create project');
      }
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. Acme Corp Website Redesign"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
            <select
              required
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="web-design">Web Design & Dev</option>
              <option value="seo">SEO Campaign</option>
              <option value="marketing">Social Media Marketing</option>
              <option value="mobile-app">Mobile App</option>
              <option value="branding">Branding</option>
              <option value="whatsapp-automation">WhatsApp Automation</option>
              <option value="hybrid">Hybrid (Marketing + Tech)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">-- Internal Project --</option>
              {clientsData?.data?.map(c => (
                <option key={c._id} value={c._id}>{c.company || c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Briefly describe the project goals..."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
