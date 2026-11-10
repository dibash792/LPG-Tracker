import React, { useState } from 'react';
import { 
  DiscrepancyRecord, 
  DiscrepancyStatus, 
  DiscrepancySeverity 
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Scale, 
  ShieldAlert, 
  FileText, 
  X, 
  Send, 
  Clock, 
  HelpCircle,
  Hash,
  User,
  ShieldCheck
} from 'lucide-react';

interface DiscrepancyManagementViewProps {
  discrepancies: DiscrepancyRecord[];
  onUpdateDiscrepancy: (updated: DiscrepancyRecord, actionType: string) => void;
}

export const DiscrepancyManagementView: React.FC<DiscrepancyManagementViewProps> = ({
  discrepancies,
  onUpdateDiscrepancy,
}) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<DiscrepancyRecord | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<DiscrepancyStatus | null>(null);
  const [adminActionReason, setAdminActionReason] = useState('');

  // Filtering
  const filteredCases = discrepancies.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consignmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sourceEntity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.destinationEntity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.unmatchedSerials.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteText.trim()) return;

    const newNote = {
      id: 'NOTE-' + Date.now(),
      timestamp: new Date().toISOString(),
      author: 'Dr. Chandan Adhikari',
      role: 'NOC Super Admin',
      note: newNoteText.trim(),
    };

    const updated: DiscrepancyRecord = {
      ...selectedCase,
      lastUpdated: new Date().toISOString(),
      investigationNotes: [newNote, ...selectedCase.investigationNotes],
    };

    onUpdateDiscrepancy(updated, 'INVESTIGATION_NOTE_APPENDED');
    setSelectedCase(updated);
    setNewNoteText('');
    showToast('Investigation note registered to case file', 'success');
  };

  const handleExecuteStatusChange = () => {
    if (!selectedCase || !pendingStatusChange || !adminActionReason.trim()) {
      showToast('Please provide administrative justification notes.', 'error');
      return;
    }

    const newNote = {
      id: 'ACTION-NOTE-' + Date.now(),
      timestamp: new Date().toISOString(),
      author: 'Dr. Chandan Adhikari',
      role: 'NOC Super Admin',
      note: `STATUS TRANSITION: ${selectedCase.status} → ${pendingStatusChange}. Reason: ${adminActionReason}`,
      statusChange: pendingStatusChange,
    };

    const updated: DiscrepancyRecord = {
      ...selectedCase,
      status: pendingStatusChange,
      lastUpdated: new Date().toISOString(),
      investigationNotes: [newNote, ...selectedCase.investigationNotes],
    };

    onUpdateDiscrepancy(updated, `DISCREPANCY_STATUS_CHANGED_TO_${pendingStatusChange}`);
    setSelectedCase(updated);
    setIsActionModalOpen(false);
    setPendingStatusChange(null);
    setAdminActionReason('');
    showToast(`Case ${updated.id} status updated to ${pendingStatusChange}`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Important Legal / Accountability Disclaimer */}
      <div className="bg-white dark:bg-brand-900/70 rounded-2xl p-6 shadow-card border border-slate-200/90 dark:border-brand-800/80 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-flame-100 dark:bg-flame-950/60 text-flame-700 dark:text-flame-300 border border-flame-200 dark:border-flame-800">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'ne' ? 'सिलिन्डर असामञ्जस्य तथा अनुसन्धान व्यवस्थापन' : 'Discrepancy & Custody Variance Management'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              NOC reconciliation ledger tracking quantity mismatches and unverified cylinder serials across custody transitions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-900 dark:text-brand-200 border border-brand-200 dark:border-brand-800">
              Active Flags: {discrepancies.filter(d => d.status !== 'RESOLVED').length} Cases
            </span>
          </div>
        </div>

        {/* Accountability Rule Banner */}
        <div className="mt-4 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
          <HelpCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">National Accountability Policy Rule:</span>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Under NOC Guidelines 2081, physical discrepancies or unmatched serial tags represent custody audit variances and must not automatically be branded as fraud without formal inquiry, tare weight recalibration, or transit inspection findings.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-brand-900/70 rounded-xl p-4 shadow-card border border-slate-200/90 dark:border-brand-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID, Truck, Plant..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-flame-500/20 dark:text-slate-100"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Statuses ({discrepancies.length})</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="TECHNICAL_VARIANCE">Technical Variance</option>
            <option value="SUSPECTED_DIVERSION">Suspected Diversion</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Discrepancy Table */}
      <div className="bg-white dark:bg-brand-900/70 rounded-2xl shadow-card border border-slate-200/90 dark:border-brand-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-brand-950/80 border-b border-slate-200 dark:border-brand-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Case / Consignment</th>
                <th className="py-3.5 px-4">Custody Route</th>
                <th className="py-3.5 px-4 text-center">Dispatched</th>
                <th className="py-3.5 px-4 text-center">Received</th>
                <th className="py-3.5 px-4 text-center">Variance</th>
                <th className="py-3.5 px-4">Unmatched Tags</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-800/60 text-xs">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No discrepancy records matching current filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/70 dark:hover:bg-brand-850/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedCase(c)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{c.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.consignmentId}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {c.sourceEntity.name}
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 truncate">
                        <span>→ {c.destinationEntity.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatNumber(c.dispatchedQty)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatNumber(c.receivedQty)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                        c.varianceQty === 0 
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          : c.varianceQty < 0 
                            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {c.varianceQty > 0 ? `+${c.varianceQty}` : c.varianceQty}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {c.unmatchedSerials.length}
                        </span>
                        <span className="text-[11px] text-slate-400">units tagged</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCase(c);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-brand-800 dark:text-brand-300 bg-slate-100 dark:bg-brand-850 hover:bg-brand-800 hover:text-white rounded-lg transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Investigation Drawer */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-950/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-brand-900 h-full min-h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-150">
            
            {/* Drawer Header */}
            <div className="p-6 bg-brand-950 text-white flex items-center justify-between border-b border-brand-850">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-flame-400">
                    {selectedCase.id}
                  </span>
                  <StatusBadge status={selectedCase.status} size="sm" />
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Consignment: <span className="font-mono">{selectedCase.consignmentId}</span> • Registered {new Date(selectedCase.dispatchedAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-brand-850"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Custody Transfer Cards */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dispatch Origin</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{selectedCase.sourceEntity.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedCase.sourceEntity.location}</p>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Qty: {formatNumber(selectedCase.dispatchedQty)} Cylinders
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Receiving Destination</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{selectedCase.destinationEntity.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedCase.destinationEntity.location}</p>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Qty: {formatNumber(selectedCase.receivedQty)} Cylinders
                  </span>
                </div>
              </div>

              {/* Numerical Variance Breakdown */}
              <div className="p-4 bg-white dark:bg-brand-900 rounded-xl border border-slate-200 dark:border-brand-800 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Reconciliation Quantities
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center pt-2">
                  <div className="p-2 bg-slate-50 dark:bg-brand-950 rounded-lg">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Expected</span>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {selectedCase.expectedQty}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-brand-950 rounded-lg">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Dispatched</span>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {selectedCase.dispatchedQty}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-brand-950 rounded-lg">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Received</span>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {selectedCase.receivedQty}
                    </span>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-950/60 rounded-lg border border-red-100 dark:border-red-900">
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block">Net Variance</span>
                    <span className="text-sm font-bold font-mono text-red-700 dark:text-red-300">
                      {selectedCase.varianceQty} Units
                    </span>
                  </div>
                </div>
              </div>

              {/* Unmatched Serial Numbers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Unmatched / Missing Cylinder Serial Barcodes ({selectedCase.unmatchedSerials.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    NOC Standard 14.2kg Tare
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800 flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {selectedCase.unmatchedSerials.length === 0 ? (
                    <span className="text-xs text-slate-400">All serial tags matched successfully.</span>
                  ) : (
                    selectedCase.unmatchedSerials.map((serial) => (
                      <span 
                        key={serial} 
                        className="px-2.5 py-1 rounded bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-800 font-mono text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1 shadow-2xs"
                      >
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>{serial}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Initial Remarks */}
              <div className="p-3 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold block text-slate-900 dark:text-white mb-1">Gate Pass & Receiving Bay Remarks:</span>
                <p>{selectedCase.initialRemarks}</p>
              </div>

              {/* Super Admin Action Controls */}
              <div className="p-4 bg-brand-50 dark:bg-brand-950 rounded-xl border border-brand-200 dark:border-brand-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-flame-600 dark:text-flame-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-950 dark:text-white">
                    NOC Super Admin Decisions
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Select official regulatory ruling. Every transition is cryptographically written to the permanent audit ledger.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setPendingStatusChange('TECHNICAL_VARIANCE');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-white dark:bg-brand-900 border border-slate-300 dark:border-brand-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 text-left flex items-center space-x-2"
                  >
                    <Scale className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span>Record Technical Variance</span>
                  </button>

                  <button
                    onClick={() => {
                      setPendingStatusChange('UNDER_INVESTIGATION');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-white dark:bg-brand-900 border border-blue-300 dark:border-blue-700 hover:border-blue-400 text-blue-900 dark:text-blue-200 text-left flex items-center space-x-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Assign Field Inspection</span>
                  </button>

                  <button
                    onClick={() => {
                      setPendingStatusChange('SUSPECTED_DIVERSION');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-flame-50 dark:bg-flame-950/60 border border-flame-300 dark:border-flame-800 text-flame-900 dark:text-flame-200 text-left flex items-center space-x-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-flame-600 dark:text-flame-400" />
                    <span>Flag Suspected Diversion</span>
                  </button>

                  <button
                    onClick={() => {
                      setPendingStatusChange('RESOLVED');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-left flex items-center space-x-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Reconcile & Close Case</span>
                  </button>
                </div>
              </div>

              {/* Investigation History Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Investigation & Audit History ({selectedCase.investigationNotes.length})
                </h4>

                <div className="space-y-3">
                  {selectedCase.investigationNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-white dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800 text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{note.author}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({note.role})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">{note.note}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="pt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Append official investigation note..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-flame-500/20 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="p-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-60 bg-brand-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-brand-800 space-y-4">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Regulatory Ruling
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are modifying the official status of Case <strong>{selectedCase?.id}</strong> to:
            </p>

            <div className="p-3 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800 font-mono text-xs font-bold text-slate-900 dark:text-white">
              {pendingStatusChange}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Administrative Justification (Mandatory for Audit Trail):
              </label>
              <textarea
                rows={3}
                value={adminActionReason}
                onChange={(e) => setAdminActionReason(e.target.value)}
                placeholder="E.g., Approved tare scale recalibration report or dispatched field vigilance unit to inspect vehicle BA 2 KHA 7104..."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-flame-500/20 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsActionModalOpen(false);
                  setPendingStatusChange(null);
                  setAdminActionReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteStatusChange}
                disabled={!adminActionReason.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-flame-600 hover:bg-flame-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                Sign & Record Decision
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
