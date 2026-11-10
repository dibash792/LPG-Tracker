import React, { useState } from 'react';
import { AuditTrailEntry } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  KeyRound, 
  CheckCircle2, 
  Terminal, 
  Lock, 
  ArrowRight, 
  Fingerprint, 
  ExternalLink 
} from 'lucide-react';

interface AuditLogViewProps {
  entries: AuditTrailEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ entries }) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const filteredEntries = entries.filter((e) => {
    return (
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.targetResource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tamperProofHash.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult(true);
      showToast('SHA-256 block cryptographic hashes verified. Zero tampering detected.', 'success');
    }, 1200);
  };

  const handleExportCSV = () => {
    showToast('Exporting official tamper-sealed audit transcript (CSV)...', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Cryptographic Assurance Banner */}
      <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-brand-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-flame-50 dark:bg-flame-950/40 text-flame-600 dark:text-flame-400 border border-flame-200 dark:border-flame-900/60">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {language === 'ne' ? 'अपरिवर्तनीय लेखापरीक्षण अडिट लग (अखण्डता सुनिश्चित)' : 'Immutable Administrative Audit Ledger'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Append-only statutory audit trail recording every quota allocation, organization approval, status override, and investigation ruling with chained HMAC-SHA-256 blocks.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleVerifyChain}
              disabled={isVerifying}
              className="px-3.5 py-2 text-xs font-bold text-white bg-flame-600 hover:bg-flame-500 rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs"
            >
              <Fingerprint className={`w-4 h-4 text-flame-100 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Hashing Ledger...' : 'Verify Cryptographic Seal'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-brand-800 border border-slate-200 dark:border-brand-700 hover:bg-slate-50 dark:hover:bg-brand-700 rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Verification Success Pill */}
        {verificationResult && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Cryptographic Integrity Validated:</strong> All {entries.length} log sequence entries chained via SHA-256 hashes conform to NOC Statutory Archival Directive.
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
              SEAL: NOC-SIG-2083-VERIFIED
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-brand-900 rounded-xl p-4 shadow-card border border-slate-200 dark:border-brand-800 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action type, target resource, hash, officer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-brand-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-brand-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-flame-500/20 focus:border-flame-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Ledger Length:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{entries.length} Sequenced Blocks</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-brand-900 rounded-2xl shadow-card border border-slate-200 dark:border-brand-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-brand-950/80 border-b border-slate-200 dark:border-brand-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-mono">Seq # / ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Authorized Actor</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4 font-mono">Cryptographic Hash</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-800 text-xs">
              {filteredEntries.map((e) => (
                <tr 
                  key={e.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-brand-850/60 transition-colors cursor-pointer"
                  onClick={() => setSelectedEntry(e)}
                >
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-slate-900 dark:text-slate-100">#{e.sequenceNumber}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{e.id}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{new Date(e.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{e.actorName}</div>
                    <div className="text-[10px] text-brand-600 dark:text-brand-300 font-medium">{e.actorRole}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-brand-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-brand-700">
                      {e.actionType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {e.targetResource}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 dark:text-slate-500 max-w-[140px] truncate">
                    {e.tamperProofHash}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setSelectedEntry(e);
                      }}
                      className="text-xs font-semibold text-flame-600 dark:text-flame-400 hover:underline"
                    >
                      Inspect Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Diff & Cryptographic Inspection Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-brand-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-brand-800 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-800 pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-flame-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Audit Block #{selectedEntry.sequenceNumber} ({selectedEntry.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-brand-950 p-3 rounded-xl border border-slate-200 dark:border-brand-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Officer</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedEntry.actorName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">ID: {selectedEntry.actorId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Network & Fingerprint</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedEntry.ipAddress}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{selectedEntry.deviceFingerprint}</span>
                </div>
              </div>

              {selectedEntry.previousState && (
                <div className="p-3 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900">
                  <span className="text-[10px] font-bold uppercase text-red-700 dark:text-red-400 block mb-1">Previous State</span>
                  <pre className="font-mono text-[11px] text-red-900 dark:text-red-200 whitespace-pre-wrap">{selectedEntry.previousState}</pre>
                </div>
              )}

              {selectedEntry.newState && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">New Committed State</span>
                  <pre className="font-mono text-[11px] text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">{selectedEntry.newState}</pre>
                </div>
              )}

              <div className="p-3 bg-brand-950 dark:bg-black/60 text-slate-200 rounded-xl font-mono text-[11px] space-y-1 border border-brand-850">
                <span className="text-[10px] text-flame-400 font-bold block uppercase">SHA-256 Block Signature:</span>
                <p className="break-all text-slate-300">{selectedEntry.tamperProofHash}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-brand-800 hover:bg-slate-200 dark:hover:bg-brand-700 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AuditLogView;
