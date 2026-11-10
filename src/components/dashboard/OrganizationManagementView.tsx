import React, { useState } from 'react';
import { Organization, OrgType, OrgStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Check, 
  X, 
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Award,
  Layers,
  Clock
} from 'lucide-react';

interface OrganizationManagementViewProps {
  organizations: Organization[];
  onUpdateOrg: (org: Organization, actionType: string) => void;
  initialFilter?: OrgStatus | 'ALL';
}

export const OrganizationManagementView: React.FC<OrganizationManagementViewProps> = ({
  organizations,
  onUpdateOrg,
  initialFilter = 'ALL',
}) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Filter organizations
  const filteredOrgs = organizations.filter((org) => {
    const matchesType = typeFilter === 'ALL' || org.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || org.status === statusFilter;
    const matchesSearch = 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.primaryContact.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const pendingCount = organizations.filter(o => o.status === 'PENDING_APPROVAL').length;

  const handleApprove = (org: Organization) => {
    const updated: Organization = {
      ...org,
      status: 'ACTIVE',
      approvedDate: new Date().toISOString().split('T')[0],
      approvedBy: 'Dr. Chandan Adhikari (NOC Super Admin)',
    };

    onUpdateOrg(updated, 'ORG_ACCOUNT_APPROVED_BY_SUPER_ADMIN');
    setSelectedOrg(null);
    setIsReviewModalOpen(false);
    showToast(`Approved operating license for ${org.name}`, 'success');
  };

  const handleReject = (org: Organization) => {
    if (!rejectionReason.trim()) {
      showToast('Please state official rejection criteria.', 'error');
      return;
    }

    const updated: Organization = {
      ...org,
      status: 'INACTIVE',
    };

    onUpdateOrg(updated, `ORG_APPLICATION_REJECTED: ${rejectionReason}`);
    setSelectedOrg(null);
    setIsReviewModalOpen(false);
    setShowRejectInput(false);
    setRejectionReason('');
    showToast(`Registration request for ${org.name} rejected`, 'info');
  };

  const handleToggleSuspension = (org: Organization) => {
    const newStatus: OrgStatus = org.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const action = newStatus === 'SUSPENDED' ? 'ORG_LICENSE_SUSPENDED' : 'ORG_LICENSE_REINSTATED';

    const updated: Organization = {
      ...org,
      status: newStatus,
    };

    onUpdateOrg(updated, action);
    setSelectedOrg(updated);
    showToast(`${org.name} status updated to ${newStatus}`, newStatus === 'SUSPENDED' ? 'error' : 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Quick Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                <Building2 className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-navy-950">
                {language === 'ne' ? 'उद्योग, वितरक तथा खुद्रा संस्था व्यवस्थापन' : 'National LPG Entity Registry & Licensing'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Authorized Directory of 28 Bottling Plants, 842 Authorized Distributors, and 4,210 Local Retailers under Nepal Oil Corporation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {pendingCount > 0 && (
              <button
                onClick={() => setStatusFilter('PENDING_APPROVAL')}
                className="px-3.5 py-1.5 bg-amber-500 text-slate-900 font-bold text-xs rounded-xl shadow-xs hover:bg-amber-400 transition-all flex items-center space-x-1.5 animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} Pending NOC Approvals</span>
              </button>
            )}
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
            placeholder="Search company, PAN, contact, location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Entity Types</option>
            <option value="BOTTLING_PLANT">Bottling Plants (28)</option>
            <option value="AUTHORIZED_DISTRIBUTOR">Distributors (842)</option>
            <option value="LOCAL_RETAILER">Retailers (4,210)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Licensed</option>
            <option value="PENDING_APPROVAL">Pending Approval ({pendingCount})</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Entity / License</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Jurisdiction</th>
                <th className="py-3.5 px-4 text-center">Storage Capacity</th>
                <th className="py-3.5 px-4 text-center">Current Stock</th>
                <th className="py-3.5 px-4 text-center">Compliance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No registered organizations found.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr 
                    key={org.id} 
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOrg(org);
                      setIsReviewModalOpen(true);
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-950">{org.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{org.regNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {org.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{org.district}, {org.province}</div>
                      <div className="text-[11px] text-slate-400">{org.municipality}-{org.ward}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                      {formatNumber(org.storageCapacityCylinders)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-navy-950">
                      {formatNumber(org.currentStockCylinders)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                        org.complianceRating >= 90
                          ? 'bg-teal-50 text-teal-700'
                          : org.complianceRating >= 75
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {org.complianceRating}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={org.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrg(org);
                          setIsReviewModalOpen(true);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1 ${
                          org.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-2xs font-bold'
                            : 'bg-slate-100 text-navy-800 hover:bg-navy-800 hover:text-white'
                        }`}
                      >
                        <span>{org.status === 'PENDING_APPROVAL' ? 'Review & Approve' : 'Details'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization Review & Licensing Modal */}
      {isReviewModalOpen && selectedOrg && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-navy-950">
                    {selectedOrg.name}
                  </h3>
                  <StatusBadge status={selectedOrg.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Legal Entity: <span className="font-semibold">{selectedOrg.legalEntityName}</span> • Reg: <span className="font-mono">{selectedOrg.regNumber}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setSelectedOrg(null);
                  setShowRejectInput(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Jurisdiction & Contact Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Location & Ward</span>
                <p className="font-medium text-slate-800 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{selectedOrg.municipality}, Ward {selectedOrg.ward}, {selectedOrg.district} ({selectedOrg.province})</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Contact Official</span>
                <p className="font-bold text-navy-950">{selectedOrg.primaryContact.name} ({selectedOrg.primaryContact.designation})</p>
                <p className="text-slate-500 font-mono text-[11px]">{selectedOrg.primaryContact.phone} • {selectedOrg.primaryContact.email}</p>
              </div>
            </div>

            {/* Technical Specifications & Plant Integration */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Storage Capacity</span>
                <span className="text-base font-bold font-mono text-navy-950">
                  {formatNumber(selectedOrg.storageCapacityCylinders)}
                </span>
                <span className="text-[10px] text-slate-500 block">Domestic 14.2kg</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Live Stock In Hand</span>
                <span className="text-base font-bold font-mono text-teal-600">
                  {formatNumber(selectedOrg.currentStockCylinders)}
                </span>
                <span className="text-[10px] text-slate-500 block">Verified cylinders</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Compliance Score</span>
                <span className="text-base font-bold font-mono text-navy-900">
                  {selectedOrg.complianceRating}%
                </span>
                <span className="text-[10px] text-slate-500 block">NBSM Standard</span>
              </div>
            </div>

            {selectedOrg.fillingUnitModel && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Filling Technology Integration:</span>
                <p className="font-medium text-slate-800">{selectedOrg.fillingUnitModel}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Connected directly via SCADA telemetry to NOC central reconciliation ledger.</p>
              </div>
            )}

            {/* Submitted Legal Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Submitted Statutory Documentation & Clearance ({selectedOrg.submittedDocuments.length})
              </h4>
              <div className="space-y-1.5">
                {selectedOrg.submittedDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{doc.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">({doc.type})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {doc.verified ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending Verification
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection Form Input */}
            {showRejectInput && (
              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 space-y-2 text-xs">
                <span className="font-bold text-red-900 block">Formal Rejection Notice (Sent to Applicant):</span>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify statutory shortfall e.g., Missing certified explosive containment boundary clearance..."
                  className="w-full p-2 bg-white border border-red-200 rounded-lg text-xs"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedOrg)}
                    className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                {selectedOrg.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleToggleSuspension(selectedOrg)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                  >
                    Issue Temporary License Suspension
                  </button>
                )}
                {selectedOrg.status === 'SUSPENDED' && (
                  <button
                    onClick={() => handleToggleSuspension(selectedOrg)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Reinstate Operating License
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {selectedOrg.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApprove(selectedOrg)}
                      className="px-4 py-2 text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Grant Operating License</span>
                    </button>
                  </>
                )}

                {selectedOrg.status !== 'PENDING_APPROVAL' && (
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

