import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Target, UserPlus, Users, DollarSign,
  TrendingUp, TrendingDown, Plus, MessageCircle,
  FileText, Clock, Zap, ListTodo,
  CircleCheck, Megaphone, ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { leadService } from '../services/leadService';
import { clientService } from '../services/clientService';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// ─── Config ──────────────────────────────────────────────────────────────────

const DATE_RANGES = ['Today', 'This Week', 'This Month', 'Custom'];

const PIPELINE_STAGES = [
  { key: 'new',         label: 'New',         color: '#3B82F6', bg: 'bg-blue-500'    },
  { key: 'contacted',   label: 'Contacted',   color: '#8B5CF6', bg: 'bg-violet-500'  },
  { key: 'qualified',   label: 'Qualified',   color: '#F59E0B', bg: 'bg-amber-500'   },
  { key: 'proposal',    label: 'Proposal',    color: '#F97316', bg: 'bg-orange-500'  },
  { key: 'negotiation', label: 'Negotiation', color: '#6366F1', bg: 'bg-indigo-500'  },
  { key: 'won',         label: 'Won',         color: '#10B981', bg: 'bg-emerald-500' },
];

// Sample data — replace with real API endpoints when available
const NOW = Date.now();
const SAMPLE_ACTIVITY = [
  { id: 1, Icon: UserPlus,      bg: 'bg-blue-100',    color: 'text-blue-600',    text: 'New lead added from Facebook Ads',       time: new Date(NOW - 8   * 60000)   },
  { id: 2, Icon: CircleCheck,   bg: 'bg-emerald-100', color: 'text-emerald-600', text: 'Proposal sent to TechCorp Ltd.',         time: new Date(NOW - 35  * 60000)   },
  { id: 3, Icon: MessageCircle, bg: 'bg-green-100',   color: 'text-green-600',   text: 'WhatsApp blast sent to 48 contacts',     time: new Date(NOW - 2   * 3600000) },
  { id: 4, Icon: DollarSign,    bg: 'bg-violet-100',  color: 'text-violet-600',  text: 'Invoice BDT 45,000 marked as paid',      time: new Date(NOW - 4   * 3600000) },
  { id: 5, Icon: Megaphone,     bg: 'bg-amber-100',   color: 'text-amber-600',   text: '"Eid Special" campaign launched',        time: new Date(NOW - 6   * 3600000) },
  { id: 6, Icon: UserPlus,      bg: 'bg-primary-light', color: 'text-primary',   text: 'Rahman & Co. converted to client',       time: new Date(NOW - 9   * 3600000) },
];

const SAMPLE_TASKS = [
  { id: 1, title: 'Follow up: Rahman & Co.',       deadline: new Date(NOW + 1.5 * 3600000), priority: 'high'   },
  { id: 2, title: 'Send proposal to TechHub BD',   deadline: new Date(NOW + 1   * 86400000), priority: 'medium' },
  { id: 3, title: 'Monthly report — Nahar Digital',deadline: new Date(NOW + 2   * 86400000), priority: 'low'    },
  { id: 4, title: 'Review WhatsApp metrics',       deadline: new Date(NOW + 3   * 86400000), priority: 'medium' },
  { id: 5, title: 'Client check-in: BSB Group',    deadline: new Date(NOW + 5   * 86400000), priority: 'low'    },
];

const SAMPLE_CAMPAIGNS = [
  { id: 1, name: 'Eid Promo 2026',    channel: 'WhatsApp', status: 'active', sent: 145, opened: 89  },
  { id: 2, name: 'Q2 Newsletter',     channel: 'Email',    status: 'active', sent: 320, opened: 201 },
  { id: 3, name: 'Lead Nurture Seq.', channel: 'WhatsApp', status: 'paused', sent: 78,  opened: 43  },
];

// Static trends — swap with real historical API data when available
const TRENDS = { leads: 12, newLeads: 8, clients: 5, revenue: 18 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSparkline(current, points = 9) {
  if (!current) return Array(points).fill({ v: 0 });
  let seed = current + 7;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  return Array.from({ length: points }, (_, i) => ({
    v: i === points - 1
      ? current
      : Math.max(0, Math.round(current * (0.45 + (i / points) * 0.55) + (rng() - 0.5) * current * 0.25)),
  }));
}

function getGreeting(lang = 'en') {
  const h = new Date().getHours();
  if (lang === 'bn') {
    return h < 12 ? 'শুভ সকাল' : h < 17 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা';
  }
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// ─── useCountUp ───────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1100) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (!target && target !== 0) return;

    let t0 = null;
    const animate = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value = 0, prefix = '', suffix = '', iconBg, iconColor, sparkColor, trendKey, loading, to }) {
  const counted   = useCountUp(loading ? 0 : value);
  const sparkData = useMemo(() => makeSparkline(value), [value]);
  const trend     = TRENDS[trendKey] ?? 0;
  const up        = trend >= 0;

  const display = loading ? '—'
    : prefix + (value > 9999 ? counted.toLocaleString() : String(counted)) + suffix;

  return (
    <Link to={to} className="group block">
      <Card hover className="h-full overflow-hidden cursor-pointer">
        <div className="p-5 relative">
          {/* Sparkline background */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${trendKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={sparkColor} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.5}
                  fill={`url(#spark-${trendKey})`} dot={false} isAnimationActive={!loading} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} strokeWidth={2} />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-danger'
              }`}>
                {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(trend)}%
              </div>
            </div>

            {loading ? (
              <div className="space-y-2 mt-1">
                <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-3 w-28 bg-gray-50 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-dark font-heading leading-none">{display}</div>
                <div className="text-sm text-gray-500 font-medium mt-1.5">{label}</div>
                <div className={`text-[10px] mt-0.5 ${up ? 'text-emerald-500' : 'text-danger'}`}>
                  {up ? '↑' : '↓'} {Math.abs(trend)}% vs last month
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── PriorityDot ──────────────────────────────────────────────────────────────

const PriorityDot = ({ priority }) => (
  <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
    priority === 'high' ? 'bg-danger' : priority === 'medium' ? 'bg-warning' : 'bg-gray-300'
  }`} />
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-dropdown px-3 py-1.5 text-xs font-semibold text-dark">
      {payload[0].payload.label}: {payload[0].value}
    </div>
  );
};

// ─── DashboardPage ────────────────────────────────────────────────────────────
import ClientPortalPage from './ClientPortalPage';
import EmployeeDashboardPage from './EmployeeDashboardPage';

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  if (user?.role === 'client') {
    return <ClientPortalPage />;
  }

  if (user?.role === 'employee') {
    return <EmployeeDashboardPage />;
  }
  
  const [dateRange, setDateRange] = useState('This Month');
  const { language, setLanguage, t } = useLanguageStore();

  const { data: leadData,   isLoading: leadLoading   } = useQuery('lead-stats',   leadService.getStats);
  const { data: clientData, isLoading: clientLoading } = useQuery('client-stats', clientService.getStats);

  const pipelineMap    = Object.fromEntries((leadData?.data?.pipeline || []).map((s) => [s._id, s.count]));
  const totalLeads     = Object.values(pipelineMap).reduce((a, b) => a + b, 0);
  const newLeads       = pipelineMap['new'] || 0;
  const wonLeads       = pipelineMap['won'] || 0;
  const activeClients  = clientData?.data?.byStatus?.find((s) => s._id === 'active')?.count || 0;
  const monthlyRevenue = clientData?.data?.monthlyRevenue || 0;

  const pipelineData = PIPELINE_STAGES.map(({ key, label, color, bg }) => ({
    key, label, color, bg,
    count: pipelineMap[key] || 0,
    pct:   totalLeads > 0 ? Math.round(((pipelineMap[key] || 0) / totalLeads) * 100) : 0,
  }));

  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="page-container space-y-6">

      {/* ══ Header ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-[1.45rem] font-bold text-dark leading-tight">
            {getGreeting(language)}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {t('overviewSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dashboard Language Switcher */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                language === 'bn' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'
              }`}
            >
              বাংলা
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start shrink-0">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  dateRange === r ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Stat Cards ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Target}     label={t('totalLeads')}     value={totalLeads}     trendKey="leads"
          iconBg="bg-blue-50"     iconColor="text-blue-600"     sparkColor="#3B82F6"  to="/leads"            loading={leadLoading}   />
        <StatCard icon={UserPlus}   label={t('newThisMonth')}  value={newLeads}       trendKey="newLeads"
          iconBg="bg-emerald-50"  iconColor="text-emerald-600"  sparkColor="#10B981"  to="/leads?status=new" loading={leadLoading}   />
        <StatCard icon={Users}      label={t('activeClients')}  value={activeClients}  trendKey="clients"
          iconBg="bg-violet-50"   iconColor="text-violet-600"   sparkColor="#8B5CF6"  to="/clients"          loading={clientLoading} />
        <StatCard icon={DollarSign} label={t('mrr')} value={monthlyRevenue} trendKey="revenue"
          prefix="৳"
          iconBg="bg-orange-50"   iconColor="text-orange-500"   sparkColor="#F97316"  to="/clients"          loading={clientLoading} />
      </div>

      {/* ══ Middle: Pipeline + Activity ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Lead Pipeline — 3 cols */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-dark">{t('leadPipeline')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {totalLeads} leads · {winRate}% win rate
                  </p>
                </div>
                <Link to="/leads">
                  <Button variant="ghost" size="xs" iconRight={<ArrowUpRight size={12} />}>
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {leadLoading ? (
                <div className="flex justify-center py-12"><LoadingSpinner /></div>
              ) : totalLeads === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <Target size={24} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-dark mb-1">No leads yet</p>
                  <p className="text-xs text-gray-400 mb-4">Add your first lead to see pipeline data here</p>
                  <Link to="/leads">
                    <Button variant="primary" size="sm" icon={<Plus size={13} />}>Add First Lead</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Progress bars */}
                  <div className="space-y-3 mb-6">
                    {pipelineData.map(({ key, label, bg, count, pct }) => (
                      <Link key={key} to={`/leads?status=${key}`} className="block group/row">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${bg}`} />
                            <span className="text-sm font-medium text-dark group-hover/row:text-primary transition-colors duration-150">
                              {label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 tabular-nums">{pct}%</span>
                            <span className="text-xs font-bold text-dark tabular-nums w-5 text-right">{count}</span>
                            <ChevronRight size={12} className="text-gray-200 group-hover/row:text-primary transition-colors duration-150" />
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${bg}`}
                               style={{ width: `${pct}%` }} />
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Recharts bar chart */}
                  <div className="border-t border-gray-50 pt-4">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-3">
                      Stage Distribution
                    </p>
                    <ResponsiveContainer width="100%" height={72}>
                      <BarChart data={pipelineData} barSize={22} margin={{ top: 0, right: 4, bottom: 0, left: 4 }}>
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive>
                          {pipelineData.map(({ key, color }) => <Cell key={key} fill={color} />)}
                        </Bar>
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }}
                               axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Recent Activity — 2 cols */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <Card.Header>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-dark">{t('recentActivity')}</p>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('live')}
                </span>
              </div>
            </Card.Header>
            <Card.Body className="!py-3">
              <div className="space-y-0">
                {SAMPLE_ACTIVITY.map(({ id, Icon, bg, color, text, time }, i) => (
                  <div key={id} className="flex gap-3 group cursor-default">
                    {/* Icon + connector */}
                    <div className="flex flex-col items-center pt-0.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                        <Icon size={13} className={color} strokeWidth={2} />
                      </div>
                      {i < SAMPLE_ACTIVITY.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 my-1 min-h-[12px]" />
                      )}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0 pb-3 pt-0.5">
                      <p className="text-xs font-medium text-dark leading-snug group-hover:text-primary transition-colors duration-150">
                        {text}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatDistanceToNow(time, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full text-xs text-primary hover:text-primary-dark font-medium transition-colors duration-200 pt-1 text-center">
                View all activity →
              </button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ══ Bottom: Tasks + Campaigns + Quick Actions ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Upcoming Tasks */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-dark">{t('pendingTasks')}</p>
              </div>
              <Badge variant="info" size="sm">{SAMPLE_TASKS.length}</Badge>
            </div>
          </Card.Header>
          <Card.Body className="!py-2 space-y-0.5">
            {SAMPLE_TASKS.map(({ id, title, deadline, priority }) => (
              <div key={id} className="flex items-start gap-2.5 py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <PriorityDot priority={priority} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark leading-snug group-hover:text-primary transition-colors duration-150 truncate">
                    {title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock size={9} />
                    {formatDistanceToNow(deadline, { addSuffix: true })}
                  </p>
                </div>
                <CircleCheck
                  size={14}
                  className="text-gray-200 hover:text-emerald-500 transition-colors duration-200 shrink-0 mt-0.5 cursor-pointer"
                />
              </div>
            ))}
            <button className="w-full text-xs text-primary hover:text-primary-dark font-medium transition-colors duration-200 py-2 text-center">
              + Add task
            </button>
          </Card.Body>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-dark">{t('activeCampaigns')}</p>
              </div>
              <Badge variant="success" dot size="sm">{t('live')}</Badge>
            </div>
          </Card.Header>
          <Card.Body className="!py-2 space-y-1">
            {SAMPLE_CAMPAIGNS.map(({ id, name, channel, status, sent, opened }) => {
              const rate = Math.round((opened / sent) * 100);
              return (
                <div key={id} className="px-1 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-dark truncate">{name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-400">{channel}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <Badge variant={status === 'active' ? 'success' : 'default'} dot size="sm">
                          {status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-dark">{rate}%</p>
                      <p className="text-[10px] text-gray-400">open rate</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">
                    {opened.toLocaleString()} opened / {sent.toLocaleString()} sent
                  </p>
                </div>
              );
            })}
          </Card.Body>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-gray-400" />
              <p className="text-sm font-semibold text-dark">{t('quickActions')}</p>
            </div>
          </Card.Header>
          <Card.Body className="space-y-2">
            {[
              { label: '+ New Lead',       Icon: UserPlus,      to: '/leads',    cls: 'btn-primary'   },
              { label: '+ New Client',     Icon: Users,         to: '/clients',  cls: 'btn-primary'   },
              { label: '+ Create Invoice', Icon: FileText,      to: '/clients',  cls: 'btn-secondary' },
              { label: '+ Send WhatsApp',  Icon: MessageCircle, to: '/whatsapp', cls: 'btn-secondary' },
            ].map(({ label, Icon, to, cls }) => (
              <Link key={label} to={to} className={`${cls} w-full gap-2 text-xs`}>
                <Icon size={13} />
                {label}
              </Link>
            ))}

            {/* Mini KPI strip */}
            <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-gray-50">
              {[
                { label: 'Leads Won',  value: wonLeads || 0                                         },
                { label: 'Lost',       value: pipelineMap['lost'] || 0                              },
                { label: 'Clients',    value: activeClients                                          },
                { label: 'Revenue',    value: monthlyRevenue ? `${(monthlyRevenue/1000).toFixed(0)}K` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-base font-bold text-dark font-heading">{value}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

    </div>
  );
}
