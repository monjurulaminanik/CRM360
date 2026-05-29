import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const TIERS    = [{ value: 'basic', label: 'Starter' }, { value: 'standard', label: 'Growth' }, { value: 'premium', label: 'Pro' }, { value: 'enterprise', label: 'Custom' }];
const STATUSES = [{ value: 'active', label: 'Active' }, { value: 'on_hold', label: 'Paused' }, { value: 'inactive', label: 'Inactive' }, { value: 'churned', label: 'Churned' }];
const BIZ_TYPES= [{ value: 'startup', label: 'Startup' }, { value: 'sme', label: 'SME' }, { value: 'enterprise', label: 'Enterprise' }, { value: 'individual', label: 'Individual' }, { value: 'ngo', label: 'NGO' }];
const SERVICES = [
  { value: 'seo', label: 'SEO' }, { value: 'social_media_marketing', label: 'Social Media' },
  { value: 'ppc', label: 'PPC / Ads' }, { value: 'web_design', label: 'Web Design' },
  { value: 'web_development', label: 'Web Dev' }, { value: 'content_marketing', label: 'Content' },
  { value: 'email_marketing', label: 'Email Marketing' }, { value: 'branding', label: 'Branding' },
  { value: 'video_marketing', label: 'Video' }, { value: 'other', label: 'Other' },
];

export default function ClientFormModal({ open, onClose, client, onSave, isSaving }) {
  const isEdit = Boolean(client);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    reset(client ? {
      name:         client.name || '',
      email:        client.email || '',
      phone:        client.phone || '',
      whatsappNumber: client.whatsappNumber || '',
      company:      client.company || '',
      website:      client.website || '',
      industry:     client.industry || '',
      businessType: client.businessType || '',
      tier:         client.tier || 'standard',
      status:       client.status || 'active',
      notes:        client.notes || '',
      renewalDate:  client.renewalDate ? client.renewalDate.slice(0, 10) : '',
      healthScore:  client.healthScore ?? 75,
    } : {
      tier:   'standard',
      status: 'active',
      healthScore: 75,
    });
  }, [open, client, reset]);

  const onSubmit = (data) => {
    const payload = {
      name:           data.name,
      email:          data.email || undefined,
      phone:          data.phone || undefined,
      whatsappNumber: data.whatsappNumber || undefined,
      company:        data.company || undefined,
      website:        data.website || undefined,
      industry:       data.industry || undefined,
      businessType:   data.businessType || undefined,
      tier:           data.tier,
      status:         data.status,
      notes:          data.notes || undefined,
      renewalDate:    data.renewalDate || undefined,
      healthScore:    Number(data.healthScore) || 75,
    };
    onSave(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Client' : 'Add New Client'}
      description={isEdit ? 'Update client information' : 'Fill in the details to create a new client record'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSaving}>
            {isEdit ? 'Save Changes' : 'Create Client'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Name + Company */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Full Name <span className="text-danger">*</span></label>
            <input className={`input ${errors.name ? '!border-danger' : ''}`} placeholder="John Smith"
              {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Company / Business</label>
            <input className="input" placeholder="Acme Corp" {...register('company')} />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Email</label>
            <input type="email" className={`input ${errors.email ? '!border-danger' : ''}`} placeholder="john@acme.com"
              {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">WhatsApp Number</label>
            <input className="input" placeholder="+880 1700-000000" {...register('whatsappNumber')} />
          </div>
        </div>

        {/* Website + Industry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Website</label>
            <input className="input" placeholder="https://acme.com" {...register('website')} />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Industry</label>
            <input className="input" placeholder="E-commerce, Healthcare..." {...register('industry')} />
          </div>
        </div>

        {/* Business type + Tier + Status */}
        <div className="grid grid-cols-3 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Business Type</label>
            <select className="input" {...register('businessType')}>
              <option value="">Select...</option>
              {BIZ_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Package</label>
            <select className="input" {...register('tier')}>
              {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Status</label>
            <select className="input" {...register('status')}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Renewal + Health Score */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Renewal Date</label>
            <input type="date" className="input" {...register('renewalDate')} />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Health Score (0–100)</label>
            <input type="number" min="0" max="100" className="input" placeholder="75" {...register('healthScore')} />
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="text-sm font-medium text-dark">Notes</label>
          <textarea className="input h-20 resize-none" placeholder="Internal notes about this client..." {...register('notes')} />
        </div>

      </form>
    </Modal>
  );
}
