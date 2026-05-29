import { useState } from 'react';
import { Settings, Shield, MessageCircle, AlertCircle, Copy, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('whatsapp');
  
  // WhatsApp Settings Inputs
  const [phoneId, setPhoneId] = useState('your_phone_number_id');
  const [accessToken, setAccessToken] = useState('your_whatsapp_access_token');
  const [verifyToken, setVerifyToken] = useState('your_webhook_verify_token');
  const [apiUrl, setApiUrl] = useState('https://graph.facebook.com/v18.0');
  
  // General System State
  const [companyName, setCompanyName] = useState('Dawat IT & Consultancy');
  const [mongoUri, setMongoUri] = useState('mongodb://anikwitinstitute_db_user:***@ac-ubjwsyc-shard...');

  const [copied, setCopied] = useState(false);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText('http://localhost:5000/api/whatsapp/webhook');
    setCopied(true);
    toast.success('Webhook callback URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully (Local State Updated)!');
  };

  return (
    <div className="page-container animate-fade-in font-sans">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> Settings & Integrations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Configure company preferences, databases, and Meta WhatsApp Business credentials.</p>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Tabs */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
              activeTab === 'whatsapp' ? 'bg-primary text-white shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100'
            }`}
          >
            <MessageCircle className="h-4.5 w-4.5" /> WhatsApp Business API
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
              activeTab === 'general' ? 'bg-primary text-white shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100'
            }`}
          >
            <Settings className="h-4.5 w-4.5" /> Core System
          </button>
        </div>

        {/* Configurations Forms Container */}
        <div className="md:col-span-3 card bg-white p-6 border border-gray-100 shadow-sm">
          
          {/* Tab: WhatsApp integrations */}
          {activeTab === 'whatsapp' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Informative Alert */}
              <div className="p-4 bg-primary-light/40 border border-primary/10 rounded-xl space-y-2 text-xs leading-normal">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <span>How Meta WhatsApp Connection Works</span>
                </div>
                <p className="text-gray-600 text-[11px]">
                  Your application leverages the official **Meta Cloud API** to transmit and receive WhatsApp messages. To connect your active business number and stop running in offline fallback mode:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-gray-600 text-[11px]">
                  <li>Create a developer profile on <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" className="text-primary underline">developers.facebook.com</a></li>
                  <li>Register a **WhatsApp Business App** under your meta developer dashboard.</li>
                  <li>Paste the callback endpoint below into the **Webhooks Callback URL** input of Meta and set your Verify Token.</li>
                  <li>Generate a **Permanent Access Token**, verify your sender number, and paste your Phone Number ID and Access Token below!</li>
                </ol>
              </div>

              {/* Form entries */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Meta API Keys Setup</h4>
                
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Meta API Endpoint</label>
                  <input
                    className="input text-xs"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone Number ID</label>
                    <input
                      className="input text-xs"
                      value={phoneId}
                      onChange={(e) => setPhoneId(e.target.value)}
                      placeholder="e.g. 102948759392"
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Webhook Verify Token</label>
                    <input
                      className="input text-xs"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      placeholder="Custom token to verify with Meta"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">System Access Token (System User Token)</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 text-xs p-2.5 focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="EAAGy8m..."
                  />
                </div>
              </div>

              {/* Webhooks setups copy area */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Webhooks Setup details</h5>
                <p className="text-[10px] text-gray-400">Copy this URL and paste it inside the webhook configuration on your Meta Developer Portal:</p>
                
                <div className="flex gap-2 items-center">
                  <input
                    readOnly
                    className="input flex-1 text-xs bg-gray-100 border border-gray-200 select-all"
                    value="http://localhost:5000/api/whatsapp/webhook"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="btn-secondary h-9 w-9 p-0 flex items-center justify-center border border-gray-200"
                  >
                    {copied ? <Check className="h-4.5 w-4.5 text-success" /> : <Copy className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Action save */}
              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary gap-1.5 text-xs">
                  <Save className="h-4 w-4" /> Save Connection
                </button>
              </div>

            </form>
          )}

          {/* Tab: Core general preferences */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">General Preferences</h4>
                
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Agency Company Name</label>
                  <input
                    className="input text-xs"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Database connection (MONGO_URI)</label>
                  <input
                    className="input text-xs bg-gray-50"
                    value={mongoUri}
                    onChange={(e) => setMongoUri(e.target.value)}
                  />
                  <span className="text-[9px] text-gray-400">
                    Your database falls back to a mock local JSON database (`server/data/db.json`) if connection fails.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary gap-1.5 text-xs">
                  <Save className="h-4 w-4" /> Save General Settings
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
