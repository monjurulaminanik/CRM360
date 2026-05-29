import { useState } from 'react';
import { 
  FolderOpen, Search, Plus, FileText, FileImage, FileCheck, ArrowDownToLine, 
  MoreVertical, Cloud, RefreshCw, Loader2, CheckSquare, Trash, Check, LogOut,
  UploadCloud, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguageStore } from '../store/languageStore';

export default function FilesPage() {
  const { t, language } = useLanguageStore();
  
  // Local files state
  const [files, setFiles] = useState([
    { id: '1', name: 'branding_proposal_pixeltech.pdf', category: 'proposals', size: '2.4 MB', uploadedBy: 'Sarah Jenkins', date: '2026-05-24' },
    { id: '2', name: 'retainer_agreement_cloudsphere.pdf', category: 'contracts', size: '1.8 MB', uploadedBy: 'Monjurul Amin Anik', date: '2026-05-26' },
    { id: '3', name: 'horizonit_landingpage_mockup.png', category: 'assets', size: '4.2 MB', uploadedBy: 'Emily Williams', date: '2026-05-25' },
    { id: '4', name: 'onboarding_questionnaire_delta.docx', category: 'uploads', size: '640 KB', uploadedBy: 'Sarah Jenkins', date: '2026-05-22' },
  ]);

  // Google Drive state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncingFileId, setSyncingFileId] = useState(null);
  const [uploadingToDrive, setUploadingToDrive] = useState(false);
  
  const [googleFiles, setGoogleFiles] = useState([
    { id: 'gd_1', name: 'WIT_Institute_Syllabus.pdf', size: '1.2 MB', category: 'proposals', date: '2026-05-20' },
    { id: 'gd_2', name: 'dawatit_logo_assets.zip', size: '12.4 MB', category: 'assets', date: '2026-05-22' },
    { id: 'gd_3', name: 'PixelTech_Signed_Contract.pdf', size: '3.1 MB', category: 'contracts', date: '2026-05-24' }
  ]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [vaultView, setVaultView] = useState('local'); // 'local' | 'googleDrive'

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg')) return <FileImage className="h-5 w-5 text-blue-500" />;
    return <FileCheck className="h-5 w-5 text-emerald-500" />;
  };

  // Triggers hidden file input
  const triggerLocalFilePicker = () => {
    document.getElementById('local-file-picker').click();
  };

  // Triggers file picker for uploading directly to Google Drive
  const triggerDriveFilePicker = () => {
    if (!isGoogleConnected) {
      toast.error('Connect Google Drive first!');
      return;
    }
    document.getElementById('drive-file-picker').click();
  };

  // Handle local machine file upload
  const handleLocalFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeStr = (file.size / 1024 > 1024)
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const newFile = {
      id: Math.random().toString(36).substring(2, 10),
      name: file.name,
      category: activeCategory === 'all' ? 'uploads' : activeCategory,
      size: sizeStr,
      uploadedBy: 'Monjurul Amin Anik',
      date: new Date().toISOString().split('T')[0]
    };

    setFiles([newFile, ...files]);
    toast.success(
      language === 'bn' 
        ? `"${file.name}" সফলভাবে ডকুমেন্ট ভল্টে আপলোড করা হয়েছে! 📁` 
        : `Successfully uploaded "${file.name}" to Document Vault! 📁`
    );
    e.target.value = ''; // Reset input
  };

  // Handle direct file upload to Google Drive
  const handleDriveFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingToDrive(true);
      // Simulate cloud latency
      await new Promise(resolve => setTimeout(resolve, 1800));

      const sizeStr = (file.size / 1024 > 1024)
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const newCloudFile = {
        id: 'gd_' + Math.random().toString(36).substring(2, 10),
        name: file.name,
        size: sizeStr,
        category: 'uploads',
        date: new Date().toISOString().split('T')[0]
      };

      setGoogleFiles([newCloudFile, ...googleFiles]);
      toast.success(
        language === 'bn'
          ? `"${file.name}" সরাসরি গুগল ড্রাইভে আপলোড করা হয়েছে! ☁️`
          : `Successfully synced "${file.name}" to Google Drive! ☁️`
      );
    } catch (err) {
      toast.error('Failed to upload to Google Drive');
    } finally {
      setUploadingToDrive(false);
      e.target.value = ''; // Reset
    }
  };

  // Simulate Google Drive Sync
  const handleSyncToLocal = async (cloudFile) => {
    if (syncingFileId) return;

    try {
      setSyncingFileId(cloudFile.id);
      // Simulate sync download progress
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newDownloadedFile = {
        id: Math.random().toString(36).substring(2, 10),
        name: cloudFile.name,
        category: cloudFile.category,
        size: cloudFile.size,
        uploadedBy: 'Google Drive Sync',
        date: new Date().toISOString().split('T')[0]
      };

      setFiles([newDownloadedFile, ...files]);
      toast.success(
        language === 'bn'
          ? `"${cloudFile.name}" গুগল ড্রাইভ থেকে ভল্টে সিঙ্ক করা হয়েছে! 🟢`
          : `Successfully imported "${cloudFile.name}" to Document Vault! 🟢`
      );
    } catch (err) {
      toast.error('Failed to sync file');
    } finally {
      setSyncingFileId(null);
    }
  };

  // Google OAuth flow simulation
  const handleAuthAccount = async (email) => {
    setAuthLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Latency
    setAuthLoading(false);
    setIsGoogleConnected(true);
    setShowOAuthModal(false);
    toast.success(
      language === 'bn'
        ? `গুগল ড্রাইভ সফলভাবে ${email} অ্যাকাউন্টের সাথে যুক্ত হয়েছে! 🚀`
        : `Google Drive workspace linked to ${email} successfully! 🚀`
    );
  };

  const handleDisconnect = () => {
    if (window.confirm(language === 'bn' ? 'গুগল ড্রাইভ কানেকশন বন্ধ করতে চান?' : 'Disconnect your active Google Drive account?')) {
      setIsGoogleConnected(false);
      toast.success(language === 'bn' ? 'গুগল ড্রাইভ কানেকশন বন্ধ করা হয়েছে' : 'Google Drive disconnected');
    }
  };

  const handleDeleteLocalFile = (id, name) => {
    if (window.confirm(language === 'bn' ? `"${name}" ডিলিট করতে চান?` : `Are you sure you want to delete "${name}"?`)) {
      setFiles(files.filter(f => f.id !== id));
      toast.success(language === 'bn' ? 'ফাইল ডিলিট করা হয়েছে' : 'File deleted successfully');
    }
  };

  const filteredLocalFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeCategory === 'all' || f.category === activeCategory)
  );

  const filteredGoogleFiles = googleFiles.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container animate-fade-in font-sans space-y-6">
      
      {/* Hidden File Picker Inputs */}
      <input 
        type="file" 
        id="local-file-picker" 
        className="hidden" 
        onChange={handleLocalFileSelect} 
      />
      
      <input 
        type="file" 
        id="drive-file-picker" 
        className="hidden" 
        onChange={handleDriveFileSelect} 
      />

      {/* ══ Header ══════════════════════════════════════════════════════════ */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" /> 
            {language === 'bn' ? 'ডকুমেন্ট ভল্ট' : 'Document Vault & Cloud'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {language === 'bn' 
              ? 'ক্লায়েন্ট ফাইল সংযুক্ত করুন, প্রোপোজাল এবং ডকুমেন্ট গুগল ড্রাইভের সাথে সিঙ্ক করুন।' 
              : 'Manage client attachments, proposals, contracts, and sync with your corporate Google Drive.'}
          </p>
        </div>

        <div className="flex gap-2">
          {vaultView === 'googleDrive' && isGoogleConnected && (
            <button 
              onClick={triggerDriveFilePicker}
              disabled={uploadingToDrive}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs h-10 px-4 shadow-sm shadow-emerald-500/10"
            >
              {uploadingToDrive ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <UploadCloud className="h-4.5 w-4.5" />
                  {language === 'bn' ? 'ড্রাইভে আপলোড' : 'Upload to Drive'}
                </>
              )}
            </button>
          )}

          <button 
            onClick={triggerLocalFilePicker} 
            className="btn-primary gap-1.5 text-xs h-10 px-5 shadow-sm shadow-primary/10"
          >
            <Plus className="h-4.5 w-4.5" /> 
            {language === 'bn' ? 'নতুন ফাইল আপলোড' : 'Upload Document'}
          </button>
        </div>
      </div>

      {/* ══ Unified Cloud Vault Selection Tabs ══════════════════════════════ */}
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
        
        {/* Toggle between Local Storage & Google Drive Cloud */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl">
          <button
            onClick={() => setVaultView('local')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              vaultView === 'local' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" /> 
            {language === 'bn' ? 'ভল্ট স্টোরেজ' : 'Vault Storage'}
          </button>
          
          <button
            onClick={() => setVaultView('googleDrive')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              vaultView === 'googleDrive' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-dark'
            }`}
          >
            <Cloud className="h-3.5 w-3.5 text-blue-500" /> 
            {language === 'bn' ? 'গুগল ড্রাইভ সিঙ্ক' : 'Google Drive Cloud'}
            {isGoogleConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Searching filter */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            className="input pl-9 text-xs h-9 rounded-xl"
            placeholder={
              vaultView === 'googleDrive'
                ? (language === 'bn' ? 'ড্রাইভ ফাইল খুঁজুন...' : 'Search Google Drive...')
                : (language === 'bn' ? 'ভল্ট ফাইল খুঁজুন...' : 'Search local documents...')
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ══ LOCAL VAULT STORAGE VIEW ══════════════════════════════════════════ */}
      {vaultView === 'local' && (
        <>
          {/* Folders grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'all', label: language === 'bn' ? 'সব ফাইল' : 'All Documents', count: files.length },
              { key: 'proposals', label: language === 'bn' ? 'প্রস্তাবনা' : 'Proposals', count: files.filter(f => f.category === 'proposals').length },
              { key: 'contracts', label: language === 'bn' ? 'চুক্তিপত্র' : 'Contracts', count: files.filter(f => f.category === 'contracts').length },
              { key: 'assets', label: language === 'bn' ? 'ডিজাইন অ্যাসেট' : 'Design Assets', count: files.filter(f => f.category === 'assets').length },
              { key: 'uploads', label: language === 'bn' ? 'ক্লায়েন্ট আপলোড' : 'Client Uploads', count: files.filter(f => f.category === 'uploads').length },
            ].map((folder) => (
              <button
                key={folder.key}
                onClick={() => setActiveCategory(folder.key)}
                className={`card text-left p-4 hover:border-primary/20 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  activeCategory === folder.key ? 'bg-primary-light/50 border-primary/20 ring-1 ring-primary' : 'bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${
                  activeCategory === folder.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <FolderOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-gray-800 truncate leading-none">{folder.label}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">{folder.count} {language === 'bn' ? 'টি ফাইল' : 'files'}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Files grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLocalFiles.map((file) => (
              <div
                key={file.id}
                className="card bg-white p-4 hover:border-primary/20 flex items-center justify-between transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file.name)}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-gray-800 truncate leading-tight group-hover:text-primary transition-all duration-200">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.uploadedBy}</span>
                      <span>•</span>
                      <span>{file.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toast.success(`Initiated download of "${file.name}"`)}
                    className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary-light/50 transition-all duration-200 cursor-pointer"
                    title="Download"
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteLocalFile(file.id, file.name)}
                    className="w-8 h-8 rounded-lg bg-slate-50 border border-red-100 hover:bg-red-50 text-slate-350 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
                    title="Delete File"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {!filteredLocalFiles.length && (
              <div className="md:col-span-2 text-center p-14 text-gray-400 font-bold bg-white rounded-2xl border border-dashed">
                {language === 'bn' ? 'ভল্টের এই ফোল্ডারে কোনো ফাইল পাওয়া যায়নি।' : 'No local documents found inside this folder.'}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ GOOGLE DRIVE CLOUD VIEW ═══════════════════════════════════════════ */}
      {vaultView === 'googleDrive' && (
        <div className="space-y-4">
          
          {/* A. If not connected, show premium connect banner */}
          {!isGoogleConnected ? (
            <div className="card p-10 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 border border-slate-150/40 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto mt-6 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                <Cloud className="h-9 w-9" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">
                  {language === 'bn' ? 'গুটল ড্রাইভ ক্লাউড কানেক্টর' : 'Google Drive Cloud Integration'}
                </h3>
                <p className="text-xs text-gray-500 font-medium max-w-sm leading-relaxed mx-auto">
                  {language === 'bn'
                    ? 'আপনার D360 কাজের পরিবেশকে সরাসরি গুগল ড্রাইভের সাথে সংযুক্ত করুন। সরাসরি গুগল ড্রাইভে প্রোপোজাল আপলোড করুন এবং সিঙ্ক করুন।'
                    : 'Connect D360 directly with your company Google Drive storage. Transfer client assets, sign-offs, and design briefs in single-click actions.'}
                </p>
              </div>

              <button
                onClick={() => setShowOAuthModal(true)}
                className="btn-primary bg-blue-600 hover:bg-blue-700 h-10 px-8 text-xs font-bold gap-2 cursor-pointer shadow-sm shadow-blue-500/10 rounded-xl"
              >
                <Cloud className="h-4.5 w-4.5" /> 
                {language === 'bn' ? 'গুগল ড্রাইভ যুক্ত করুন' : 'Connect Google Drive'}
              </button>

              <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold">
                <AlertCircle className="h-3.5 w-3.5 text-gray-450" />
                <span>Requires OAuth Google API scopes authorization approval.</span>
              </div>
            </div>
          ) : (
            
            // B. If connected, show active cloud file panel
            <div className="space-y-4">
              {/* Linked account info header */}
              <div className="card bg-emerald-500/5 border border-emerald-500/10 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Cloud Directory Active</span>
                    <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">
                      {language === 'bn' ? 'সংযুক্ত অ্যাকাউন্ট:' : 'Linked Account:'} <span className="text-primary">anik@dawatit.com</span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
                    {language === 'bn' ? 'গুগল ক্লাউড: সচল' : 'Google Drive Status: Linked'}
                  </span>
                  
                  <button
                    onClick={handleDisconnect}
                    className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-100 transition-colors cursor-pointer"
                    title="Disconnect Google Drive"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cloud files list grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGoogleFiles.map((cloudFile) => {
                  const isSyncing = syncingFileId === cloudFile.id;

                  return (
                    <div
                      key={cloudFile.id}
                      className="card bg-white p-4 border-slate-100/60 flex items-center justify-between hover:border-blue-500/20 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-blue-50/50 border border-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          {getFileIcon(cloudFile.name)}
                        </div>
                        
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-gray-800 truncate leading-tight group-hover:text-blue-600 transition-all">
                            {cloudFile.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                            <span>{cloudFile.size}</span>
                            <span>•</span>
                            <span className="text-blue-500 font-bold">Google Cloud Storage</span>
                            <span>•</span>
                            <span>{cloudFile.date}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSyncToLocal(cloudFile)}
                        disabled={isSyncing}
                        className={`btn-secondary h-8 px-3.5 text-[10px] font-bold gap-1 rounded-xl cursor-pointer ${
                          isSyncing 
                            ? 'bg-blue-50 text-blue-500 border border-blue-100' 
                            : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-150/40 border border-slate-100'
                        }`}
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                            {language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...'}
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3" />
                            {language === 'bn' ? 'ভল্টে সিঙ্ক' : 'Sync to Vault'}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}

                {!filteredGoogleFiles.length && (
                  <div className="md:col-span-2 text-center p-14 text-slate-400 font-bold bg-white rounded-2xl border border-dashed border-slate-200">
                    No files found in this Google Drive workspace.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══ SIMULATED INTERACTIVE OAUTH MODAL ═════════════════════════════════ */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => !authLoading && setShowOAuthModal(false)}></div>
          
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-modal border border-slate-100 flex flex-col text-center space-y-4 animate-zoom-in relative z-50">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3 shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Google OAuth Security</span>
              <button 
                onClick={() => setShowOAuthModal(false)}
                disabled={authLoading}
                className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {authLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-xs font-bold text-slate-600 animate-pulse">Connecting Google Drive APIs...</p>
                <p className="text-[10px] text-gray-400">Verifying secure OAuth scopes tokens...</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2">
                  <Cloud className="h-6 w-6" />
                </div>
                
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Sign in with Google</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Select an account to authorize D360 Drive integration.</p>
                </div>

                {/* Simulated Google Accounts list */}
                <div className="space-y-2 text-left pt-2">
                  <button 
                    onClick={() => handleAuthAccount('anik@dawatit.com')}
                    className="w-full card p-3.5 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 text-xs font-bold text-slate-700 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      M
                    </div>
                    <div className="truncate">
                      <div>Monjurul Amin Anik</div>
                      <div className="text-[9px] text-gray-400 font-semibold mt-0.5">anik@dawatit.com</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleAuthAccount('anik.witinstitute@gmail.com')}
                    className="w-full card p-3.5 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 text-xs font-bold text-slate-700 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      W
                    </div>
                    <div className="truncate">
                      <div>WIT Institute</div>
                      <div className="text-[9px] text-gray-400 font-semibold mt-0.5">anik.witinstitute@gmail.com</div>
                    </div>
                  </button>
                </div>

                <p className="text-[9px] text-slate-400 text-center leading-relaxed px-4 pt-1">
                  By connecting, you authorize D360 client system to securely read, write, and delete files inside your dedicated Google Drive workspace.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
