import { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SOPPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedSop, setExpandedSop] = useState(null);
  
  // Track interactive step completions
  const [completedSteps, setCompletedSteps] = useState({});

  const sops = [
    {
      id: 'sop-01',
      title: 'Facebook Ads Setup & Launch SOP',
      category: 'ppc',
      summary: 'Standard procedure to structure, verify, and launch Facebook campaign retainers.',
      steps: [
        'Perform Pixel verification on Shopify/WordPress sites.',
        'Implement conversion API using standard gateway credentials.',
        'Structure target audiences: 1x Broad, 1x Interest, 1x Lookalike (1-2%).',
        'Upload dynamic creatives: 1:1 format for feeds, 9:16 for Reels/Stories.',
        'Set daily budget optimization (CBO) on testing stages.',
        'Analyze campaign margins within 48 hours for ROAS indicators.'
      ]
    },
    {
      id: 'sop-02',
      title: 'SEO Retention Audit & DA Booster',
      category: 'seo',
      summary: 'Monthly optimization routines to secure keyword ranking improvements.',
      steps: [
        'Run monthly site health diagnostics on Google Search Console.',
        'Identify target long-tail keywords with rank range 11-20.',
        'Perform keyword placement inside H1, H2, and meta description fields.',
        'Identify and clear duplicate canonical references.',
        'Acquire high-quality DA 40+ contextual editorial backlinks.',
        'Compile organic traffic summaries inside Reports Page.'
      ]
    },
    {
      id: 'sop-03',
      title: 'Web Design & Portal Deployment SOP',
      category: 'development',
      summary: 'Protocol to wireframe, client-approve, and launch custom web interfaces.',
      steps: [
        'Compile layout wireframes inside Figma workspaces.',
        'Obtain client review and explicit signature approval.',
        'Initialize Vite React boilerplates inside the repository.',
        'Configure Tailwind dynamic responsive breakpoints.',
        'Connect server endpoints with secure API controllers.',
        'Launch build bundles and deploy using Nginx/PM2 on Hostinger VPS.'
      ]
    },
    {
      id: 'sop-04',
      title: 'Strategic Copywriting & Branding guidelines',
      category: 'content',
      summary: 'Tone guide to structure marketing copies and content retainers.',
      steps: [
        'Audit client brand voice guidelines (Professional vs Playful).',
        'Structure headline hooks targeting direct customer pain points.',
        'Draft short-form WhatsApp broadcast pitch scripts.',
        'Ensure copywriting follows the standard AIDA flow.',
        'Verify copy formatting before passing to design teams.'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Operations', icon: '⚡' },
    { id: 'ppc', label: 'PPC / Ads', icon: '📊' },
    { id: 'seo', label: 'SEO Audit', icon: '🔍' },
    { id: 'development', label: 'Web Dev', icon: '💻' },
    { id: 'content', label: 'Content & Brand', icon: '📝' }
  ];

  const toggleStep = (sopId, stepIdx) => {
    const key = `${sopId}-${stepIdx}`;
    const wasCompleted = !!completedSteps[key];
    
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    if (!wasCompleted) {
      toast.success('Step completed! Keep crushing it! 🔥', { id: key });
    }
  };

  const filteredSops = sops.filter(sop =>
    (sop.title.toLowerCase().includes(search.toLowerCase()) || 
     sop.summary.toLowerCase().includes(search.toLowerCase())) &&
    (activeCategory === 'all' || sop.category === activeCategory)
  );

  return (
    <div className="page-container animate-fade-in font-sans space-y-6">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> SOP Library
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Standard Operating Procedures and interactive operational checklists for Dawat IT members.</p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
        <input
          className="input pl-10 text-xs h-10 w-full"
          placeholder="Search standard operating procedures or checklists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categories Horizontal Scrolling Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
              activeCategory === cat.id
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50 hover:border-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Accordion SOP List with Progress Bars */}
      <div className="space-y-4">
        {filteredSops.map((sop) => {
          const isExpanded = expandedSop === sop.id;
          
          // Calculate step progress variables
          const totalSteps = sop.steps.length;
          const completedCount = sop.steps.reduce((acc, _, idx) => {
            return acc + (completedSteps[`${sop.id}-${idx}`] ? 1 : 0);
          }, 0);
          const percent = Math.round((completedCount / totalSteps) * 100);

          return (
            <div
              key={sop.id}
              className={`card bg-white p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 border border-gray-100 ${
                isExpanded ? 'ring-1 ring-primary/10 border-primary/20 shadow-xs' : ''
              }`}
            >
              {/* Header block trigger */}
              <button
                onClick={() => setExpandedSop(isExpanded ? null : sop.id)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
              >
                <div className="flex items-center gap-4.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                    isExpanded ? 'bg-primary text-white' : 'bg-primary-light text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-gray-800 leading-tight group-hover:text-primary transition-colors duration-150 truncate">
                      {sop.title}
                    </h4>
                    
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-[9px] uppercase font-extrabold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                        {sop.category}
                      </span>
                      {percent > 0 && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all duration-300 ${
                          percent === 100 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-primary-light text-primary border border-primary/10'
                        }`}>
                          {percent}% Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-gray-400 hover:text-gray-600 transition-colors">
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </button>

              {/* Expanded details container */}
              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-5 animate-slide-down">
                  {/* Summary Block */}
                  <p className="text-xs text-gray-600 leading-relaxed italic bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                    "{sop.summary}"
                  </p>

                  {/* Checklist Live Progress Bar */}
                  <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                      <span className="uppercase tracking-wider">SOP Audit Checklist Progress</span>
                      <span className="text-primary font-mono bg-primary-light/50 px-2 py-0.5 rounded">
                        {completedCount} of {totalSteps} Steps Completed ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/20">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* List of interactive steps */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required Checklist Checkpoints</h5>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {sop.steps.map((step, idx) => {
                        const isStepDone = !!completedSteps[`${sop.id}-${idx}`];
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleStep(sop.id, idx)}
                            className={`w-full flex items-start gap-3.5 text-xs text-left p-3.5 border rounded-xl transition-all duration-200 cursor-pointer ${
                              isStepDone
                                ? 'bg-emerald-50/20 border-emerald-150/40 text-gray-500 shadow-2xs'
                                : 'bg-white border-gray-100 text-gray-700 hover:bg-slate-50/30 hover:border-gray-200'
                            }`}
                          >
                            <CheckCircle2 
                              className={`h-4.5 w-4.5 shrink-0 mt-0.5 transition-all duration-200 ${
                                isStepDone ? 'text-emerald-500 fill-emerald-50' : 'text-gray-300 group-hover:text-gray-400'
                              }`} 
                            />
                            <span className={`leading-relaxed ${isStepDone ? 'line-through text-gray-400 font-medium' : 'font-medium'}`}>
                              {idx + 1}. {step}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!filteredSops.length && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 shadow-2xs">
            No SOPs match your search or category filter.
          </div>
        )}
      </div>

    </div>
  );
}

