import { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Search, Clock, Trash, Loader2, CheckCircle2, 
  Layers, List, Calendar, HelpCircle, DollarSign, Users, Timer, 
  ArrowUpRight, Edit2, Play, CheckSquare, Sparkles, ChevronRight, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProjects, getProject, createProject, updateProject, deleteProject, logTime, getAllTimeLogs } from '../services/projectService';
import { clientService } from '../services/clientService';
import { useLanguageStore } from '../store/languageStore';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [allTimeLogs, setAllTimeLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguageStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'board' | 'timeline' | 'timeLedger'
  
  // Drawer / details state
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newBudget, setNewBudget] = useState(50000);
  const [newDeadline, setNewDeadline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeliverables, setNewDeliverables] = useState([
    'Mockup design approved by client',
    'Database schema & APIs built',
    'Frontend dashboard pages complete',
    'Final QA Testing & deployment'
  ]);

  // Logging time state
  const [logHours, setLogHours] = useState('');
  const [logComment, setLogComment] = useState('');

  // New custom deliverable in drawer
  const [customDeliverable, setCustomDeliverable] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projRes, cliRes, logsRes] = await Promise.all([
        getProjects(),
        clientService.getAll(),
        getAllTimeLogs()
      ]);
      if (projRes.success) setProjects(projRes.data);
      if (cliRes.success) setClients(cliRes.data);
      if (logsRes.success) setAllTimeLogs(logsRes.data);
    } catch (error) {
      toast.error('Failed to fetch workspace project data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch full project details (including time logs & deliverables) when selecting
  const fetchProjectDetails = async (id) => {
    try {
      setIsDrawerLoading(true);
      const res = await getProject(id);
      if (res.success) {
        setSelectedProject(res.data);
      }
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setIsDrawerLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newClientId) return;
    
    try {
      // Map initial deliverables to objects with completed state
      const initialDeliverables = newDeliverables
        .filter(d => d.trim() !== '')
        .map(title => ({ title, completed: false }));

      const newProj = {
        name: newName,
        clientId: newClientId,
        status: 'not_started',
        budget: Number(newBudget) || 0,
        deadline: newDeadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], // 30 days default
        description: newDescription,
        deliverables: initialDeliverables
      };
      
      const res = await createProject(newProj);
      if (res.success) {
        setProjects([res.data, ...projects]);
        setNewName('');
        setNewClientId('');
        setNewDescription('');
        setNewBudget(50000);
        setNewDeadline('');
        setShowAddModal(false);
        toast.success('ClickUp-style Workspace Project created! 🚀');
      }
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await updateProject(id, { status: nextStatus });
      if (res.success) {
        setProjects(projects.map(p => p._id === id ? res.data : p));
        if (selectedProject && selectedProject._id === id) {
          setSelectedProject({ ...selectedProject, status: nextStatus });
        }
        toast.success(`Project moved to ${nextStatus.toUpperCase().replace('_', ' ')}!`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Toggle checklist deliverable milestone
  const handleToggleDeliverable = async (idx) => {
    if (!selectedProject) return;
    
    const updated = [...(selectedProject.deliverables || [])];
    updated[idx].completed = !updated[idx].completed;
    
    try {
      const res = await updateProject(selectedProject._id, { deliverables: updated });
      if (res.success) {
        setSelectedProject({ ...selectedProject, deliverables: updated });
        setProjects(projects.map(p => p._id === selectedProject._id ? { ...p, deliverables: updated } : p));
        toast.success('Workspace milestone updated!');
      }
    } catch (err) {
      toast.error('Failed to update milestones');
    }
  };

  // Add custom deliverable/milestone inside drawer
  const handleAddDeliverable = async (e) => {
    e.preventDefault();
    if (!selectedProject || !customDeliverable.trim()) return;

    const updated = [...(selectedProject.deliverables || []), { title: customDeliverable, completed: false }];

    try {
      const res = await updateProject(selectedProject._id, { deliverables: updated });
      if (res.success) {
        setSelectedProject({ ...selectedProject, deliverables: updated });
        setProjects(projects.map(p => p._id === selectedProject._id ? { ...p, deliverables: updated } : p));
        setCustomDeliverable('');
        toast.success('Custom deliverable added successfully!');
      }
    } catch (err) {
      toast.error('Failed to add deliverable');
    }
  };

  // Log working hours
  const handleLogTime = async (e) => {
    e.preventDefault();
    if (!selectedProject || !logHours || Number(logHours) <= 0) return;

    try {
      const payload = {
        hours: Number(logHours),
        description: logComment || 'Logged working time retainer',
        logDate: new Date().toISOString()
      };

      const res = await logTime(selectedProject._id, payload);
      if (res.success) {
        // Append new time log
        const updatedTimeLogs = [res.data, ...(selectedProject.timeLogs || [])];
        setSelectedProject({ ...selectedProject, timeLogs: updatedTimeLogs });
        
        // Append to global time logs state
        setAllTimeLogs([res.data, ...allTimeLogs]);
        
        setLogHours('');
        setLogComment('');
        toast.success(`Logged ${payload.hours} hours successfully! ⏱️`);
      }
    } catch (err) {
      toast.error('Failed to log time');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to archive and delete this ClickUp project? Time logs will be completely wiped.')) return;
    
    try {
      const res = await deleteProject(id);
      if (res.success) {
        setProjects(projects.filter(p => p._id !== id));
        if (selectedProjectId === id) setSelectedProjectId(null);
        toast.success('Project deleted completely');
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  // Calculate dynamic KPIs in real-time
  const getWorkspaceStats = () => {
    let totalBudgets = 0;
    let completedCount = 0;
    let totalDeliverables = 0;
    let completedDeliverables = 0;
    
    projects.forEach(p => {
      totalBudgets += Number(p.budget || 0);
      if (p.status === 'completed') completedCount++;
      
      const list = p.deliverables || [];
      totalDeliverables += list.length;
      completedDeliverables += list.filter(d => d.completed).length;
    });

    const completionRate = totalDeliverables > 0 
      ? Math.round((completedDeliverables / totalDeliverables) * 100) 
      : 0;

    return {
      activeCount: projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length,
      completedCount,
      totalBudgets,
      completionRate
    };
  };

  const workspaceStats = getWorkspaceStats();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-150/40';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-150/40';
      case 'on_hold': return 'bg-amber-50 text-amber-600 border-amber-150/40';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-150/40';
      default: return 'bg-slate-50 text-slate-600 border-slate-200/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return language === 'bn' ? 'সম্পন্ন' : 'Completed';
      case 'in_progress': return language === 'bn' ? 'চলমান' : 'In Progress';
      case 'on_hold': return language === 'bn' ? 'স্থগিত' : 'On Hold';
      case 'cancelled': return language === 'bn' ? 'বাতিল' : 'Cancelled';
      default: return language === 'bn' ? 'শুরু হয়নি' : 'Not Started';
    }
  };

  const filteredProjects = projects.filter(p => 
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
     (p.clientId?.name || '').toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'all' || p.status === filterStatus)
  );

  return (
    <div className="page-container animate-fade-in font-sans space-y-6">
      
      {/* ══ Header ══════════════════════════════════════════════════════════ */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" /> 
            {language === 'bn' ? 'প্রজেক্ট ওয়ার্কস্পেস' : 'ClickUp Workspace Cockpit'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {language === 'bn' 
              ? 'ডেলিভারেবল ট্র্যাক করুন, কাজের মাইলস্টোন পরিচালনা করুন এবং টিম সদস্য বরাদ্দ করুন।' 
              : 'Track active deliverables, manage team members, map milestones, and log working hours.'}
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-1.5 text-xs h-10 px-5 shadow-sm shadow-primary/10"
        >
          <Plus className="h-4.5 w-4.5" /> 
          {language === 'bn' ? 'নতুন প্রজেক্ট তৈরি' : 'New ClickUp Project'}
        </button>
      </div>

      {/* ══ ClickUp KPI Performance Cards ═══════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <div className="card flex items-center justify-between p-5 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              {language === 'bn' ? 'চলমান প্রজেক্ট' : 'Active Projects'}
            </span>
            <h3 className="text-2xl font-extrabold text-primary mt-1">{workspaceStats.activeCount}</h3>
            <p className="text-[9px] text-gray-400 mt-1">🚀 Standard team sprints</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-5 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              {language === 'bn' ? 'সম্পন্ন প্রজেক্ট' : 'Completed Projects'}
            </span>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{workspaceStats.completedCount}</h3>
            <p className="text-[9px] text-emerald-500 mt-1">✓ Standard client delivery</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-5 bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              {language === 'bn' ? 'মোট বাজেট' : 'Cumulative Budgets'}
            </span>
            <h3 className="text-2xl font-extrabold text-orange-600 mt-1">৳{workspaceStats.totalBudgets.toLocaleString()}</h3>
            <p className="text-[9px] text-orange-500 mt-1">💰 Active workspace capitalization</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-5 bg-gradient-to-br from-violet-500/5 to-transparent border border-violet-500/10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              {language === 'bn' ? 'মাইলস্টোন সম্পন্ন হার' : 'Milestones Complete'}
            </span>
            <h3 className="text-2xl font-extrabold text-violet-600 mt-1">{workspaceStats.completionRate}%</h3>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-violet-600 h-full rounded-full" style={{ width: `${workspaceStats.completionRate}%` }} />
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
            <Timer className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* ══ ClickUp Navigation Tabs & Filters ═══════════════════════════════ */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
        
        {/* Tab selection buttons */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl self-stretch lg:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'list' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <List className="h-3.5 w-3.5" /> 
            {language === 'bn' ? 'তালিকা ভিউ' : 'List View'}
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'board' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" /> 
            {language === 'bn' ? 'বোর্ড ভিউ' : 'Board View'}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'timeline' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> 
            {language === 'bn' ? 'টাইমলাইন ভিউ' : 'Gantt Timeline'}
          </button>
          <button
            onClick={() => setActiveTab('timeLedger')}
            className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'timeLedger' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> 
            {language === 'bn' ? 'টাইমশিট লেজার' : 'Timesheets'}
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="input pl-9 text-xs h-9 w-full rounded-xl"
              placeholder={
                activeTab === 'timeLedger' 
                  ? (language === 'bn' ? 'টাইমশিট বা কাজের বিবরণ...' : 'Search logs, tasks...')
                  : (language === 'bn' ? 'প্রজেক্ট খুঁজুন...' : 'Search projects...')
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {activeTab !== 'timeLedger' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input text-xs h-9 w-full sm:w-32 rounded-xl focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">{language === 'bn' ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="not_started">{language === 'bn' ? 'শুরু হয়নি' : 'Not Started'}</option>
              <option value="in_progress">{language === 'bn' ? 'চলমান' : 'In Progress'}</option>
              <option value="on_hold">{language === 'bn' ? 'স্থগিত' : 'On Hold'}</option>
              <option value="completed">{language === 'bn' ? 'সম্পন্ন' : 'Completed'}</option>
              <option value="cancelled">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</option>
            </select>
          )}
        </div>
      </div>

      {/* ══ Tab View Content ═══════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* 1. List View Tab */}
          {activeTab === 'list' && (
            <div className="card p-0 overflow-hidden border border-slate-100 shadow-2xs rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 text-slate-400 border-b border-slate-100 font-bold uppercase tracking-wider text-[9px]">
                      <th className="p-4 w-60">{language === 'bn' ? 'প্রজেক্ট বিবরণ' : 'Project Details'}</th>
                      <th className="p-4">{language === 'bn' ? 'ক্লায়েন্ট' : 'Client'}</th>
                      <th className="p-4 w-44">{language === 'bn' ? 'মাইলস্টোন ডেলিভারেবল' : 'Milestones Progress'}</th>
                      <th className="p-4 text-center">{language === 'bn' ? 'বাজেট' : 'Budget'}</th>
                      <th className="p-4">{language === 'bn' ? 'ডেডলাইন' : 'Deadline'}</th>
                      <th className="p-4 text-center">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="p-4 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70">
                    {filteredProjects.map((proj) => {
                      const deliverables = proj.deliverables || [];
                      const completedCount = deliverables.filter(d => d.completed).length;
                      const pct = deliverables.length > 0 ? Math.round((completedCount / deliverables.length) * 100) : 0;
                      
                      const isOverdue = proj.deadline && new Date(proj.deadline) < new Date() && proj.status !== 'completed';

                      return (
                        <tr key={proj._id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                          {/* Project Info */}
                          <td className="p-4 min-w-[200px]">
                            <div className="font-extrabold text-slate-800 text-sm group-hover:text-primary transition-colors cursor-pointer"
                                 onClick={() => setSelectedProjectId(proj._id)}>
                              {proj.name}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                              {proj.description || 'No description provided.'}
                            </p>
                          </td>

                          {/* Client */}
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{proj.clientId?.name || 'Unknown Client'}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5">{proj.clientId?.company || 'Personal Client'}</div>
                          </td>

                          {/* Milestones Progress Bar */}
                          <td className="p-4">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                              <span>{completedCount}/{deliverables.length} Milestones</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-300 ${
                                pct === 100 ? 'bg-emerald-500' : 'bg-primary'
                              }`} style={{ width: `${pct}%` }} />
                            </div>
                          </td>

                          {/* Budget */}
                          <td className="p-4 text-center font-extrabold text-slate-800 text-sm">
                            ৳{Number(proj.budget || 0).toLocaleString()}
                          </td>

                          {/* Deadline */}
                          <td className="p-4">
                            <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                              {isOverdue && <AlertCircle className="h-3 w-3 animate-bounce shrink-0" />}
                              <span>{proj.deadline ? new Date(proj.deadline).toLocaleDateString() : '—'}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyle(proj.status)}`}>
                              {getStatusLabel(proj.status)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <button 
                                onClick={() => setSelectedProjectId(proj._id)}
                                className="btn-secondary h-7 px-3 text-[10px] font-bold gap-0.5 cursor-pointer"
                              >
                                {language === 'bn' ? 'ককপিট' : 'Cockpit'} <ArrowUpRight className="h-3 w-3" />
                              </button>
                              
                              <select
                                value={proj.status}
                                onChange={(e) => handleUpdateStatus(proj._id, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-600 focus:outline-none cursor-pointer"
                              >
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              <button 
                                onClick={() => handleDeleteProject(proj._id)}
                                className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!filteredProjects.length && (
                      <tr>
                        <td colSpan="7" className="text-center p-14 text-slate-400 font-bold bg-white">
                          No projects match the current filter selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Board View (Kanban lanes with Native Drag & Drop!) */}
          {activeTab === 'board' && (
            <div className="space-y-2">
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-[10px] font-semibold text-primary flex items-center gap-2 animate-pulse">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>
                  {language === 'bn' 
                    ? 'ক্লিকআপ ওয়ার্কস্পেস লাইভ ড্র্যাগ এন্ড ড্রপ সক্রিয়! কার্ড টেনে অন্য কলামে ছেড়ে দিন।'
                    : 'ClickUp Workspace Live Drag-and-Drop Active! Drag any project card and drop it over another column lane.'}
                </span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin -mx-1 px-1">
                {['not_started', 'in_progress', 'on_hold', 'completed'].map((statusKey) => {
                  const laneProjects = filteredProjects.filter(p => p.status === statusKey);
                  
                  let laneTitle = '', laneBg = '', laneText = '', laneDot = '';
                  switch(statusKey) {
                    case 'completed':
                      laneTitle = language === 'bn' ? 'সম্পন্ন' : 'Completed';
                      laneBg = 'bg-emerald-50'; laneText = 'text-emerald-700'; laneDot = 'bg-emerald-500';
                      break;
                    case 'in_progress':
                      laneTitle = language === 'bn' ? 'চলমান' : 'In Progress';
                      laneBg = 'bg-blue-50'; laneText = 'text-blue-700'; laneDot = 'bg-blue-500';
                      break;
                    case 'on_hold':
                      laneTitle = language === 'bn' ? 'স্থগিত' : 'On Hold';
                      laneBg = 'bg-amber-50'; laneText = 'text-amber-700'; laneDot = 'bg-amber-500';
                      break;
                    default:
                      laneTitle = language === 'bn' ? 'শুরু হয়নি' : 'Not Started';
                      laneBg = 'bg-slate-50'; laneText = 'text-slate-600'; laneDot = 'bg-slate-400';
                      break;
                  }

                  return (
                    <div 
                      key={statusKey} 
                      className="flex-1 min-w-[250px] max-w-[300px] space-y-3 shrink-0"
                    >
                      {/* Column Header */}
                      <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-100 ${laneBg}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${laneDot}`} />
                          <span className={`text-xs font-extrabold ${laneText}`}>{laneTitle}</span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-150/40 text-slate-600`}>
                          {laneProjects.length}
                        </span>
                      </div>

                      {/* Drop Zone Cards Container */}
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={(e) => {
                          e.currentTarget.classList.add('bg-slate-200/50', 'border-primary/20');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-slate-200/50', 'border-primary/20');
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-slate-200/50', 'border-primary/20');
                          const id = e.dataTransfer.getData('text/plain');
                          if (id) {
                            await handleUpdateStatus(id, statusKey);
                          }
                        }}
                        className="space-y-2.5 min-h-[350px] bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/40 transition-all duration-200"
                      >
                        {laneProjects.map((p) => {
                          const deliverables = p.deliverables || [];
                          const completedCount = deliverables.filter(d => d.completed).length;
                          const pct = deliverables.length > 0 ? Math.round((completedCount / deliverables.length) * 100) : 0;
                          const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed';

                          return (
                            <div 
                              key={p._id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', p._id);
                                e.currentTarget.classList.add('opacity-45', 'scale-[0.98]');
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.classList.remove('opacity-45', 'scale-[0.98]');
                              }}
                              className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs hover:shadow-card-hover hover:border-primary/20 transition-all duration-200 group relative cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex justify-between items-start gap-1">
                                <h4 className="font-extrabold text-slate-800 text-xs mb-1 group-hover:text-primary transition-colors line-clamp-1"
                                    onClick={() => setSelectedProjectId(p._id)}>
                                  {p.name}
                                </h4>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedProjectId(p._id); }}
                                  className="text-[9px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-md lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {language === 'bn' ? 'খুলুন' : 'Cockpit'}
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed mb-3">{p.description || 'No description.'}</p>
                              
                              <div className="space-y-2">
                                {/* Progress bar */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                    <span>Milestones</span>
                                    <span>{pct}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>

                                {/* Dates & Budget */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[9px] text-slate-400">
                                  <span className={`font-semibold flex items-center gap-0.5 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                                    {isOverdue && <AlertCircle className="h-2.5 w-2.5 text-red-500 animate-pulse" />}
                                    {p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}
                                  </span>
                                  <span className="font-bold text-slate-700">৳{Number(p.budget || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {laneProjects.length === 0 && (
                          <div className="h-24 rounded-xl border border-dashed border-slate-200 bg-white/40 flex flex-col items-center justify-center select-none text-slate-300">
                            <FolderKanban className="h-5 w-5 opacity-40 mb-1" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Drag Cards Here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Gantt Timeline View Tab (Dynamic Project Chronological Map!) */}
          {activeTab === 'timeline' && (
            <div className="card p-5 border border-slate-100 shadow-2xs rounded-2xl space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {language === 'bn' ? 'প্রজেক্ট সময়সীমা (গ্যান্ট চার্ট)' : 'Workspace Sprints Gantt Timeline'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'bn' 
                    ? 'মে ২০২৬ থেকে সেপ্টেম্বর ২০২৬ পর্যন্ত প্রজেক্ট সময়সীমা ও ডেলিভারেবল রোডম্যাপ।' 
                    : 'Visual breakdown of sprints, target limits, and milestone lengths across 2026.'}
                </p>
              </div>

              {/* Gantt Timeline Container Grid */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                
                {/* Months Headers (May 2026 - Sep 2026) */}
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-150/60 text-[10px] font-bold text-slate-500 py-3 text-center uppercase tracking-widest">
                  <div className="col-span-3 border-r border-slate-150/40 text-left pl-4">
                    {language === 'bn' ? 'প্রজেক্ট তালিকা' : 'Active Projects'}
                  </div>
                  <div className="col-span-2 border-r border-slate-150/20">{language === 'bn' ? 'মে' : 'May'}</div>
                  <div className="col-span-2 border-r border-slate-150/20">{language === 'bn' ? 'জুন' : 'Jun'}</div>
                  <div className="col-span-2 border-r border-slate-150/20">{language === 'bn' ? 'জুলাই' : 'Jul'}</div>
                  <div className="col-span-2 border-r border-slate-150/20">{language === 'bn' ? 'আগস্ট' : 'Aug'}</div>
                  <div className="col-span-1">{language === 'bn' ? 'সেপ্টেম্বর' : 'Sep'}</div>
                </div>

                {/* Rows wrapper */}
                <div className="divide-y divide-slate-100">
                  {filteredProjects.map((p) => {
                    const deliverables = p.deliverables || [];
                    const completedCount = deliverables.filter(d => d.completed).length;
                    const pct = deliverables.length > 0 ? Math.round((completedCount / deliverables.length) * 100) : 0;
                    
                    // Chronological Math: Start date from createdAt, deadline from deadline.
                    // Range: May 1 2026 to Sep 30 2026 (153 days)
                    const rangeStart = new Date('2026-05-01').getTime();
                    const rangeEnd = new Date('2026-09-30').getTime();
                    const totalMs = rangeEnd - rangeStart;

                    const pStart = p.startDate ? new Date(p.startDate).getTime() : new Date(p.createdAt).getTime();
                    const pEnd = p.deadline ? new Date(p.deadline).getTime() : pStart + 30 * 86400000;

                    const offsetPct = Math.max(0, Math.min(100, ((pStart - rangeStart) / totalMs) * 100));
                    const widthPct = Math.max(10, Math.min(100 - offsetPct, ((pEnd - pStart) / totalMs) * 100));

                    const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed';

                    let barColor = 'from-primary to-primary/80';
                    if (p.status === 'completed') barColor = 'from-emerald-500 to-emerald-400';
                    else if (p.status === 'on_hold') barColor = 'from-amber-500 to-amber-400';
                    else if (p.status === 'cancelled') barColor = 'from-red-500 to-red-400';

                    return (
                      <div key={p._id} className="grid grid-cols-12 items-center hover:bg-slate-50/30 transition-colors py-3.5 relative group">
                        
                        {/* Name and Client sidebar */}
                        <div className="col-span-3 border-r border-slate-100 pl-4 pr-2 z-10">
                          <div 
                            className="font-extrabold text-slate-800 text-xs truncate hover:text-primary cursor-pointer flex items-center gap-1.5"
                            onClick={() => setSelectedProjectId(p._id)}
                          >
                            {p.name}
                            {isOverdue && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" title="Overdue Sprint!" />
                            )}
                          </div>
                          <div className="text-[9px] text-gray-400 truncate mt-0.5">{p.clientId?.name || 'Personal Client'}</div>
                        </div>

                        {/* Chronological Grid Bar Column */}
                        <div className="col-span-9 h-9 relative flex items-center px-2">
                          
                          {/* Thin background month column guide lines */}
                          <div className="absolute inset-0 grid grid-cols-9 pointer-events-none opacity-25">
                            <div className="border-r border-dashed border-slate-200 col-span-2"></div>
                            <div className="border-r border-dashed border-slate-200 col-span-2"></div>
                            <div className="border-r border-dashed border-slate-200 col-span-2"></div>
                            <div className="border-r border-dashed border-slate-200 col-span-2"></div>
                            <div className="col-span-1"></div>
                          </div>

                          {/* Hover Gantt Bar Container */}
                          <div 
                            style={{ left: `${offsetPct}%`, width: `${widthPct}%` }}
                            onClick={() => setSelectedProjectId(p._id)}
                            className={`absolute h-6 rounded-lg bg-gradient-to-r ${barColor} shadow-xs flex items-center px-2 text-[8px] font-black text-white cursor-pointer select-none hover:shadow-md hover:scale-[1.01] hover:brightness-105 active:scale-99 transition-all duration-150 whitespace-nowrap overflow-hidden`}
                            title={`${p.name} (${pct}% milestones done)`}
                          >
                            <span className="truncate pr-1">{p.name}</span>
                            <span className="opacity-90 ml-auto bg-black/25 px-1.5 py-0.5 rounded-full shrink-0">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!filteredProjects.length && (
                    <div className="text-center py-14 text-slate-400 font-bold bg-white">
                      No active projects to map on Gantt workspace.
                    </div>
                  )}
                </div>
              </div>

              {/* Gantt Footer Helper */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>* Start dates represent project registration dates; deadline represents client target limits.</span>
                <span className="font-bold text-slate-500">Timeline grid based on UTC+6 Standard time</span>
              </div>
            </div>
          )}

          {/* 4. ClickUp Timesheets Ledger View Tab */}
          {activeTab === 'timeLedger' && (
            <div className="space-y-4">
              
              {/* Timesheets KPI Summary */}
              {(() => {
                const filteredTimeLogs = allTimeLogs.filter(log => 
                  (log.description || '').toLowerCase().includes(search.toLowerCase()) ||
                  (log.projectId?.name || '').toLowerCase().includes(search.toLowerCase())
                );
                
                const totalHours = filteredTimeLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
                const avgHours = filteredTimeLogs.length > 0 ? (totalHours / filteredTimeLogs.length).toFixed(1) : 0;

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="card bg-slate-50/50 border border-slate-100 p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Total Tracked Hours</span>
                          <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{totalHours} hrs</h4>
                        </div>
                      </div>

                      <div className="card bg-slate-50/50 border border-slate-100 p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Total Log Entries</span>
                          <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{filteredTimeLogs.length}</h4>
                        </div>
                      </div>

                      <div className="card bg-slate-50/50 border border-slate-100 p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <Timer className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Average Hours / Sprint</span>
                          <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{avgHours} hrs</h4>
                        </div>
                      </div>
                    </div>

                    {/* Timesheets logs table */}
                    <div className="card p-0 overflow-hidden border border-slate-100 shadow-2xs rounded-2xl">
                      <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Workspace Timesheet Ledger</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white border px-2.5 py-1 rounded-full">
                          Showing {filteredTimeLogs.length} entries
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50/75 text-slate-400 border-b border-slate-100 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-4 w-28">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                              <th className="p-4 w-44">{language === 'bn' ? 'প্রজেক্ট' : 'Project'}</th>
                              <th className="p-4">{language === 'bn' ? 'কাজের বিবরণ / টাস্ক' : 'Work Description / Sprint Task'}</th>
                              <th className="p-4">{language === 'bn' ? 'সদস্য' : 'Team Member'}</th>
                              <th className="p-4 text-center w-28">{language === 'bn' ? 'ট্র্যাকড সময়' : 'Hours Logged'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/70">
                            {filteredTimeLogs.map((log, index) => (
                              <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                                <td className="p-4 text-slate-500 font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>{new Date(log.createdAt || log.logDate).toLocaleDateString()}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div 
                                    className="font-extrabold text-slate-800 hover:text-primary cursor-pointer flex items-center gap-1"
                                    onClick={() => setSelectedProjectId(log.projectId?._id)}
                                  >
                                    <FolderKanban className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="truncate">{log.projectId?.name || 'Deleted Project'}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-semibold text-slate-700">{log.description}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[9px] flex items-center justify-center">
                                      {(log.userId?.name || 'U').substring(0, 1)}
                                    </div>
                                    <span className="font-bold text-gray-800 text-xs">{log.userId?.name || 'Workspace Team'}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full font-mono font-black text-xs text-primary bg-primary/10">
                                    {log.hours} hrs
                                  </span>
                                </td>
                              </tr>
                            ))}

                            {!filteredTimeLogs.length && (
                              <tr>
                                <td colSpan="5" className="text-center p-14 text-slate-400 font-bold bg-white">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Clock className="w-8 h-8 text-slate-350 opacity-40 shrink-0" />
                                    <span>No hours logged matching search criteria. Open a Project Cockpit to log hours.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>
          )}

        </div>
      )}

      {/* ══ Slide-Out Details Drawer Cockpit (Centered Premium Modal!) ═══════════════════════════════ */}
      {selectedProjectId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex items-center justify-center p-4 lg:p-6 animate-fade-in">
          
          {/* Backdrop Close Click */}
          <div className="absolute inset-0" onClick={() => setSelectedProjectId(null)}></div>
          
          <div className="bg-white max-w-2xl w-full max-h-[88vh] relative z-50 shadow-2xl border border-slate-100 rounded-3xl flex flex-col overflow-hidden animate-zoom-in">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {language === 'bn' ? 'প্রজেক্ট ককপিট' : 'ClickUp Control Panel'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedProjectId(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            {isDrawerLoading || !selectedProject ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                
                {/* 1. Project Title & Description */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-extrabold text-slate-800 leading-snug">{selectedProject.name}</h3>
                    
                    <select
                      value={selectedProject.status}
                      onChange={(e) => handleUpdateStatus(selectedProject._id, e.target.value)}
                      className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedProject.description || 'No detailed description specified for this deliverables sprint.'}
                  </p>
                </div>

                {/* 2. Client & Budget Parameters Metadata */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-[11px]">
                  <div className="space-y-1 border-r border-slate-200/50 pr-4">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Client Partner:</span>
                    <div className="font-bold text-slate-800 text-xs">{selectedProject.clientId?.name || 'N/A'}</div>
                    <div className="text-slate-500">{selectedProject.clientId?.company || 'Personal Client'}</div>
                    <div className="text-slate-400 truncate">{selectedProject.clientId?.email || 'N/A'}</div>
                  </div>

                  <div className="space-y-1 pl-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Financial Scope:</span>
                    <div className="text-slate-500">Method: Time & Material Retainer</div>
                    <div className="text-slate-500 font-bold mt-1 text-xs text-primary">
                      Budget: ৳{Number(selectedProject.budget || 0).toLocaleString()} BDT
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Deadline: <span className="font-bold text-slate-700">{selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. ClickUp Milestones Deliverables Checklist */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ClickUp Sprints Checklist</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      {selectedProject.deliverables?.filter(d => d.completed).length || 0}/{selectedProject.deliverables?.length || 0} Complete
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {(selectedProject.deliverables || []).map((del, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          del.completed 
                            ? 'bg-emerald-50/50 border-emerald-100/60 text-slate-400' 
                            : 'bg-white border-slate-100 text-slate-700 hover:border-primary/20'
                        }`}
                        onClick={() => handleToggleDeliverable(idx)}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={del.completed}
                            onChange={() => {}} // handled by parent wrapper click
                            className="w-4.5 h-4.5 rounded-lg border-slate-300 text-primary accent-primary cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${del.completed ? 'line-through' : ''}`}>
                            {del.title}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Inline Form to add deliverable */}
                    <form onSubmit={handleAddDeliverable} className="flex gap-2 pt-1">
                      <input
                        className="input text-xs flex-1 h-9 rounded-xl focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Add new ClickUp deliverable milestone..."
                        value={customDeliverable}
                        onChange={(e) => setCustomDeliverable(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className="btn-primary h-9 px-4 text-xs font-bold shrink-0 rounded-xl"
                      >
                        + Add
                      </button>
                    </form>
                  </div>
                </div>

                {/* 4. ClickUp Active Hour Time Logger */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Work Hours Time Tracker</span>
                  
                  <form onSubmit={handleLogTime} className="grid grid-cols-3 gap-3 items-end">
                    <div className="form-group col-span-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Hours Spent</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        required
                        className="input text-xs h-9 rounded-xl font-mono text-center"
                        placeholder="e.g. 2.5"
                        value={logHours}
                        onChange={(e) => setLogHours(e.target.value)}
                      />
                    </div>

                    <div className="form-group col-span-2 flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Work Comments / task</label>
                        <input
                          required
                          className="input text-xs h-9 rounded-xl"
                          placeholder="e.g. Setup express models & routes..."
                          value={logComment}
                          onChange={(e) => setLogComment(e.target.value)}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="btn-primary bg-slate-800 hover:bg-slate-900 text-white h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Clock className="h-3.5 w-3.5" /> Log
                      </button>
                    </div>
                  </form>

                  {/* Time logs history list */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Logged Sprint History</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                      {(selectedProject.timeLogs || []).map((log, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{log.description}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5">
                              Logged by {log.userId?.name || 'Workspace Team'} · {new Date(log.createdAt || log.logDate).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="font-mono font-black text-xs text-primary bg-primary-light/50 px-2.5 py-1 rounded-full shrink-0">
                            {log.hours} hrs
                          </span>
                        </div>
                      ))}

                      {!(selectedProject.timeLogs?.length) && (
                        <div className="text-center py-6 text-slate-300 font-bold text-[10px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                          No time logs logged for this project yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between shrink-0">
              <button
                onClick={() => handleDeleteProject(selectedProject?._id)}
                className="btn-secondary text-red-500 hover:bg-red-50 border-red-100 hover:text-red-600 h-10 px-4 text-xs font-bold gap-1 cursor-pointer rounded-xl"
              >
                <Trash className="h-4 w-4" /> Delete Project
              </button>

              <button
                onClick={() => setSelectedProjectId(null)}
                className="btn-secondary h-10 px-5 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Cockpit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══ ADVANCED DYNAMIC CREATOR MODAL ═════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <FolderKanban className="h-5 w-5 text-primary animate-pulse" /> Create ClickUp Project
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Configure project financial scope, milestones, and client partners.</p>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Name */}
              <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Name</label>
                <input
                  required
                  className="input text-xs h-10 rounded-xl"
                  placeholder="e.g. Website Redesign & branding"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              {/* Client select */}
              <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client Partner</label>
                <select
                  required
                  className="input text-xs h-10 rounded-xl"
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                >
                  <option value="">Select a Client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.company || 'Personal'})</option>
                  ))}
                </select>
              </div>

              {/* Budget & Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Budget (BDT)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    className="input text-xs h-10 rounded-xl font-mono"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline</label>
                  <input
                    type="date"
                    required
                    className="input text-xs h-10 rounded-xl"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Scope Description</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 text-xs p-2.5 focus:ring-1 focus:ring-primary focus:outline-none resize-none font-medium h-16"
                  placeholder="Describe sprint metrics..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              {/* Default deliverables checklist preview */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Checklist Milestones</label>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 space-y-1 font-semibold">
                  {newDeliverables.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-primary font-bold">✓</span> {d}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal footer controls */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary h-9.5 px-5 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-9.5 px-6 text-xs font-bold rounded-xl cursor-pointer shadow-sm shadow-primary/10"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
