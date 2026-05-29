import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Target, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reportRange, setReportRange] = useState('30-days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Analytics logs re-calculated!');
    }, 1000);
  };

  return (
    <div className="page-container animate-fade-in font-sans">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Reports & Analytics
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time charts and lead pipeline conversion reports.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            className="input text-xs w-36 h-9"
          >
            <option value="7-days">Last 7 Days</option>
            <option value="30-days">Last 30 Days</option>
            <option value="this-quarter">This Quarter</option>
            <option value="year-to-date">Year to Date</option>
          </select>

          <button
            onClick={handleRefresh}
            className={`btn-secondary w-9 h-9 p-0 flex items-center justify-center hover:text-primary transition-all duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        <div className="card p-4.5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Inquiries</span>
            <Target className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-gray-800">48</h3>
            <span className="text-[10px] font-bold text-success flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +12.4%
            </span>
          </div>
          <p className="text-[10px] text-gray-400">New leads logged in the selected range.</p>
        </div>

        <div className="card p-4.5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Clients</span>
            <Users className="h-4.5 w-4.5 text-success" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-gray-800">12</h3>
            <span className="text-[10px] font-bold text-success flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +8.1%
            </span>
          </div>
          <p className="text-[10px] text-gray-400">Active client retainer contracts.</p>
        </div>

        <div className="card p-4.5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400">Conversion Rate</span>
            <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-gray-800">25.0%</h3>
            <span className="text-[10px] font-bold text-success flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +2.5%
            </span>
          </div>
          <p className="text-[10px] text-gray-400">Average time to close: 18 days.</p>
        </div>

        <div className="card p-4.5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400">Revenue retained</span>
            <span className="text-xs font-bold text-success">BDT</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-gray-800">45K</h3>
            <span className="text-[10px] font-bold text-danger flex items-center gap-0.5">
              <ArrowDownRight className="h-3 w-3" /> -1.8%
            </span>
          </div>
          <p className="text-[10px] text-gray-400">Retainer payments collection rate.</p>
        </div>

      </div>

      {/* Main Charts & Pipeline visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Deal Flow Stats */}
        <div className="card md:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-primary" /> Retainer deal pipeline strength
          </h4>
          
          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-gray-700">
                <span>New Opportunities</span>
                <span>40% (24 Leads)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-gray-700">
                <span>Proposal & Negotiations</span>
                <span>28% (12 Leads)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-gray-700">
                <span>Closed won retention</span>
                <span>25% (10 retaining clients)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-success h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-gray-700">
                <span>Lost opportunities</span>
                <span>7% (2 Lost)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-danger h-full rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Source metrics */}
        <div className="card space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Leads by Channel</h4>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span> WhatsApp Retainer
              </span>
              <span className="font-bold text-gray-800">45%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-full"></span> Website forms
              </span>
              <span className="font-bold text-gray-800">25%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full"></span> Referrals
              </span>
              <span className="font-bold text-gray-800">18%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span> Social media channels
              </span>
              <span className="font-bold text-gray-800">12%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
