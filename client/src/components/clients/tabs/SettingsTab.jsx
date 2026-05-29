import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Link2, Shield, Bell, Zap, Copy, CheckCircle2, ExternalLink, Loader2, Globe, Mail } from 'lucide-react';
import { clientService } from '../../../services/clientService';
import ClientFormModal from '../ClientFormModal';
import Button from '../../ui/Button';
import toast from 'react-hot-toast';

const SERVICE_OPTIONS = [
  { value: 'seo',                   label: 'SEO' },
  { value: 'social_media_marketing',label: 'Social Media Marketing' },
  { value: 'ppc',                   label: 'PPC / Paid Ads' },
  { value: 'web_design',            label: 'Web Design' },
  { value: 'web_development',       label: 'Web Development' },
  { value: 'content_marketing',     label: 'Content Marketing' },
  { value: 'email_marketing',       label: 'Email Marketing' },
  { value: 'branding',              label: 'Branding' },
  { value: 'video_marketing',       label: 'Video Marketing' },
];

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="form-group">
      <label className="text-sm font-medium text-dark">{label}</label>
      <div className="flex gap-2">
        <input readOnly value={value} className="input flex-1 font-mono text-xs text-gray-600 bg-gray-50" />
        <button onClick={copy} className={`px-3 h-9 rounded-lg border text-xs font-medium transition-all ${copied ? 'border-success text-success bg-success/5' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'}`}>
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function SettingsTab({ client, onClientUpdated }) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [magicLink, setMagicLink] = useState('');

  const updateMutation = useMutation(
    (data) => clientService.update(client._id, data),
    {
      onSuccess: (res) => {
        queryClient.setQueryData(['client', client._id], res);
        queryClient.invalidateQueries('clients');
        setEditOpen(false);
        toast.success('Client updated');
        onClientUpdated?.();
      },
      onError: () => toast.error('Failed to update client'),
    }
  );

  const magicLinkMutation = useMutation(
    () => clientService.generateMagicLink(client._id),
    {
      onSuccess: (res) => { setMagicLink(res.data.link); toast.success('Magic link generated'); },
      onError: () => toast.error('Failed to generate magic link'),
    }
  );

  return (
    <div className="space-y-6">
      {/* Edit client info */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-dark">Client Information</h3>
            <p className="text-xs text-gray-400 mt-0.5">Update name, contact, tier, and billing details</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit Client Info</Button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Company',     client.company   || '—'],
            ['Industry',    client.industry  || '—'],
            ['Tier/Package',client.tier === 'basic' ? 'Starter' : client.tier === 'standard' ? 'Growth' : client.tier === 'premium' ? 'Pro' : 'Custom'],
            ['Pref. Contact',client.preferredContact || 'WhatsApp'],
          ].map(([l, v]) => (
            <div key={l} className="p-3 bg-gray-50 rounded-xl">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{l}</div>
              <div className="font-medium text-dark capitalize">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Portal access */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-dark">Client Portal</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Generate a magic link so {client.name} can access their personalized reporting portal — no login required.
        </p>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-5 rounded-full transition-all cursor-pointer ${client.portalAccess ? 'bg-primary' : 'bg-gray-200'}`}
            onClick={() => updateMutation.mutate({ portalAccess: !client.portalAccess })}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mt-0.5 ${client.portalAccess ? 'ml-5' : 'ml-0.5'}`} />
          </div>
          <span className="text-sm text-dark font-medium">{client.portalAccess ? 'Portal Enabled' : 'Portal Disabled'}</span>
        </div>

        <div className="mt-4 space-y-3">
          <Button variant="outline" size="sm" loading={magicLinkMutation.isLoading}
            onClick={() => magicLinkMutation.mutate()}>
            <Link2 size={14} /> Generate Magic Link
          </Button>
          {magicLink && <CopyField label="Magic Link (share with client)" value={magicLink} />}
          {client.portalEmail && <CopyField label="Portal Email" value={client.portalEmail} />}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-dark">Notifications</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Monthly report reminder',    desc: 'Notify team when report is due' },
            { label: 'Renewal date alert',          desc: '7 days before renewal' },
            { label: 'Campaign performance drops', desc: 'Alert if ROAS drops below 2×' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="text-sm font-medium text-dark">{label}</div>
                <div className="text-[10px] text-gray-400">{desc}</div>
              </div>
              <button onClick={() => toast('Notification settings coming soon', { icon: '🔔' })}
                className="w-10 h-5 rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300 transition-all">
                <div className="w-4 h-4 bg-white rounded-full shadow mt-0.5 ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Automations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={15} className="text-primary" />
          <h3 className="text-sm font-semibold text-dark">Automations</h3>
        </div>
        <div className="space-y-2">
          {[
            'Auto-send monthly WhatsApp report',
            'Birthday greeting automation',
            'Renewal reminder sequence',
            'Campaign alert Webhook',
          ].map((label) => (
            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl opacity-60">
              <span className="text-sm text-dark">{label}</span>
              <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      <ClientFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
        onSave={(data) => updateMutation.mutate(data)}
        isSaving={updateMutation.isLoading}
      />
    </div>
  );
}
