import { useState } from 'react';
import { FilePlus2, Download, Send, CheckCircle2, Clock, AlertCircle, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import toast from 'react-hot-toast';

const SAMPLE_INVOICES = [
  { id: 'INV-2026-006', date: '2026-06-01', dueDate: '2026-06-15', amount: 50000, status: 'pending',  services: ['SEO', 'Social Media', 'PPC'] },
  { id: 'INV-2026-005', date: '2026-05-01', dueDate: '2026-05-15', amount: 45000, status: 'paid',     services: ['SEO', 'Social Media'], paidAt: '2026-05-10' },
  { id: 'INV-2026-004', date: '2026-04-01', dueDate: '2026-04-15', amount: 45000, status: 'paid',     services: ['SEO', 'Social Media'], paidAt: '2026-04-12' },
  { id: 'INV-2026-003', date: '2026-03-01', dueDate: '2026-03-15', amount: 40000, status: 'paid',     services: ['SEO', 'Web Dev'],       paidAt: '2026-03-09' },
  { id: 'INV-2026-002', date: '2026-02-01', dueDate: '2026-02-20', amount: 40000, status: 'overdue',  services: ['SEO'] },
  { id: 'INV-2026-001', date: '2026-01-01', dueDate: '2026-01-20', amount: 35000, status: 'paid',     services: ['SEO'], paidAt: '2026-01-18' },
];

const STATUS_CFG = {
  paid:    { label: 'Paid',    variant: 'success', icon: CheckCircle2 },
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  overdue: { label: 'Overdue', variant: 'danger',  icon: AlertCircle },
  draft:   { label: 'Draft',   variant: 'default', icon: FilePlus2 },
};

export default function InvoicesTab({ client }) {
  const [filter, setFilter] = useState('all');

  const invoices = filter === 'all' ? SAMPLE_INVOICES : SAMPLE_INVOICES.filter((i) => i.status === filter);

  const totalPaid    = SAMPLE_INVOICES.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = SAMPLE_INVOICES.filter((i) => ['pending', 'overdue'].includes(i.status)).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Collected', value: `৳${totalPaid.toLocaleString()}`,   icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending / Due',   value: `৳${totalPending.toLocaleString()}`, icon: Clock,        color: 'bg-amber-50 text-amber-600' },
          { label: 'Invoices Sent',   value: SAMPLE_INVOICES.length,              icon: FilePlus2,    color: 'bg-blue-50 text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={15} /></div>
            <div><div className="text-base font-bold text-dark leading-tight">{value}</div><div className="text-[10px] text-gray-400">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Filter + create */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {['all', 'paid', 'pending', 'overdue'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:text-dark'}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={() => toast('Invoice builder coming soon', { icon: '🧾' })}>
          <FilePlus2 size={14} /> Create Invoice
        </Button>
      </div>

      {/* Invoice table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Services</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((inv) => {
              const cfg = STATUS_CFG[inv.status];
              return (
                <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-dark text-xs">{inv.id}</div>
                    {inv.paidAt && <div className="text-[10px] text-gray-400">Paid {format(new Date(inv.paidAt), 'dd MMM yyyy')}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                    {format(new Date(inv.date), 'dd MMM yyyy')}
                    <div className="text-gray-400">Due {format(new Date(inv.dueDate), 'dd MMM')}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {inv.services.map((s) => (
                        <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-dark">৳{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toast('Download coming soon', { icon: '⬇️' })}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <Download size={13} />
                      </button>
                      {inv.status === 'pending' && (
                        <button onClick={() => toast('Send reminder coming soon', { icon: '📨' })}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                          <Send size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Sample invoices shown — full invoice management coming in a future update.
      </p>
    </div>
  );
}
