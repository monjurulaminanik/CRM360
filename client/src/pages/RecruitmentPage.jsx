import { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Users, Trash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJobs, createJob, deleteJob } from '../services/recruitmentService';

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('full_time');
  const [newLocation, setNewLocation] = useState('');

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await getJobs();
      if (res.success) setJobs(res.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    try {
      const newJob = {
        title: newTitle,
        type: newType,
        location: newLocation,
        status: 'open',
      };
      
      const res = await createJob(newJob);
      if (res.success) {
        setJobs([res.data, ...jobs]);
        setNewTitle('');
        setNewLocation('');
        setShowAddModal(false);
        toast.success('Job posted successfully!');
      }
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      const res = await deleteJob(id);
      if (res.success) {
        setJobs(jobs.filter(j => j._id !== id));
        toast.success('Job deleted');
      }
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(j => 
    (j.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'all' || j.status === filterStatus)
  );

  return (
    <div className="page-container animate-fade-in font-sans">
      
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Recruitment & Jobs
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage job postings and track candidate pipelines.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-1.5 text-xs"
        >
          <Plus className="h-4 w-4" /> Post Job
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            className="input pl-9 text-xs"
            placeholder="Search job titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input sm:w-40 text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div key={job._id} className="card hover:border-primary/20 transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{job.type.replace('_', ' ').toUpperCase()} • {job.location || 'Remote'}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${job.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                {job.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-primary transition-colors text-xs font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> View Candidates
                </button>
              </div>
              <button onClick={() => handleDeleteJob(job._id)} className="text-gray-400 hover:text-red-500">
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!filteredJobs.length && (
          <div className="col-span-3 text-center py-12 text-gray-400 font-medium">
            No jobs found. Create one to get started.
          </div>
        )}
      </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Post New Job</h3>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Job Title</label>
                <input
                  required
                  className="input text-xs"
                  placeholder="e.g. Senior Backend Developer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Type</label>
                  <select
                    className="input text-xs"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Location</label>
                  <input
                    className="input text-xs"
                    placeholder="e.g. Remote, Dhaka"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
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
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
