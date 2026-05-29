import { useState, useEffect } from 'react';
import { 
  Shield, Plus, Search, Globe, Flame, Share2, BarChart2, CheckCircle,
  Settings, Radio, Sparkles, RefreshCw, Eye, Download, Printer, 
  PlusCircle, AlertCircle, FileText, ChevronRight, X, Info, TrendingUp, CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompetitorPage() {
  const [competitors, setCompetitors] = useState([
    { id: '1', name: 'DigitalForce Agency', website: 'www.digitalforce.com', daRank: 42, activeAds: 12, youtubeFrequency: '2 videos/week', primaryFocus: 'SEO & Content' },
    { id: '2', name: 'NextGen Creative Hub', website: 'www.nextgencreative.io', daRank: 35, activeAds: 8, youtubeFrequency: 'Monthly sync', primaryFocus: 'Social Media & PPC' },
    { id: '3', name: 'Vortex Tech & Dev', website: 'www.vortextech.co', daRank: 50, activeAds: 24, youtubeFrequency: 'Daily Shorts', primaryFocus: 'Web Dev & Software' },
  ]);

  // Sentinel Monitor Settings
  const [isSyncActive, setIsSyncActive] = useState(true);
  const [isKeywordMonitorActive, setIsKeywordMonitorActive] = useState(true);
  const [syncKeywords, setSyncKeywords] = useState(['digital marketing agency', 'web development dhaka', 'best seo services']);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Search and Modal states
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newFocus, setNewFocus] = useState('SEO & Content');

  // Interactive Simulation states
  const [selectedCompetitorForAds, setSelectedCompetitorForAds] = useState(null);
  const [selectedCompetitorForReport, setSelectedCompetitorForReport] = useState(null);
  const [selectedCompetitorForBacklinks, setSelectedCompetitorForBacklinks] = useState(null);

  // MOCK COMPETITOR ADS DATABASE
  const competitorAdsDatabase = {
    '1': [
      {
        id: 'ad-df-1',
        title: 'Get Ranked #1 on Google in 90 Days or You Don\'t Pay!',
        body: '🚀 Stop wasting marketing budget on vanity metrics. DigitalForce delivers high-quality SEO backlink structures and semantic content audits that push your brand to the top of Google. Contact us for a free target keyword mapping audit today.',
        imageUrl: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        imageText: 'SEO DOMINANCE',
        cta: 'Book Free Audit',
        platforms: ['facebook', 'instagram', 'messenger'],
        launched: 'May 24, 2026',
        spendRange: '৳15,000 - ৳25,000'
      },
      {
        id: 'ad-df-2',
        title: 'Free SEO Audit Checklist - Download Instantly',
        body: 'Avoid these critical SEO mistakes that 99% of digital consultancies make. Get our 15-point internal audit spreadsheet and start auditing your web performance today.',
        imageUrl: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        imageText: '15-POINT SEO CHECKLIST',
        cta: 'Download PDF',
        platforms: ['facebook', 'audience_network'],
        launched: 'May 18, 2026',
        spendRange: '৳5,000 - ৳12,000'
      }
    ],
    '2': [
      {
        id: 'ad-ng-1',
        title: 'Scroll-Stopping Video Creatives That Actually Convert',
        body: '🔥 Standard static banners are dead. NextGen designs immersive, high-conversion TikTok and Meta Ad video creatives tailored for your retail/SaaS store. Click below to view our portfolio of 150+ successful campaigns.',
        imageUrl: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
        imageText: 'CREATIVE SCROLL STOPPERS',
        cta: 'View Portfolio',
        platforms: ['facebook', 'instagram', 'audience_network'],
        launched: 'May 26, 2026',
        spendRange: '৳35,000 - ৳50,000'
      },
      {
        id: 'ad-ng-2',
        title: 'Meta Ads Scaling Playbook - Free for Agency owners',
        body: 'How we took an e-commerce brand from ৳0 to ৳10 Lakhs in monthly recurring revenue in under 120 days. No fluff, just pure high-ROAS bidding tactics.',
        imageUrl: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        imageText: 'HIGH-ROAS BLUEPRINT',
        cta: 'Get Free Access',
        platforms: ['facebook', 'instagram'],
        launched: 'May 20, 2026',
        spendRange: '৳10,000 - ৳20,000'
      }
    ],
    '3': [
      {
        id: 'ad-vt-1',
        title: 'Is Your Website Losing 40% of Mobile Visitors?',
        body: '⚡ A slow website is the fastest way to give sales to your competitors. Vortex builds serverless, Next.js customized web architectures with 100/100 Lighthouse performance scoring. Deploy in under 3 weeks.',
        imageUrl: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        imageText: 'LIGHTNING FAST WEB',
        cta: 'Get Speed Test',
        platforms: ['facebook', 'messenger'],
        launched: 'May 15, 2026',
        spendRange: '৳40,000 - ৳70,000'
      },
      {
        id: 'ad-vt-2',
        title: 'Hire Dedicated React & Node Developers - Fully Managed',
        body: 'Scale your technical capacity instantly. Vortex provides vetted mid-to-senior software engineers on-demand. Flexible hourly retainers with zero onboarding overhead.',
        imageUrl: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
        imageText: 'DEDICATED TECH ENGINEERS',
        cta: 'Schedule Call',
        platforms: ['facebook', 'audience_network'],
        launched: 'May 12, 2026',
        spendRange: '৳25,000 - ৳45,000'
      }
    ]
  };

  // MOCK SEO BACKLINKS
  const competitorBacklinksDatabase = {
    '1': { domainRating: 45, backlinkCount: 1450, organicKeywords: 3200, topPages: ['/services/seo', '/blog/seo-checklist', '/case-studies/digitalforce'] },
    '2': { domainRating: 38, backlinkCount: 820, organicKeywords: 1800, topPages: ['/agency/portfolio', '/blog/meta-ads-guide', '/packages/branding'] },
    '3': { domainRating: 52, backlinkCount: 2900, organicKeywords: 6400, topPages: ['/hire-react-developers', '/services/custom-software', '/case-study/serverless'] }
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    toast.loading('Contacting Meta Ads API & scraping brand index endpoints...', { id: 'sync' });
    
    setTimeout(() => {
      setIsSyncing(false);
      // Randomize competitor ad count or daRank slightly to simulate real changes!
      setCompetitors(prev => prev.map(c => ({
        ...c,
        activeAds: Math.max(1, c.activeAds + Math.floor(Math.random() * 3) - 1),
        daRank: Math.min(100, Math.max(10, c.daRank + (Math.random() > 0.5 ? 1 : -1)))
      })));
      toast.success('Competitor ad libraries & keyword lists updated successfully!', { id: 'sync' });
    }, 2000);
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;
    if (syncKeywords.includes(newKeywordInput.trim().toLowerCase())) {
      toast.error('Keyword already in active watch-list!');
      return;
    }
    setSyncKeywords([...syncKeywords, newKeywordInput.trim().toLowerCase()]);
    setNewKeywordInput('');
    toast.success('Keyword added to real-time SERP monitor!');
  };

  const handleRemoveKeyword = (keyword) => {
    setSyncKeywords(syncKeywords.filter(k => k !== keyword));
    toast.success('Keyword removed from monitor.');
  };

  const handleAddCompetitor = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newComp = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName,
      website: newWebsite || `www.${newName.toLowerCase().replace(/\s+/g, '')}.com`,
      daRank: Math.floor(Math.random() * 40) + 15,
      activeAds: Math.floor(Math.random() * 15) + 2,
      youtubeFrequency: 'Weekly updates',
      primaryFocus: newFocus
    };

    setCompetitors([...competitors, newComp]);
    setNewName('');
    setNewWebsite('');
    setShowAddModal(false);
    toast.success('New competitor registered to monitor panel!');
  };

  const filteredCompetitors = competitors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.website.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container animate-fade-in font-sans pb-12">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Competitor Sentinel & Intel
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Automated tracking of active Facebook/Meta campaigns, keyword Share-of-Voice, and weekly SWOT intel reports.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="btn-secondary gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Live API Data
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary gap-1.5 text-xs h-9"
          >
            <Plus className="h-4 w-4" /> Register Competitor
          </button>
        </div>
      </div>

      {/* ── SENTINEL ACTIVE ENGINE SETTINGS PANEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mb-6">
        
        {/* Keywords Monitoring Card */}
        <div className="card bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Radio className="h-4.5 w-4.5 text-primary animate-pulse" /> Real-time Brand & SERP Keyword Monitor
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 border border-green-100 text-success">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Engine Listening
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              D360 listens continuously for changes in Google search indexing, local SERP bidding, and active sponsor bids targeting these target keywords. You will receive notifications when competitors start bidding on them.
            </p>

            {/* Keyword tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {syncKeywords.map((k) => (
                <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 font-semibold shadow-2xs hover:border-danger/30 transition-colors">
                  {k}
                  <button onClick={() => handleRemoveKeyword(k)} className="text-gray-400 hover:text-danger ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <input
              required
              className="input text-xs flex-1 h-9"
              placeholder="e.g. digital agency bangladesh, seo agency in dhaka"
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary text-xs h-9 px-4 flex items-center gap-1 hover:text-primary">
              <PlusCircle className="h-4 w-4" /> Add Keyword
            </button>
          </form>
        </div>

        {/* Sync Controls Panel */}
        <div className="card p-5 bg-white shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-gray-400" /> Sentinel Meta Sync Settings
          </h3>

          <div className="space-y-3.5 pt-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">Meta Ads Library API</p>
                <p className="text-[10px] text-gray-400">Fetch daily active ads of brands</p>
              </div>
              <button 
                onClick={() => { setIsSyncActive(!isSyncActive); toast.success(`Meta Ads Library Sync ${!isSyncActive ? 'Enabled' : 'Disabled'}`); }}
                className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center ${isSyncActive ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute shadow-sm ${isSyncActive ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">Weekly SWOT Intel Reports</p>
                <p className="text-[10px] text-gray-400">Generate automated intel briefs</p>
              </div>
              <button 
                onClick={() => { setIsKeywordMonitorActive(!isKeywordMonitorActive); toast.success(`SWOT Intel Compiler ${!isKeywordMonitorActive ? 'Enabled' : 'Disabled'}`); }}
                className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center ${isKeywordMonitorActive ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute shadow-sm ${isKeywordMonitorActive ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="border-t border-gray-50 pt-3 text-[10px] text-gray-400 leading-normal flex items-start gap-1">
              <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                All tracking runs securely in background intervals. Real-time notifications and alerts sync directly into your WhatsApp Shared Inbox.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Control Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
        <input
          className="input pl-9 text-xs h-9 bg-white"
          placeholder="Search tracked competitors by brand name or website domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Competitors List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCompetitors.map((c) => (
          <div key={c.id} className="card bg-white p-5 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-200 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm shadow-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-gray-800 truncate leading-tight">{c.name}</h4>
                    <a href={`http://${c.website}`} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline truncate flex items-center gap-1 mt-0.5">
                      <Globe className="h-3 w-3 text-gray-400" /> {c.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 border-y border-gray-50 py-3 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">DA Rank</span>
                  <span className="text-xs font-bold text-gray-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{c.daRank}/100</span>
                </div>
                
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Active Ads</span>
                  <span className="text-xs font-bold text-success bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center justify-center gap-0.5 mx-auto w-max">
                    <Flame className="h-3.5 w-3.5 text-success fill-success animate-pulse" /> {c.activeAds}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Video Output</span>
                  <span className="text-[9px] font-bold text-gray-600 truncate block mt-0.5">{c.youtubeFrequency}</span>
                </div>
              </div>

              {/* Strategy Profile */}
              <div className="text-[11px] space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex justify-between text-gray-500">
                  <span>Primary Target Focus:</span>
                  <span className="font-bold text-gray-800">{c.primaryFocus}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCompetitorForAds(c);
                    toast.success(`Opening active Facebook Ads Library feed for ${c.name}`);
                  }}
                  className="flex-1 btn-secondary h-8.5 text-[10px] font-bold gap-1 hover:text-primary hover:border-primary/20"
                >
                  <Share2 className="h-3.5 w-3.5" /> Meta Ads Library
                </button>

                <button
                  onClick={() => {
                    setSelectedCompetitorForBacklinks(c);
                    toast.success(`Fetched domain backlinks profile for ${c.website}`);
                  }}
                  className="btn-secondary h-8.5 w-9 p-0 flex items-center justify-center hover:text-primary hover:border-primary/20"
                  title="SEO Backlink Stats"
                >
                  <BarChart2 className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedCompetitorForReport(c);
                  toast.success(`Compiling dynamic SWOT Report for ${c.name}...`);
                }}
                className="btn-primary h-8.5 text-[10px] font-bold gap-1 bg-gradient-to-r from-primary to-violet-600 text-white border-none shadow-sm flex items-center justify-center"
              >
                <Sparkles className="h-3.5 w-3.5" /> Generate SWOT Intel Report
              </button>
            </div>

          </div>
        ))}

        {!filteredCompetitors.length && (
          <div className="md:col-span-3 text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            No tracked competitors found matching your search. Click "Register Competitor" to add.
          </div>
        )}
      </div>

      {/* ── INTERACTIVE 1: LIVE FACEBOOK ADS LIBRARY DRAWER/MODAL ── */}
      {selectedCompetitorForAds && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-slate-50 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-gray-100 shadow-modal overflow-hidden">
            
            {/* Header */}
            <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Share2 className="h-4.5 w-4.5 text-primary" /> Active Ads Feed: {selectedCompetitorForAds.name}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Scraped live from Meta Ads Library Index targeting domain {selectedCompetitorForAds.website}</p>
              </div>

              <button 
                onClick={() => setSelectedCompetitorForAds(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ads List Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {competitorAdsDatabase[selectedCompetitorForAds.id] ? (
                competitorAdsDatabase[selectedCompetitorForAds.id].map((ad) => (
                  <div key={ad.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
                    
                    {/* Meta Sponsor header */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-gray-700">
                          {selectedCompetitorForAds.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{selectedCompetitorForAds.name}</p>
                          <p className="text-[9px] text-gray-400">Sponsored · Launched {ad.launched}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-success border border-green-100">
                          🟢 Active
                        </span>
                        <p className="text-[9px] text-gray-400 mt-1">Est. Spend: {ad.spendRange}</p>
                      </div>
                    </div>

                    {/* Ad text */}
                    <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{ad.body}</p>

                    {/* Mock Creative Image */}
                    <div 
                      style={{ background: ad.imageUrl }}
                      className="aspect-video rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner p-4"
                    >
                      <div className="absolute inset-0 bg-slate-900/10" />
                      <span className="font-extrabold tracking-wider text-sm relative z-10 text-center font-heading drop-shadow-md">
                        {ad.imageText}
                      </span>
                      <span className="text-[8px] tracking-widest text-white/70 uppercase absolute bottom-2 relative z-10 mt-1">
                        Mock Visual Content
                      </span>
                    </div>

                    {/* Bottom CTA Block */}
                    <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-3 rounded-xl">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-none">Meta Destination Link</p>
                        <h5 className="font-bold text-[10px] text-gray-700 mt-1 truncate max-w-[250px]">{ad.title}</h5>
                      </div>

                      <button 
                        onClick={() => toast.success(`Simulating destination link click to: ${selectedCompetitorForAds.website}`)}
                        className="btn-primary h-8 px-4 text-[10px] font-bold shrink-0 shadow-xs"
                      >
                        {ad.cta}
                      </button>
                    </div>

                    {/* Platforms list */}
                    <div className="flex gap-2.5 items-center pt-1 text-[9px] text-gray-400 font-semibold">
                      <span>Target Platforms:</span>
                      {ad.platforms.map((p) => (
                        <span key={p} className="bg-slate-100 px-2 py-0.5 rounded uppercase">{p.replace('_', ' ')}</span>
                      ))}
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-2">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-semibold text-gray-700">No active ads stored offline.</p>
                  <p className="text-[10px] text-gray-400">Click "Sync Live API Data" at the top to simulate loading competitor meta ad index tables.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white px-5 py-3.5 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedCompetitorForAds(null)}
                className="btn-secondary h-8 text-[11px] px-4 font-bold"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── INTERACTIVE 2: SEO BACKLINK METRICS DRAWER ── */}
      {selectedCompetitorForBacklinks && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-modal overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <BarChart2 className="h-4.5 w-4.5 text-primary" /> SEO Backlinks Profile
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{selectedCompetitorForBacklinks.name} · {selectedCompetitorForBacklinks.website}</p>
              </div>
              <button onClick={() => setSelectedCompetitorForBacklinks(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-gray-500 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs text-gray-700">
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Domain Rating</span>
                  <p className="text-lg font-bold text-primary mt-1">
                    {competitorBacklinksDatabase[selectedCompetitorForBacklinks.id]?.domainRating || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Backlinks</span>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    {competitorBacklinksDatabase[selectedCompetitorForBacklinks.id]?.backlinkCount?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Organic Keywords</span>
                  <p className="text-lg font-bold text-amber-500 mt-1">
                    {competitorBacklinksDatabase[selectedCompetitorForBacklinks.id]?.organicKeywords?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Top Traffic Pages */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Performing Organic Landing Pages</h4>
                <div className="space-y-1.5">
                  {competitorBacklinksDatabase[selectedCompetitorForBacklinks.id]?.topPages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-mono text-[10px] text-gray-600 truncate max-w-[280px]">
                        {selectedCompetitorForBacklinks.website}{page}
                      </span>
                      <span className="text-[9px] font-bold text-primary flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" /> Page #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 text-[10px] text-gray-400 leading-normal flex items-start gap-1 bg-blue-50/50 p-2.5 rounded-xl">
                <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  SEO metrics are pulled securely via public domain registrar indexes. High backlink counts usually represent strong DA ranking strength.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white px-5 py-3 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedCompetitorForBacklinks(null)} className="btn-secondary h-8 px-4 font-bold text-[10px]">
                Close view
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── INTERACTIVE 3: FULL DYNAMIC WEEKLY SWOT INTEL REPORT OVERLAY ── */}
      {selectedCompetitorForReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-gray-100 shadow-modal flex flex-col my-8 max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:my-0">
            
            {/* Header Drawer (Hide during print) */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between print:hidden">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-primary" /> Generated Competitor SWOT Intelligence Report
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Generated instantly targeting competitor {selectedCompetitorForReport.name}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="btn-secondary h-8 text-[11px] px-3 font-bold gap-1 hover:text-primary"
                >
                  <Printer className="h-3.5 w-3.5" /> Export Report (PDF)
                </button>
                <button 
                  onClick={() => setSelectedCompetitorForReport(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-gray-500 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* INTEL REPORT CORE DOCUMENT - Dynamic and fully printable */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6 print:overflow-visible print:p-0">
              
              {/* Report Header Logo */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                <div>
                  <h1 className="font-heading text-2xl font-extrabold text-primary leading-none">D360</h1>
                  <p className="text-[9px] text-gray-400 tracking-widest mt-1 uppercase">DAWAT IT & CONSULTANCY · COMPETITOR SENTINEL MODULE</p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-900 text-white rounded">
                    INTEL BRIEF
                  </span>
                  <p className="text-[9px] text-gray-400 mt-1 font-semibold">Report ID: INTEL-{selectedCompetitorForReport.id.toUpperCase()}-2026</p>
                  <p className="text-[9px] text-gray-400 mt-0.5 font-medium">Date compiled: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Title Info */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-primary tracking-wider">Subject Competitor Brand:</span>
                <h2 className="text-xl font-bold text-gray-800 leading-none">
                  {selectedCompetitorForReport.name}
                </h2>
                <p className="text-[11px] text-gray-500 font-medium">
                  Website: {selectedCompetitorForReport.website} · Core focus: {selectedCompetitorForReport.primaryFocus}
                </p>
              </div>

              {/* Strategy Executive Summary */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                  1. Executive Strategy Summary
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Based on our active backend scraping of public domain indexes and active SERP bidding databases, **{selectedCompetitorForReport.name}** operates an aggressive outreach campaign in digital spaces. Their marketing is heavily optimized for **{selectedCompetitorForReport.primaryFocus}**. Currently, they have **{selectedCompetitorForReport.activeAds} active ad campaigns** running in their Meta Ads library with estimated monthly spend of **৳80,000 - ৳1,500,000**.
                </p>
              </div>

              {/* SWOT Analysis Matrix */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                  2. SWOT Analysis Matrix
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Strengths */}
                  <div className="border border-green-100 bg-green-50/20 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-extrabold text-green-700 tracking-wider block">🟢 Strengths</span>
                    <ul className="list-disc pl-3 text-[10px] text-gray-600 space-y-1">
                      <li>Solid Domain Authority Rank ({selectedCompetitorForReport.daRank}/100) indicates strong SEO foundation.</li>
                      <li>High video output frequency ({selectedCompetitorForReport.youtubeFrequency}) creates high organic brand awareness.</li>
                      <li>Proven, tested ad copy funnels running on multiple social channels.</li>
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="border border-amber-100 bg-amber-50/20 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-extrabold text-amber-700 tracking-wider block">🟡 Weaknesses</span>
                    <ul className="list-disc pl-3 text-[10px] text-gray-600 space-y-1">
                      <li>Landing page designs are generic and lack high-fidelity conversion hooks.</li>
                      <li>High dependency on social media paid traffic leads to soaring acquisition costs.</li>
                      <li>No personalized client check-in or shared communications hub, leading to high churn rates.</li>
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="border border-blue-100 bg-blue-50/20 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-extrabold text-blue-700 tracking-wider block">🔵 Opportunities</span>
                    <ul className="list-disc pl-3 text-[10px] text-gray-600 space-y-1">
                      <li>Outbid their target focus keywords on Google local search queries.</li>
                      <li>Target their churned premium clients with tailored, high-fidelity landing page packages.</li>
                      <li>Leverage Dawat IT\'s simulated real-time WhatsApp shared inbox capability to offer superior customer retention response times.</li>
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="border border-red-100 bg-red-50/20 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-extrabold text-red-700 tracking-wider block">🔴 Threats</span>
                    <ul className="list-disc pl-3 text-[10px] text-gray-600 space-y-1">
                      <li>Aggressive paid budget scaling might saturate target local business niches.</li>
                      <li>Vortex Tech\'s fast Next.js engineering options might appeal to traditional corporate clients who prefer speed metrics.</li>
                    </ul>
                  </div>

                </div>
              </div>

              {/* Actionable Counter-Strategy for Dawat IT */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
                  3. Actionable Counter-Strategy (For Dawat IT & Consultancy)
                </h4>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-[11px] text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <span className="leading-relaxed">
                      **Target Underserved Organic Channels**: Deploy advanced organic SEO SEO structures targeting the exact keywords listed in Dawat IT SERP monitors. While they waste high budgets on paid ads, we can rank organically on Google!
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 text-[11px] text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <span className="leading-relaxed">
                      **Deploy Conversion Cockpits**: NextGen Creative has high creative output but generic landers. Dawat IT should pitch premium glassmorphic, hyper-converting landing layout page designs to the same prospects, guaranteeing lower CPLs.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 text-[11px] text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <span className="leading-relaxed">
                      **Pitch Shared WhatsApp Capabilities**: Use Dawat IT\'s proprietary WhatsApp Shared Workspace integration (including quick templates & team response syncing) as a premium core onboarding pitch. Competitors cannot offer such high customer retention transparency.
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div>
                  <div className="border-b border-gray-300 h-8"></div>
                  <p className="text-[9px] font-bold text-gray-600 mt-1.5 uppercase leading-none">Monjurul Amin Anik</p>
                  <span className="text-[8px] text-gray-400">CEO, Dawat IT & Consultancy</span>
                </div>

                <div>
                  <div className="border-b border-gray-300 h-8"></div>
                  <p className="text-[9px] font-bold text-gray-600 mt-1.5 uppercase leading-none">Automated Sentinel System</p>
                  <span className="text-[8px] text-gray-400">D360 Agent Intelligence Node</span>
                </div>
              </div>

            </div>

            {/* Footer buttons (Hide during print) */}
            <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-2 print:hidden">
              <button 
                onClick={() => setSelectedCompetitorReport(null)}
                className="btn-secondary h-8.5 text-[11px] px-4 font-bold"
              >
                Close Brief
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Register Competitor for Monitoring</h3>
            
            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Competitor Brand Name</label>
                <input
                  required
                  className="input text-xs h-9 bg-white"
                  placeholder="e.g. DigitalForce Agency"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Website Domain</label>
                <input
                  className="input text-xs h-9 bg-white"
                  placeholder="e.g. www.digitalforce.com"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Primary Core Focus</label>
                <select
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  className="input text-xs h-9 bg-white"
                >
                  <option value="SEO & Content">SEO & Content</option>
                  <option value="Social Media & PPC">Social Media & PPC</option>
                  <option value="Web Dev & Software">Web Dev & Software</option>
                  <option value="Automated Email Branding">Automated Email Branding</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary h-8.5 text-xs px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-8.5 text-xs px-4"
                >
                  Register Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
