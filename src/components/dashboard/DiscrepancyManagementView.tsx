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
  Calendar,
  Truck,
  ArrowRight,
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
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-navy-950">
                {language === 'ne' ? 'सिलिन्डर असामञ्जस्य तथा अनुसन्धान व्यवस्थापन' : 'Discrepancy & Custody Variance Management'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              NOC reconciliation ledger tracking quantity mismatches and unverified cylinder serials across custody transitions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-navy-50 text-navy-800 border border-navy-200">
              Active Flags: {discrepancies.filter(d => d.status !== 'RESOLVED').length} Cases
            </span>
          </div>
        </div>

        {/* Accountability Rule Banner */}
        <div className="mt-4 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">National Accountability Policy Rule:</span>
            <p className="text-amber-800 leading-relaxed">
              Under NOC Guidelines 2081, physical discrepancies or unmatched serial tags represent custody audit variances and must not automatically be branded as fraud without formal inquiry, tare weight recalibration, or transit inspection findings.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID, Truck, Plant..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
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
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
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
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-xs">
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
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedCase(c)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-navy-950">{c.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.consignmentId}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-900 truncate">
                        {c.sourceEntity.name}
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 truncate">
                        <span>→ {c.destinationEntity.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                      {formatNumber(c.dispatchedQty)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                      {formatNumber(c.receivedQty)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                        c.varianceQty === 0 
                          ? 'bg-slate-100 text-slate-600'
                          : c.varianceQty < 0 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {c.varianceQty > 0 ? `+${c.varianceQty}` : c.varianceQty}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-xs font-semibold text-slate-700">
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
                        className="px-3 py-1.5 text-xs font-semibold text-navy-800 bg-slate-100 hover:bg-navy-800 hover:text-white rounded-lg transition-colors inline-flex items-center space-x-1"
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

      {/* Case Investigation Drawer / Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full min-h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-teal-400">
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
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Custody Transfer Cards */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Dispatch Origin</span>
                  <p className="text-xs font-bold text-navy-950 mt-0.5">{selectedCase.sourceEntity.name}</p>
                  <p className="text-[11px] text-slate-500">{selectedCase.sourceEntity.location}</p>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Qty: {formatNumber(selectedCase.dispatchedQty)} Cylinders
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Receiving Destination</span>
                  <p className="text-xs font-bold text-navy-950 mt-0.5">{selectedCase.destinationEntity.name}</p>
                  <p className="text-[11px] text-slate-500">{selectedCase.destinationEntity.location}</p>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Qty: {formatNumber(selectedCase.receivedQty)} Cylinders
                  </span>
                </div>
              </div>

              {/* Numerical Variance Breakdown */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Reconciliation Quantities
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center pt-2">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Expected</span>
                    <span className="text-sm font-bold font-mono text-slate-800">
                      {selectedCase.expectedQty}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Dispatched</span>
                    <span className="text-sm font-bold font-mono text-slate-800">
                      {selectedCase.dispatchedQty}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Received</span>
                    <span className="text-sm font-bold font-mono text-slate-800">
                      {selectedCase.receivedQty}
                    </span>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-[10px] text-red-600 font-medium block">Net Variance</span>
                    <span className="text-sm font-bold font-mono text-red-700">
                      {selectedCase.varianceQty} Units
                    </span>
                  </div>
                </div>
              </div>

              {/* Unmatched Serial Numbers / RFID Tag List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Unmatched / Missing Cylinder Serial Barcodes ({selectedCase.unmatchedSerials.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    NOC Standard 14.2kg Tare
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {selectedCase.unmatchedSerials.length === 0 ? (
                    <span className="text-xs text-slate-400">All serial tags matched successfully.</span>
                  ) : (
                    selectedCase.unmatchedSerials.map((serial) => (
                      <span 
                        key={serial} 
                        className="px-2.5 py-1 rounded bg-white border border-slate-200 font-mono text-xs text-slate-800 flex items-center space-x-1 shadow-2xs"
                      >
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>{serial}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Initial Remarks */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold block text-slate-900 mb-1">Gate Pass & Receiving Bay Remarks:</span>
                <p>{selectedCase.initialRemarks}</p>
              </div>

              {/* Super Admin Action Controls */}
              <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                    NOC Super Admin Decisions
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600">
                  Select official regulatory ruling. Every transition is cryptographically written to the permanent audit ledger.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setPendingStatusChange('TECHNICAL_VARIANCE');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-left flex items-center space-x-2"
                  >
                    <Scale className="w-3.5 h-3.5 text-slate-600" />
                    <span>Record Technical Variance</span>
                  </button>

                  <button
                    onClick={() => {
                      setPendingStatusChange('UNDER_INVESTIGATION');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-white border border-sky-300 hover:border-sky-400 text-sky-900 text-left flex items-center space-x-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                    <span>Assign Field Inspection</span>
                  </button>

                  <button
                    onClick={() => {
                      setPendingStatusChange('SUSPECTED_DIVERSION');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-orange-50 border border-orange-300 hover:border-orange-400 text-orange-900 text-left flex items-center space-x-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                    <span>Flag Suspected Diversion</span>
                  </button>

                  <button
                    onClick={() => {
                      setPendingStatusChange('RESOLVED');
                      setIsActionModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-emerald-50 border border-emerald-300 hover:border-emerald-400 text-emerald-900 text-left flex items-center space-x-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reconcile & Close Case</span>
                  </button>
                </div>
              </div>

              {/* Investigation History Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Investigation & Audit History ({selectedCase.investigationNotes.length})
                </h4>

                <div className="space-y-3">
                  {selectedCase.investigationNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-950 flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{note.author}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({note.role})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed pt-1">{note.note}</p>
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
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="p-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Super Admin Decisions */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-60 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-navy-950">
                Confirm Regulatory Ruling
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are modifying the official status of Case <strong>{selectedCase?.id}</strong> to:
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs font-bold text-navy-900">
              {pendingStatusChange}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Administrative Justification (Mandatory for Audit Trail):
              </label>
              <textarea
                rows={3}
                value={adminActionReason}
                onChange={(e) => setAdminActionReason(e.target.value)}
                placeholder="E.g., Approved tare scale recalibration report or dispatched field vigilance unit to inspect vehicle BA 2 KHA 7104..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsActionModalOpen(false);
                  setPendingStatusChange(null);
                  setAdminActionReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteStatusChange}
                disabled={!adminActionReason.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-navy-800 hover:bg-navy-900 rounded-xl shadow-xs disabled:opacity-50"
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

