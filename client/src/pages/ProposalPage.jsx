import { useState } from 'react';
import { Sparkles, FileText, Printer, CheckCircle, HelpCircle, DollarSign, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProposalPage() {
  const [clientName, setClientName] = useState('PixelTech Corp');
  const [proposalTitle, setProposalTitle] = useState('Facebook Ads Retainer & Growth Strategy');
  const [contractDuration, setContractDuration] = useState('6 Months');
  const [retainerFee, setRetainerFee] = useState('1500');
  const [currency, setCurrency] = useState('USD');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');

  const [scopes, setScopes] = useState([
    { id: 's1', text: 'Structure Facebook Ads campaigns and implement Pixel verification', checked: true },
    { id: 's2', text: 'Deploy custom conversion web page landing layout to maximize ROI', checked: true },
    { id: 's3', text: 'Generate weekly ROAS performance charts and analytics margins', checked: true },
    { id: 's4', text: 'Initiate continuous SEO contextual DA backlinks building support', checked: false },
    { id: 's5', text: 'Publish weekly high-quality visual creative and copy materials', checked: false }
  ]);

  const toggleScope = (id) => {
    setScopes(scopes.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const handlePrint = () => {
    window.print();
    toast.success('Initiating PDF export print utility...');
  };

  return (
    <div className="page-container animate-fade-in font-sans grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:p-0">
      
      {/* ── LEFT DRAWER: PROPOSAL CONTROLS (Hide during print) ── */}
      <div className="space-y-6 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Proposal Builder
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Generate high-fidelity agency proposals for prospective leads instantly.</p>
        </div>

        {/* Inputs panel */}
        <div className="card bg-white p-5 space-y-4 shadow-sm border border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Prospect Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Client / Company Name</label>
              <input
                className="input text-xs"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Proposal Title</label>
              <input
                className="input text-xs"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-group col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Retainer Fee</label>
              <div className="relative">
                <input
                  type="number"
                  className="input pl-8 text-xs font-bold"
                  value={retainerFee}
                  onChange={(e) => setRetainerFee(e.target.value)}
                />
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Currency</label>
              <select
                className="input text-xs"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contract Duration</label>
            <input
              className="input text-xs"
              value={contractDuration}
              onChange={(e) => setContractDuration(e.target.value)}
            />
          </div>
        </div>

        {/* Deliverables checklists select */}
        <div className="card bg-white p-5 space-y-3 shadow-sm border border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Deliverables Scope</h4>
          
          <div className="space-y-2">
            {scopes.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleScope(s.id)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all duration-200 ${
                  s.checked 
                    ? 'bg-primary-light/35 border-primary/20 text-gray-800 font-medium' 
                    : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                <CheckCircle className={`h-4.5 w-4.5 mt-0.5 flex-shrink-0 ${s.checked ? 'text-primary fill-primary-light' : 'text-gray-200'}`} />
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Print controls */}
        <div className="flex justify-end">
          <button
            onClick={handlePrint}
            className="btn-primary gap-1.5 text-xs px-6 shadow-sm"
          >
            <Printer className="h-4 w-4" /> Export/Print PDF Proposal
          </button>
        </div>
      </div>

      {/* ── RIGHT DRAWER: DYNAMIC LIVE PREVIEW (Fully styled for print) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 font-sans aspect-[1/1.41] overflow-y-auto print:overflow-visible">
        
        {/* Cover logo header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-primary leading-none">D360</h1>
            <p className="text-[10px] text-gray-400 tracking-widest mt-0.5 uppercase">DAWAT IT & CONSULTANCY</p>
          </div>
          <div className="text-right">
            <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary text-white rounded">
              Retainer Proposal
            </span>
            <p className="text-[9px] text-gray-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Core intro block */}
        <div className="space-y-3">
          <span className="text-[9px] uppercase font-bold text-primary tracking-wider">Prepared exclusively for:</span>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-1.5 leading-none">
            <Building className="h-4.5 w-4.5 text-gray-400" /> {clientName}
          </h2>
          <h3 className="text-sm font-semibold text-primary/95 leading-normal">
            Project: {proposalTitle}
          </h3>
          <p className="text-[11px] text-gray-500 leading-normal">
            Dear {clientName} Team, Dawat IT is extremely pleased to offer this business retainer strategy model. 
            We coordinate advanced marketing technologies to drive traffic, optimize branding outputs, and scale core operations.
          </p>
        </div>

        {/* Scope list section */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1">
            Core Strategy Scope & Deliverables
          </h4>
          
          <div className="space-y-2.5">
            {scopes.filter(s => s.checked).map((s, idx) => (
              <div key={s.id} className="flex items-start gap-2.5 text-xs text-gray-700">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing retainers */}
        <div className="space-y-3 pt-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1">
            Financial Retainer Summary
          </h4>
          
          <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Monthly retained fee</p>
              <h3 className="text-lg font-extrabold text-primary mt-1">
                {Number(retainerFee).toLocaleString()} {currency} <span className="text-[10px] font-normal text-gray-400">/ month</span>
              </h3>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400">Contract term</p>
              <span className="text-xs font-semibold text-gray-700 mt-1 block">{contractDuration}</span>
            </div>
          </div>
        </div>

        {/* Signatures placeholders */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
          <div>
            <div className="border-b border-gray-300 h-8"></div>
            <p className="text-[9px] font-bold text-gray-600 mt-1.5 uppercase leading-none">Monjurul Amin Anik</p>
            <span className="text-[8px] text-gray-400">CEO, Dawat IT & Consultancy</span>
          </div>

          <div>
            <div className="border-b border-gray-300 h-8"></div>
            <p className="text-[9px] font-bold text-gray-600 mt-1.5 uppercase leading-none">Authorized Client Signature</p>
            <span className="text-[8px] text-gray-400">On behalf of: {clientName}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
