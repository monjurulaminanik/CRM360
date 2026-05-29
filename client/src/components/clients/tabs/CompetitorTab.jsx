import { useState } from 'react';
import { Plus, Globe, TrendingUp, Eye, Trash2, ExternalLink, Search } from 'lucide-react';
import Button from '../../ui/Button';
import toast from 'react-hot-toast';

const SAMPLE_COMPETITORS = [
  { id: 1, name: 'DigitalEdge BD',   website: 'digitaledge.com.bd',  since: '2026-04-01', lastAd: '2 days ago',  adCount: 14, fbPage: true },
  { id: 2, name: 'WebCraft Agency',  website: 'webcraft.agency',      since: '2026-04-01', lastAd: '5 days ago',  adCount: 8,  fbPage: true },
  { id: 3, name: 'Growth Masters',   website: 'growthmasters.io',     since: '2026-05-10', lastAd: '1 week ago',  adCount: 3,  fbPage: false },
];

function CompetitorCard({ comp, onDelete }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 hover:border-primary/30 transition-all bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Globe size={16} className="text-gray-500" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-dark text-sm">{comp.name}</div>
            <a href={`https://${comp.website}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {comp.website} <ExternalLink size={10} />
            </a>
          </div>
        </div>
        <button onClick={() => onDelete(comp.id)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-danger hover:bg-red-50 transition-all">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
          <Eye size={11} />{comp.adCount} Active Ads
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
          <TrendingUp size={11} />Last ad: {comp.lastAd}
        </div>
        {comp.fbPage && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
            FB Ads Library
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={() => toast('Competitor ad tracking coming soon', { icon: '🔍' })}
          className="flex-1 text-xs font-semibold text-primary bg-primary-light hover:bg-primary/20 py-1.5 rounded-lg transition-all">
          View Ads
        </button>
        <button onClick={() => toast('Competitor monitoring coming soon', { icon: '📊' })}
          className="flex-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 py-1.5 rounded-lg transition-all">
          Monitor
        </button>
      </div>
    </div>
  );
}

function AddCompetitorModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-dark mb-4">Add Competitor</h3>
        <div className="space-y-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Company Name</label>
            <input className="input" placeholder="Competitor Inc." value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Website</label>
            <input className="input" placeholder="competitor.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={() => { if (name) { onAdd({ name, website }); onClose(); } }} className="btn-primary flex-1 text-sm">Add</button>
        </div>
      </div>
    </div>
  );
}

export default function CompetitorTab({ client }) {
  const [competitors, setCompetitors] = useState(SAMPLE_COMPETITORS);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = (id) => setCompetitors((c) => c.filter((x) => x.id !== id));
  const handleAdd = ({ name, website }) => {
    setCompetitors((c) => [...c, { id: Date.now(), name, website, since: new Date().toISOString(), lastAd: 'Never', adCount: 0, fbPage: false }]);
    toast.success('Competitor added');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Track {client.company || client.name}'s competitors — monitor their ads, posts, and activity.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add Competitor
        </Button>
      </div>

      <div className="grid gap-3">
        {competitors.map((comp) => (
          <CompetitorCard key={comp.id} comp={comp} onDelete={handleDelete} />
        ))}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
        <strong>Coming soon:</strong> Automatic competitor ad tracking via Facebook Ads Library API, keyword monitoring, and weekly competitor intel reports.
      </div>

      <AddCompetitorModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
