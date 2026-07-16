import { useState } from 'react';
import {
  Settings, MessageCircle, AlertCircle, Copy, Check, Save, Share2, ListOrdered,
} from 'lucide-react';
import toast from 'react-hot-toast';

const WA_WEBHOOK = 'https://depot-valves-acquisitions-pink.trycloudflare.com/api/whatsapp/webhook';
const FB_WEBHOOK = 'https://depot-valves-acquisitions-pink.trycloudflare.com/api/meta/webhook';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('guide');

  const [phoneId, setPhoneId] = useState('your_phone_number_id');
  const [accessToken, setAccessToken] = useState('your_whatsapp_access_token');
  const [verifyToken, setVerifyToken] = useState('d360_wa_verify_token');
  const [apiUrl, setApiUrl] = useState('https://graph.facebook.com/v19.0');

  const [pageId, setPageId] = useState('your_facebook_page_id');
  const [pageToken, setPageToken] = useState('your_page_access_token');
  const [fbVerify, setFbVerify] = useState('d360_fb_verify_token');
  const [formId, setFormId] = useState('your_lead_form_id');

  const [companyName, setCompanyName] = useState('Dawat IT & Consultancy');
  const [mongoUri, setMongoUri] = useState('mongodb://...');
  const [copied, setCopied] = useState('');

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('কপি হয়েছে!');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success(
      'মনে রাখুন: UI তে সেভ শুধু দেখানোর জন্য। আসল কানেকশনের জন্য server/.env ফাইলে মান বসান।'
    );
  };

  const tabs = [
    { id: 'guide', label: 'বাংলা সেটআপ গাইড', icon: ListOrdered },
    { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageCircle },
    { id: 'facebook', label: 'Facebook Page', icon: Share2 },
    { id: 'general', label: 'Core System', icon: Settings },
  ];

  return (
    <div className="page-container animate-fade-in font-sans">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> Settings & Integrations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Dawat IT Facebook Page + WhatsApp Business → D360 CRM সিঙ্ক সেটআপ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-200 ${
                activeTab === id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 card bg-white p-6 border border-gray-100 shadow-sm">
          {/* ── Bangla Setup Guide ── */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
              <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl">
                <h3 className="font-bold text-primary text-sm mb-1">কী কী CRM-এ আসবে?</h3>
                <ul className="list-disc pl-5 text-xs space-y-1 text-gray-600">
                  <li>Facebook Lead Ads ফর্মের নতুন লিড → Leads পেজে</li>
                  <li>Facebook Page / Messenger মেসেজ → Meta webhook দিয়ে সেভ</li>
                  <li>WhatsApp Business Cloud API নতুন ইনকামিং মেসেজ → WhatsApp Inbox + অটো Lead</li>
                </ul>
                <p className="text-[11px] text-amber-700 mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2">
                  গুরুত্বপূর্ণ: WhatsApp Web / Business App-এর <strong>পুরনো চ্যাট ইমপোর্ট হয় না</strong>।
                  Step 1-এর <strong>+1 (555) টেস্ট নম্বর</strong> শুধু টেস্ট। আসল কাস্টমার মেসেজের জন্য
                  Step 2-এ <strong>আপনার রিয়েল বিজনেস নম্বর</strong> Cloud API-তে রেজিস্টার করতে হবে।
                  তারপর শুধু <strong>নতুন</strong> মেসেজ CRM-এ আসবে।
                </p>
              </div>

              <ol className="space-y-4 text-xs">
                <li className="border border-gray-100 rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">ধাপ ১ — Meta Developer App তৈরি</div>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                    <li>
                      <a
                        href="https://developers.facebook.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        developers.facebook.com
                      </a>{' '}
                      এ লগইন করুন (Dawat IT পেজের অ্যাডমিন অ্যাকাউন্ট দিয়ে)।
                    </li>
                    <li>My Apps → Create App → Business টাইপ বেছে নিন।</li>
                    <li>অ্যাপ নাম দিন: <code className="bg-gray-100 px-1 rounded">D360 CRM</code></li>
                    <li>
                      App-এ প্রোডাক্ট যোগ করুন: <strong>WhatsApp</strong>,{' '}
                      <strong>Messenger</strong>, <strong>Webhooks</strong>
                    </li>
                    <li>Dawat IT Facebook Page অ্যাপের সাথে লিংক করুন (Page roles → Admin)।</li>
                  </ol>
                </li>

                <li className="border border-gray-100 rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">ধাপ ২ — পাবলিক HTTPS URL (লোকালের জন্য ngrok)</div>
                  <p className="text-gray-600 mb-2">
                    Meta localhost গ্রহণ করে না। টার্মিনালে:
                  </p>
                  <pre className="bg-slate-900 text-green-300 text-[11px] p-3 rounded-lg overflow-x-auto">
{`ngrok http 5000`}
                  </pre>
                  <p className="text-gray-600 mt-2">
                    যে URL পাবেন (যেমন <code className="bg-gray-100 px-1">https://xxxx.ngrok-free.app</code>),
                    সেটা দিয়ে webhook বানাবেন।
                  </p>
                </li>

                <li className="border border-gray-100 rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">ধাপ ৩ — WhatsApp Business কানেক্ট</div>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                    <li>Meta App → WhatsApp → API Setup থেকে Phone Number ID ও Temporary/Permanent Token কপি করুন।</li>
                    <li>
                      Webhook Callback URL:{' '}
                      <code className="bg-gray-100 px-1 break-all">
                        https://YOUR-NGROK/api/whatsapp/webhook
                      </code>
                    </li>
                    <li>Verify Token: <code className="bg-gray-100 px-1">d360_wa_verify_token</code> (অথবা নিজের)</li>
                    <li>Subscribe fields: <code className="bg-gray-100 px-1">messages</code></li>
                    <li>
                      <code className="bg-gray-100 px-1">server/.env</code> এ বসান:{' '}
                      WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_VERIFY_TOKEN
                    </li>
                    <li>সার্ভার রিস্টার্ট করুন। নতুন WhatsApp মেসেজ এলে অটো Lead + Inbox আপডেট হবে।</li>
                  </ol>
                </li>

                <li className="border border-gray-100 rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">ধাপ ৪ — Facebook Lead Ads + Messenger (এখন এটা করুন)</div>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                    <li>developers.facebook.com → অ্যাপ <strong>D360 CRM</strong> → <strong>Add product</strong> → <strong>Messenger</strong> যোগ করুন।</li>
                    <li>Messenger → Settings → <strong>Add Callback URL</strong> (বা Webhooks):</li>
                    <li>
                      Callback:{' '}
                      <code className="bg-gray-100 px-1 break-all">
                        https://depot-valves-acquisitions-pink.trycloudflare.com/api/meta/webhook
                      </code>
                    </li>
                    <li>Verify Token: <code className="bg-gray-100 px-1">d360_fb_verify_token</code></li>
                    <li>
                      Page সাবস্ক্রাইব: <code className="bg-gray-100 px-1">messages</code>,{' '}
                      <code className="bg-gray-100 px-1">messaging_postbacks</code>
                    </li>
                    <li>
                      Webhooks-এ <code className="bg-gray-100 px-1">leadgen</code> সাবস্ক্রাইব (Lead Ads ফর্মের জন্য)
                    </li>
                    <li>
                      Page Access Token জেনারেট করুন (permissions: pages_messaging, pages_manage_metadata, leads_retrieval) →{' '}
                      <code className="bg-gray-100 px-1">server/.env</code> এ{' '}
                      <code className="bg-gray-100 px-1">FACEBOOK_PAGE_ACCESS_TOKEN</code> বসান
                    </li>
                    <li>
                      CRM-এ দেখুন: সাইডবার <strong>Messenger</strong> + <strong>Leads</strong> (source: FB Ads / Messenger)
                    </li>
                  </ol>
                </li>

                <li className="border border-gray-100 rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">ধাপ ৫ — যাচাই (টেস্ট)</div>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                    <li>WhatsApp টেস্ট নম্বরে মেসেজ পাঠান → CRM WhatsApp + Leads চেক করুন।</li>
                    <li>Lead Form টেস্ট সাবমিট করুন → Leads-এ source = facebook_ads দেখা যাবে।</li>
                    <li>পেজে Messenger মেসেজ পাঠান → Meta webhook লগে / DB তে সেভ হবে।</li>
                    <li>
                      Health: <code className="bg-gray-100 px-1">GET /api/meta/status</code> (লগইন প্রয়োজন)
                    </li>
                  </ol>
                </li>
              </ol>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-gray-500 border border-slate-100">
                পরবর্তী ধাপ আপনার: Meta থেকে টোকেন কপি করে <strong>server/.env</strong> ফাইল তৈরি/আপডেট
                করুন (.env.example দেখে)। টোকেন চ্যাটে শেয়ার করবেন না — শুধু .env তে রাখুন।
              </div>
            </div>
          )}

          {/* ── WhatsApp ── */}
          {activeTab === 'whatsapp' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="p-4 bg-primary-light/40 border border-primary/10 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <AlertCircle className="h-4 w-4" />
                  WhatsApp Cloud API
                </div>
                <p className="text-gray-600 text-[11px]">
                  আসল কানেকশনের জন্য নিচের মানগুলো <code>server/.env</code> এ সেট করুন।
                </p>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Meta API Endpoint
                  </label>
                  <input className="input text-xs" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Phone Number ID
                    </label>
                    <input
                      className="input text-xs"
                      value={phoneId}
                      onChange={(e) => setPhoneId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Webhook Verify Token
                    </label>
                    <input
                      className="input text-xs"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Access Token
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 text-xs p-2.5 focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  WhatsApp Webhook URL
                </h5>
                <div className="flex gap-2 items-center">
                  <input readOnly className="input flex-1 text-xs bg-gray-100" value={WA_WEBHOOK} />
                  <button
                    type="button"
                    onClick={() => copyText(WA_WEBHOOK, 'wa')}
                    className="btn-secondary h-9 w-9 p-0 flex items-center justify-center"
                  >
                    {copied === 'wa' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  প্রোডাকশন/ngrok: https://YOUR-DOMAIN/api/whatsapp/webhook
                </p>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary gap-1.5 text-xs">
                  <Save className="h-4 w-4" /> Save (UI)
                </button>
              </div>
            </form>
          )}

          {/* ── Facebook ── */}
          {activeTab === 'facebook' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                Lead Ads (<code>leadgen</code>) + Messenger (<code>messages</code>) ওয়েবহুক:{' '}
                <code>/api/meta/webhook</code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Facebook Page ID
                  </label>
                  <input className="input text-xs" value={pageId} onChange={(e) => setPageId(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Lead Form ID
                  </label>
                  <input className="input text-xs" value={formId} onChange={(e) => setFormId(e.target.value)} />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Page Access Token
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 text-xs p-2.5 focus:outline-none resize-none"
                    value={pageToken}
                    onChange={(e) => setPageToken(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Verify Token
                  </label>
                  <input className="input text-xs" value={fbVerify} onChange={(e) => setFbVerify(e.target.value)} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Facebook / Messenger Webhook URL
                </h5>
                <div className="flex gap-2 items-center">
                  <input readOnly className="input flex-1 text-xs bg-gray-100" value={FB_WEBHOOK} />
                  <button
                    type="button"
                    onClick={() => copyText(FB_WEBHOOK, 'fb')}
                    className="btn-secondary h-9 w-9 p-0 flex items-center justify-center"
                  >
                    {copied === 'fb' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary gap-1.5 text-xs">
                  <Save className="h-4 w-4" /> Save (UI)
                </button>
              </div>
            </form>
          )}

          {/* ── General ── */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Agency Company Name
                  </label>
                  <input
                    className="input text-xs"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Database (MONGO_URI)
                  </label>
                  <input
                    className="input text-xs bg-gray-50"
                    value={mongoUri}
                    onChange={(e) => setMongoUri(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary gap-1.5 text-xs">
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
