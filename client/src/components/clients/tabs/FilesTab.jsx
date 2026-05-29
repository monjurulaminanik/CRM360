import { useState } from 'react';
import { Upload, FolderOpen, FileText, Image, FileArchive, Trash2, ExternalLink, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SAMPLE_FILES = [
  { _id: '1', name: 'Brand Guidelines.pdf',   size: '2.4 MB', type: 'pdf',   uploadedAt: '2026-04-10', folder: 'Branding' },
  { _id: '2', name: 'Logo Package.zip',        size: '8.1 MB', type: 'zip',   uploadedAt: '2026-04-10', folder: 'Branding' },
  { _id: '3', name: 'Campaign Brief Q2.docx',  size: '340 KB', type: 'doc',   uploadedAt: '2026-05-01', folder: 'Campaigns' },
  { _id: '4', name: 'Analytics Report May.pdf',size: '1.1 MB', type: 'pdf',   uploadedAt: '2026-05-12', folder: 'Reports' },
  { _id: '5', name: 'Hero Banner v3.png',       size: '540 KB', type: 'image', uploadedAt: '2026-05-08', folder: 'Creatives' },
];

const FOLDERS = ['All', 'Branding', 'Campaigns', 'Reports', 'Creatives'];

function FileIcon({ type }) {
  if (type === 'image') return <Image size={16} className="text-blue-500" />;
  if (type === 'zip')   return <FileArchive size={16} className="text-amber-500" />;
  return <FileText size={16} className="text-red-500" />;
}

export default function FilesTab({ client }) {
  const [dragging, setDragging] = useState(false);
  const [folder, setFolder] = useState('All');
  const files = folder === 'All' ? SAMPLE_FILES : SAMPLE_FILES.filter((f) => f.folder === folder);

  return (
    <div className="space-y-4">
      {/* Drive sync indicator */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <HardDrive size={15} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-blue-800">Google Drive Sync</div>
          <div className="text-[10px] text-blue-500">Connect Drive to sync files automatically</div>
        </div>
        <button onClick={() => toast('Google Drive integration coming soon', { icon: '🔗' })}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors whitespace-nowrap">
          Connect →
        </button>
      </div>

      {/* Folder tabs + upload */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {FOLDERS.map((f) => (
            <button key={f} onClick={() => setFolder(f)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${folder === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:text-dark'}`}>
              <FolderOpen size={11} />{f}
            </button>
          ))}
        </div>
        <button onClick={() => toast('File upload coming soon', { icon: '📁' })}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary-light transition-all">
          <Upload size={12} /> Upload
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); toast('File upload coming soon', { icon: '📁' }); }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${dragging ? 'border-primary bg-primary-light/30' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}
        onClick={() => toast('File upload coming soon', { icon: '📁' })}
      >
        <Upload size={18} className="text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-400">Drop files here or click to upload · Max 10MB</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file) => (
            <div key={file._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 group transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <FileIcon type={file.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-dark truncate">{file.name}</div>
                <div className="text-[10px] text-gray-400">{file.size} · {format(new Date(file.uploadedAt), 'dd MMM yyyy')} · {file.folder}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toast('Download coming soon', { icon: '⬇️' })} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                  <ExternalLink size={13} />
                </button>
                <button onClick={() => toast('Delete coming soon', { icon: '🗑️' })} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-danger transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">
        Sample files shown — real file storage will be available in a future update.
      </p>
    </div>
  );
}
