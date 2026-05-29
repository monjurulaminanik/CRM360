import { TrendingUp, Award, Clock, DollarSign, Zap, Star } from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';

const SERVICE_LABELS = {
  seo: 'SEO', social_media_marketing: 'Social Media Marketing', ppc: 'PPC / Paid Ads',
  web_design: 'Web Design', web_development: 'Web Development', content_marketing: 'Content Marketing',
  email_marketing: 'Email Marketing', branding: 'Branding', video_marketing: 'Video Marketing', other: 'Other',
};

function HealthSegment({ label, score, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          <span className="text-xs font-semibold text-dark">{score}/25</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${(score / 25) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color = 'bg-primary-light text-primary' }) {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-base font-bold text-dark leading-tight">{value}</div>
        <div className="text-[10px] text-gray-400 font-medium">{label}</div>
        {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
      </div>
    </div>
  );
}

export default function OverviewTab({ client }) {
  const health = client.healthScore ?? 75;
  const retentionMonths = differenceInMonths(new Date(), new Date(client.createdAt));
  const mrr = (client.activeServices || []).reduce((s, svc) => s + (svc.monthlyRetainer || 0), 0);
  const ltv = mrr * Math.max(retentionMonths, 1);

  // Health breakdown (approximate from available data)
  const h1 = Math.round(Math.min(25, health * 0.28)); // Responsiveness
  const h2 = Math.round(Math.min(25, (client.activeServices?.length || 0) * 8));
  const h3 = Math.round(Math.min(25, client.status === 'active' ? 22 : client.status === 'on_hold' ? 12 : 3));
  const h4 = Math.round(Math.min(25, health - h1 - h2 - h3));

  const milestones = [
    { label: 'Client Onboarded',   date: client.createdAt,    done: true },
    { label: 'First Campaign Live', date: null,                done: (client.activeServices?.length || 0) > 0 },
    { label: '3-Month Retention',   date: null,                done: retentionMonths >= 3 },
    { label: '6-Month Milestone',   date: null,                done: retentionMonths >= 6 },
    { label: 'Annual Client',       date: null,                done: retentionMonths >= 12 },
  ];

  return (
    <div className="space-y-5">
      {/* Key metrics */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={DollarSign}  label="Monthly Retainer" value={mrr > 0 ? `৳${mrr.toLocaleString()}` : '—'} color="bg-emerald-50 text-emerald-600" />
          <MetricCard icon={TrendingUp}  label="Lifetime Value"    value={ltv > 0 ? `৳${ltv.toLocaleString()}` : '—'} color="bg-blue-50 text-blue-600" />
          <MetricCard icon={Clock}       label="Retention"         value={`${retentionMonths}mo`} sub={`Since ${format(new Date(client.createdAt), 'MMM yyyy')}`} color="bg-violet-50 text-violet-600" />
          <MetricCard icon={Zap}         label="Active Services"   value={client.activeServices?.length || 0} sub="running now" color="bg-amber-50 text-amber-600" />
        </div>
      </div>

      {/* Health score */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Health Score</h3>
          <span className={`text-sm font-bold ${health >= 75 ? 'text-success' : health >= 45 ? 'text-warning' : 'text-danger'}`}>
            {health}/100
          </span>
        </div>
        <div className="mb-3">
          <div className="h-2.5 bg-gray-100 rounded-full">
            <div className={`h-full rounded-full transition-all ${health >= 75 ? 'bg-success' : health >= 45 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${health}%` }} />
          </div>
        </div>
        <div className="space-y-2.5">
          <HealthSegment label="Responsiveness"    score={h1} color="bg-blue-400" />
          <HealthSegment label="Service Coverage"  score={h2} color="bg-emerald-400" />
          <HealthSegment label="Account Status"    score={h3} color="bg-violet-400" />
          <HealthSegment label="Engagement"        score={h4} color="bg-amber-400" />
        </div>
      </div>

      {/* Active services */}
      {client.activeServices?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Services</h3>
          <div className="space-y-2">
            {client.activeServices.map((svc, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm font-medium text-dark">{SERVICE_LABELS[svc.service] || svc.service}</span>
                  {svc.startDate && (
                    <span className="text-xs text-gray-400">since {format(new Date(svc.startDate), 'MMM yyyy')}</span>
                  )}
                </div>
                {svc.monthlyRetainer > 0 && (
                  <span className="text-sm font-semibold text-dark">৳{svc.monthlyRetainer.toLocaleString()}/mo</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Milestones</h3>
        <div className="space-y-2">
          {milestones.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${m.done ? 'bg-success/5' : 'bg-gray-50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${m.done ? 'bg-success text-white' : 'bg-gray-200'}`}>
                {m.done ? <Award size={11} /> : <span className="text-[10px] text-gray-400">{i + 1}</span>}
              </div>
              <span className={`text-sm ${m.done ? 'font-medium text-dark' : 'text-gray-400'}`}>{m.label}</span>
              {m.done && m.date && <span className="ml-auto text-xs text-gray-400">{format(new Date(m.date), 'MMM yyyy')}</span>}
              {!m.done && <span className="ml-auto text-[10px] text-gray-300">Locked</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
