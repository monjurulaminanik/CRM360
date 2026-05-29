import { useState } from 'react';
import { Sparkles, Brain, Loader, MessageSquare, AlertTriangle, ShieldCheck, Play, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AIHubPage() {
  const [clientInput, setClientInput] = useState('We want to scale our e-commerce sales from $5k/mo to $20k/mo. Plan to launch lookalike ad audiences and run SEO product optimizations on trending clothing collections.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Mock Churn risk diagnostics
  const [churnClients, setChurnClients] = useState([
    { id: 'c1', name: 'Delta Consulting', risk: 'high', reason: 'No WhatsApp messages in 18 days, invoice pending for 17 days.', health: 32 },
    { id: 'c2', name: 'PixelTech', risk: 'low', reason: 'High WhatsApp activity, invoices cleared. Retainer stable.', health: 91 },
    { id: 'c3', name: 'CloudSphere', risk: 'medium', reason: 'Retainer payment pending, social media engagement decreased.', health: 58 }
  ]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!clientInput.trim()) return;

    setIsAnalyzing(true);
    try {
      // Direct call to back-end AI router (which has simulation fallbacks!)
      const res = await api.post('/ai/analyze-idea', { idea: clientInput });
      setAnalysisResult(res.data.data);
      toast.success('Strategy generated successfully by AI Layer!');
    } catch (err) {
      toast.error('AI Strategy execution failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500 fill-red-50" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-amber-500 fill-amber-50" />;
      default: return <ShieldCheck className="h-4 w-4 text-success fill-green-50" />;
    }
  };

  return (
    <div className="page-container animate-fade-in font-sans space-y-6">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> AI Operational Hub
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Evaluate client retainer milestones, competitor ads, and automate next-month growth strategies.</p>
        </div>
      </div>

      {/* Grid of panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── LEFT DRAWER: CLIENT IDEA ANALYZER (2 columns wide) ── */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          <div className="card bg-white p-5 flex flex-col flex-1 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-50">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Plan & Growth Strategy Generator</h3>
            </div>
            
            <form onSubmit={handleAnalyze} className="space-y-4 flex flex-col flex-1">
              <div className="form-group flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Paste Client Proposal, Idea, or WhatsApp Plan</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 text-xs p-3 focus:ring-1 focus:ring-primary focus:outline-none flex-1 min-h-[140px]"
                  value={clientInput}
                  onChange={(e) => setClientInput(e.target.value)}
                  placeholder="e.g. Scaling client ads using custom copy..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzing || !clientInput.trim()}
                  className="btn-primary gap-1.5 text-xs px-6"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" /> Generating Strategy...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" /> Execute AI Diagnosis
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI Strategy Results card */}
          {analysisResult && (
            <div className="card bg-gradient-to-br from-primary-light/40 to-blue-50/20 p-5 shadow-sm border border-primary/10 space-y-4 animate-slide-up">
              <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="h-4.5 w-4.5" /> AI Strategy Roadmap Recommendations
                </h4>
                <span className="text-[9px] font-semibold text-gray-400">Processed via Claude-3-Claude v1.0</span>
              </div>

              <div className="space-y-3 text-xs leading-normal">
                {/* Feasibility score */}
                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-primary/5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Feasibility Strength</span>
                    <h5 className="font-extrabold text-sm text-primary mt-0.5">{analysisResult.feasibilityScore}/100</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Strategic Category</span>
                    <span className="font-semibold text-gray-700 block mt-0.5">{analysisResult.channel}</span>
                  </div>
                </div>

                {/* Steps checklists */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested Action Items</h5>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {analysisResult.checklists.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-white p-2.5 border border-primary/5 rounded-lg">
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT DRAWER: CHURN SENTINEL (1 column wide) ── */}
        <div className="card bg-white p-5 flex flex-col shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <AlertTriangle className="h-5 w-5 text-amber-500 fill-amber-50" />
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Client Churn Risk Sentinel</h3>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            AI constantly parses invoice logs, WhatsApp chat activity gaps, and milestones delays to alert managers of retainer churn threats.
          </p>

          {/* Client risk lists */}
          <div className="space-y-3.5 flex-1 overflow-y-auto">
            {churnClients.map((client) => (
              <div key={client.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-gray-800">{client.name}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${getRiskBadge(client.risk)}`}>
                    {getRiskIcon(client.risk)} {client.risk}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[9px] mb-1 font-semibold text-gray-400">
                    <span>Retainer Health Index:</span>
                    <span>{client.health}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      client.health > 70 ? 'bg-success' : client.health > 40 ? 'bg-amber-500' : 'bg-danger'
                    }`} style={{ width: `${client.health}%` }}></div>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 leading-normal italic">
                  "{client.reason}"
                </p>

                <button 
                  onClick={() => toast.success(`Alert notification sent to account manager for ${client.name}!`)}
                  className="w-full btn-secondary h-7 text-[10px] font-semibold flex items-center justify-center gap-1"
                >
                  Audit Mitigation Strategy
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
