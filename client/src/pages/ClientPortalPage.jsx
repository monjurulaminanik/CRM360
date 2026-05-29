import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation } from 'react-query';
import { 
  Users, BarChart3, Clock, DollarSign, Globe, CheckCircle, 
  MessageSquare, Sparkles, FolderOpen, ArrowUpRight, Send 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientPortalPage() {
  const { user } = useAuthStore();
  const [newPlan, setNewPlan] = useState('');

  const handleSendPlan = (e) => {
    e.preventDefault();
    if (!newPlan.trim()) return;

    // Simulate sending plan to team via dashboard
    toast.success('Strategy Plan submitted to Dawat IT account manager!');
    setNewPlan('');
  };

  return (
    <div className="page-container animate-fade-in font-sans space-y-6">
      
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-white leading-none">Welcome back, {user?.name || 'Client'}!</h2>
          <p className="text-xs text-blue-100 mt-1">Here is your live Dawat IT agency campaign cockpit.</p>
        </div>

        <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-xs">
          Active Retainer Client
        </span>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="card bg-white p-4.5 space-y-2 border border-gray-100 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Retainer Health</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-success">85%</h3>
            <span className="text-[9px] text-gray-400">Excellent</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-success h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="card bg-white p-4.5 space-y-2 border border-gray-100 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Weekly ROAS</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-gray-800">3.8x</h3>
            <span className="text-[9px] text-success font-bold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +15%
            </span>
          </div>
          <p className="text-[9px] text-gray-400">FB Retainer campaigns.</p>
        </div>

        <div className="card bg-white p-4.5 space-y-2 border border-gray-100 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Organic Clicks</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-gray-800">12,480</h3>
            <span className="text-[9px] text-success font-bold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +8.4%
            </span>
          </div>
          <p className="text-[9px] text-gray-400">Organic SEO traffic index.</p>
        </div>

        <div className="card bg-white p-4.5 space-y-2 border border-gray-100 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Billing Retainer Status</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-primary">Cleared</h3>
          </div>
          <p className="text-[9px] text-gray-400">Current cycle paid.</p>
        </div>

      </div>

      {/* Main dashboard columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core milestones (2 columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active checklists */}
          <div className="card bg-white p-5 space-y-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-2">
              Retainer Milestones Checklist
            </h3>

            <div className="space-y-3 pt-1">
              {[
                { title: 'Define custom competitor intelligence watchlist', done: true },
                { title: 'Implement Conversion API tracking tags', done: true },
                { title: 'Launch dynamic FB feeds copy variations', done: true },
                { title: 'Review next month strategy suggestions', done: false },
                { title: 'Audit organic SEO rank changes index', done: false }
              ].map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-gray-700 bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors duration-150">
                  <span className="font-semibold text-gray-800">{m.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    m.done ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {m.done ? '✓ Done' : '⏳ In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor watched alerts */}
          <div className="card bg-white p-5 space-y-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 pb-2">
              Competitor Alerts Feed
            </h3>

            <div className="space-y-3.5 pt-1 text-xs">
              <div className="p-3 bg-red-50/50 border border-red-100/50 text-red-800 rounded-xl leading-relaxed flex gap-2">
                <span className="text-sm">🚨</span>
                <p>
                  **Competitor DigitalForce** launched **4 new creative ads** on Facebook targeting your core keyword niche.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 text-gray-600 rounded-xl leading-relaxed flex gap-2">
                <span className="text-sm">🔍</span>
                <p>
                  **Competitor Vortex Tech** increased their Domain Authority DA from **48 to 50** following high-quality backlink acquisitions.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* WhatsApp submit idea (1 column wide) */}
        <div className="card bg-white p-5 shadow-sm border border-gray-100 flex flex-col space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <MessageSquare className="h-5 w-5 text-success fill-green-50 animate-pulse" />
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Submit Next-Month Plan idea</h3>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            WhatsApp a plan, design idea, or strategy suggestion directly to your Dawat IT team members.
          </p>

          <form onSubmit={handleSendPlan} className="flex-1 flex flex-col space-y-4">
            <textarea
              className="w-full rounded-lg border border-gray-300 text-xs p-3 focus:ring-1 focus:ring-primary focus:outline-none flex-1 min-h-[160px] resize-none"
              placeholder="e.g. Let's start promoting our newly added summer collection..."
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
            />

            <button
              type="submit"
              disabled={!newPlan.trim()}
              className="w-full btn-primary h-9 text-xs gap-1.5 flex items-center justify-center shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> Send to Team
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
