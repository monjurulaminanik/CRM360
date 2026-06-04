import { useState } from 'react';
import { useQuery } from 'react-query';
import { Activity, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import projectService from '../../../services/projectService';

export default function MonitoringPhase({ projectId, project, onUpdate }) {
  const [raiddTab, setRaiddTab] = useState('risk');

  const { data: evmData } = useQuery(['evm', projectId], () => projectService.getEVM(projectId));
  const { data: raiddData } = useQuery(['raidd', projectId], () => projectService.getRAIDD(projectId));

  const evm = evmData?.data;
  const raiddEntries = raiddData?.data || [];
  const raiddStats = raiddData?.stats || { byType: {}, byStatus: {}, overdue: 0 };

  const getEVMColor = (value) => {
    if (!value) return 'text-gray-900';
    return value >= 1 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Monitoring & Control
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track Earned Value metrics, RAIDD log, and generate status reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* EVM Summary */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">EVM Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CPI (Cost)</p>
              <p className={`text-xl font-black ${getEVMColor(evm?.cpi)}`}>
                {evm?.cpi ? evm.cpi.toFixed(2) : '-'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">SPI (Schedule)</p>
              <p className={`text-xl font-black ${getEVMColor(evm?.spi)}`}>
                {evm?.spi ? evm.spi.toFixed(2) : '-'}
              </p>
            </div>
            <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estimate At Completion (EAC)</p>
              <p className="text-xl font-black text-gray-900">
                ৳{(evm?.eac || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* RAIDD Log */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              RAIDD Log
            </h3>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {['risk', 'issue', 'action', 'decision', 'dependency'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setRaiddTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                    raiddTab === tab ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab} ({raiddStats.byType[tab] || 0})
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {raiddEntries.filter(e => e.type === raiddTab).length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No {raiddTab}s logged yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                  <tr>
                    <th className="pb-2 font-semibold">ID</th>
                    <th className="pb-2 font-semibold">Description</th>
                    <th className="pb-2 font-semibold">Owner</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {raiddEntries.filter(e => e.type === raiddTab).map(e => (
                    <tr key={e.entryId}>
                      <td className="py-3 font-mono text-xs">{e.entryId}</td>
                      <td className="py-3 font-medium text-gray-900 max-w-[200px] truncate">{e.description}</td>
                      <td className="py-3 text-gray-500">{e.owner?.name || 'Unassigned'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          e.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
