import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, Globe,
  MessageCircle, Sparkles, TrendingUp, LayoutGrid,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';

// ── i18n ────────────────────────────────────────────────────────────────────
const T = {
  en: {
    tagline:    'Your Business. One Platform. Zero Chaos.',
    subTagline: 'All-in-One Client Operating System for Dawat IT',
    features: [
      'WhatsApp-native communication',
      'AI-powered insights',
      'Real-time client reporting',
      'All-in-one workspace',
    ],
    welcome:           'Welcome back',
    subtitle:          'Sign in to your D360 workspace',
    emailLabel:        'Email address',
    emailPlaceholder:  'you@dawarit.com',
    passwordLabel:     'Password',
    passwordPlaceholder: '••••••••',
    rememberMe:        'Remember me',
    forgotPassword:    'Forgot password?',
    signIn:            'Sign In',
    poweredBy:         'Powered by Dawat IT & Consultancy',
    required:          'This field is required',
    invalidEmail:      'Enter a valid email address',
    minPassword:       'Password must be at least 6 characters',
  },
  bn: {
    tagline:    'আপনার ব্যবসা। একটি প্ল্যাটফর্ম। শূন্য বিশৃঙ্খলা।',
    subTagline: 'Dawat IT-এর জন্য অল-ইন-ওয়ান ক্লায়েন্ট অপারেটিং সিস্টেম',
    features: [
      'হোয়াটসঅ্যাপ-নেটিভ যোগাযোগ',
      'AI-চালিত অন্তর্দৃষ্টি',
      'রিয়েল-টাইম ক্লায়েন্ট রিপোর্টিং',
      'অল-ইন-ওয়ান ওয়ার্কস্পেস',
    ],
    welcome:           'স্বাগতম',
    subtitle:          'আপনার D360 ওয়ার্কস্পেসে সাইন ইন করুন',
    emailLabel:        'ইমেইল ঠিকানা',
    emailPlaceholder:  'আপনার ইমেইল লিখুন',
    passwordLabel:     'পাসওয়ার্ড',
    passwordPlaceholder: '••••••••',
    rememberMe:        'আমাকে মনে রাখো',
    forgotPassword:    'পাসওয়ার্ড ভুলে গেছেন?',
    signIn:            'সাইন ইন',
    poweredBy:         'Dawat IT & Consultancy দ্বারা পরিচালিত',
    required:          'এই তথ্যটি প্রয়োজন',
    invalidEmail:      'সঠিক ইমেইল ঠিকানা দিন',
    minPassword:       'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
  },
};

const FEATURE_ICONS = [MessageCircle, Sparkles, TrendingUp, LayoutGrid];

// ── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'client' | 'employee'

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const t = T[lang];
  const bn = lang === 'bn';

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      
      if (res.data.user.role === 'superadmin') {
        navigate('/superadmin');
      } else if (res.data.user.role === 'client') {
        navigate('/client-portal');
      } else if (res.data.user.role === 'employee') {
        navigate('/employee-portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleQuickLogin = (email, password) => {
    // 1. Determine tab to select for visual coherence
    if (email === 'superadmin@d360.com' || email === 'anik@dawatit.com') {
      setActiveTab('staff');
    } else if (email === 'client@d360.com') {
      setActiveTab('client');
    } else if (email === 'employee@d360.com') {
      setActiveTab('employee');
    }

    // 2. Set form values for visual feedback
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });

    // 3. Directly call onSubmit to avoid React Hook Form timing issues
    onSubmit({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ══════════════════════════════════════════
          LEFT — Brand Panel (desktop only)
      ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #1D4ED8 100%)' }}
      >
        {/* Background decorations */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/[0.04] blur-xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-72 h-72 rounded-full bg-white/[0.04] blur-lg" />
        <div className="absolute -bottom-24 right-16 w-80 h-80 rounded-full bg-white/[0.05] blur-lg" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
              <span className="text-white font-extrabold text-2xl font-heading tracking-wider">D</span>
            </div>
            <div>
              <span className="text-white text-3xl font-black font-heading tracking-tight block leading-none">D360</span>
              <span className="text-[9px] text-blue-200 tracking-widest uppercase font-semibold mt-1 block">Unified Workspace</span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200 bg-white/10 px-3 py-1 rounded-full w-fit backdrop-blur-xs mb-4">
            Next-Gen SaaS CRM
          </span>
          <h2
            className={`text-4xl font-extrabold text-white leading-tight mb-5 text-balance tracking-tight ${bn ? 'font-bn' : 'font-heading'}`}
          >
            {t.tagline}
          </h2>
          <p className={`text-blue-100/75 text-base leading-relaxed max-w-md ${bn ? 'font-bn' : ''}`}>
            {t.subTagline}
          </p>
        </div>

        {/* Feature tiles */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {t.features.map((label, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-md group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Icon size={16} className="text-white" strokeWidth={2} />
                </div>
                <span className={`text-white/90 text-xs font-semibold leading-snug tracking-wide ${bn ? 'font-bn' : ''}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Login Form
      ══════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white min-h-screen shadow-2xl justify-between overflow-y-auto">
        
        {/* Top Header / Language Switcher */}
        <div className="flex justify-between items-center px-8 pt-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-dark font-black tracking-tight text-lg">D360</span>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1 shadow-inner ml-auto">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                lang === 'en'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-dark'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-bn transition-all duration-200 ${
                lang === 'bn'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-dark'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-[380px] space-y-6">

            {/* Title */}
            <div>
              <h1 className={`text-2xl font-black text-dark tracking-tight leading-none ${bn ? 'font-bn' : 'font-heading'}`}>
                {bn ? 'ওয়ার্কস্পেস সাইন-ইন' : 'Sign in to D360'}
              </h1>
              <p className="text-gray-400 text-xs mt-2">
                {bn ? 'আপনার অ্যাক্সেস পোর্টালটি নির্বাচন করুন এবং সাইন ইন করুন' : 'Select your access portal and sign in to get started'}
              </p>
            </div>

            {/* Portal Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-xl p-1 shadow-inner">
              {[
                { key: 'staff', label: bn ? 'অ্যাডমিন/স্টাফ' : 'Admin/Team' },
                { key: 'client', label: bn ? 'ক্লায়েন্ট' : 'Client' },
                { key: 'employee', label: bn ? 'কর্মচারী' : 'Employee' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    if (tab.key === 'client') {
                      setValue('email', 'client@d360.com');
                    } else if (tab.key === 'employee') {
                      setValue('email', 'employee@d360.com');
                    } else {
                      setValue('email', '');
                    }
                  }}
                  className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-500 hover:text-dark hover:bg-slate-50/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                  <span>{t.emailLabel}</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    placeholder={activeTab === 'staff' ? 'you@dawatit.com' : activeTab === 'client' ? 'client@d360.com' : 'employee@d360.com'}
                    autoComplete="email"
                    className={`w-full rounded-xl border border-slate-200 text-xs p-3 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200 shadow-2xs ${errors.email ? '!border-red-500 focus:!ring-red-500/20' : ''}`}
                    {...register('email', {
                      required: t.required,
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.invalidEmail },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                  <span>{t.passwordLabel}</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.passwordPlaceholder}
                    autoComplete="current-password"
                    className={`w-full rounded-xl border border-slate-200 text-xs p-3 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-200 shadow-2xs ${errors.password ? '!border-red-500 focus:!ring-red-500/20' : ''}`}
                    {...register('password', {
                      required: t.required,
                      minLength: { value: 6, message: t.minPassword },
                    })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  className="rounded-xl shadow-md h-10 font-bold"
                >
                  <span>{t.signIn}</span>
                </Button>
              </div>
            </form>

            {/* Quick Demo Logins Section */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block text-center">
                {bn ? 'এক-ক্লিকে সরাসরি লগইন' : '⚡ Quick Demo Logins (Serial Access)'}
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('superadmin@d360.com', 'Super@D360')}
                  className="flex items-center gap-2 p-2 bg-gradient-to-br from-purple-50 to-white hover:from-purple-100/50 border border-purple-100 hover:border-purple-200 rounded-xl text-left transition-all duration-300 shadow-2xs group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">🔑</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-purple-900 leading-tight">Superadmin</p>
                    <p className="text-[8px] text-purple-400 font-mono truncate">superadmin@d360.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('anik@dawatit.com', 'Admin@D360')}
                  className="flex items-center gap-2 p-2 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100/50 border border-blue-100 hover:border-blue-200 rounded-xl text-left transition-all duration-300 shadow-2xs group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">💼</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-blue-900 leading-tight">Workspace Admin</p>
                    <p className="text-[8px] text-blue-400 font-mono truncate">anik@dawatit.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('client@d360.com', 'Client@D360')}
                  className="flex items-center gap-2 p-2 bg-gradient-to-br from-emerald-50 to-white hover:from-emerald-100/50 border border-emerald-100 hover:border-emerald-200 rounded-xl text-left transition-all duration-300 shadow-2xs group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">🤝</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-emerald-900 leading-tight">Client Cockpit</p>
                    <p className="text-[8px] text-emerald-400 font-mono truncate">client@d360.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('employee@d360.com', 'Employee@D360')}
                  className="flex items-center gap-2 p-2 bg-gradient-to-br from-amber-50 to-white hover:from-amber-100/50 border border-amber-100 hover:border-amber-200 rounded-xl text-left transition-all duration-300 shadow-2xs group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">⏰</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-amber-900 leading-tight">Employee Hub</p>
                    <p className="text-[8px] text-amber-400 font-mono truncate">employee@d360.com</p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-50 flex justify-between text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          <span>{t.poweredBy}</span>
          <span className="text-slate-300">v1.1.0-SaaS</span>
        </div>

      </div>
    </div>
  );
}
