import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const SOURCES = [
  { value: 'whatsapp',     label: 'WhatsApp' },
  { value: 'website',      label: 'Website' },
  { value: 'facebook',     label: 'Facebook' },
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'messenger',    label: 'Messenger' },
  { value: 'referral',     label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call',    label: 'Cold Call' },
  { value: 'email',        label: 'Email' },
  { value: 'other',        label: 'Other' },
];

const STATUSES = [
  { value: 'new',         label: 'New' },
  { value: 'contacted',   label: 'Contacted' },
  { value: 'qualified',   label: 'Qualified' },
  { value: 'proposal',    label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won',         label: 'Won' },
  { value: 'lost',        label: 'Lost' },
];

export default function LeadFormModal({ open, onClose, lead, onSave, isSaving }) {
  const isEdit = Boolean(lead);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!open) return;
    reset(
      lead
        ? {
            name:        lead.name || '',
            email:       lead.email || '',
            phone:       lead.phone || '',
            company:     lead.company || '',
            source:      lead.source || 'whatsapp',
            priority:    lead.priority || 'medium',
            status:      lead.status || 'new',
            notes:       lead.notes || '',
            nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : '',
            budgetMin:   lead.budget?.min || '',
            budgetMax:   lead.budget?.max || '',
          }
        : {
            source:   'whatsapp',
            priority: 'medium',
            status:   'new',
          }
    );
  }, [open, lead, reset]);

  const onSubmit = (data) => {
    const payload = {
      name:    data.name,
      email:   data.email || undefined,
      phone:   data.phone || undefined,
      company: data.company || undefined,
      source:  data.source,
      priority: data.priority,
      status:  data.status,
      notes:   data.notes || undefined,
      nextFollowUp: data.nextFollowUp || undefined,
      budget:
        data.budgetMin || data.budgetMax
          ? { min: Number(data.budgetMin) || 0, max: Number(data.budgetMax) || 0, currency: 'BDT' }
          : undefined,
    };
    onSave(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Lead' : 'Add New Lead'}
      description={isEdit ? 'Update lead information' : 'Fill in the details to create a new lead'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSaving}>
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Name + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              className={`input ${errors.name ? '!border-danger' : ''}`}
              placeholder="John Smith"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Phone</label>
            <input className="input" placeholder="+880 1700-000000" {...register('phone')} />
          </div>
        </div>

        {/* Email + Company */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Email</label>
            <input
              type="email"
              className={`input ${errors.email ? '!border-danger' : ''}`}
              placeholder="john@company.com"
              {...register('email', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              })}
            />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Company</label>
            <input className="input" placeholder="Company name" {...register('company')} />
          </div>
        </div>

        {/* Source + Priority + Status */}
        <div className="grid grid-cols-3 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Source</label>
            <select className="input" {...register('source')}>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Priority</label>
            <select className="input" {...register('priority')}>
              <option value="high">🔥 Hot (High)</option>
              <option value="medium">🌡️ Warm (Medium)</option>
              <option value="low">❄️ Cold (Low)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Status</label>
            <select className="input" {...register('status')}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Min Budget (BDT)</label>
            <input
              type="number"
              className="input"
              placeholder="10,000"
              {...register('budgetMin', { min: { value: 0, message: 'Must be positive' } })}
            />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-dark">Max Budget (BDT)</label>
            <input
              type="number"
              className="input"
              placeholder="50,000"
              {...register('budgetMax', { min: { value: 0, message: 'Must be positive' } })}
            />
          </div>
        </div>

        {/* Next Follow-up */}
        <div className="form-group">
          <label className="text-sm font-medium text-dark">Next Follow-up Date</label>
          <input type="date" className="input" {...register('nextFollowUp')} />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="text-sm font-medium text-dark">Notes</label>
          <textarea
            className="input h-20 resize-none"
            placeholder="Any additional notes about this lead..."
            {...register('notes')}
          />
        </div>

      </form>
    </Modal>
  );
}
