import React, { useState, useEffect } from 'react';
import { 
  mockNationalMetrics, 
  mockProvinces, 
  mockDiscrepancies, 
  mockOrganizations, 
  mockActivityLogs, 
  mockAuditTrail 
} from './data/mockData';
import { 
  DiscrepancyRecord, 
  Organization, 
  ProvinceMetric, 
  AuditTrailEntry,
  ActivityLog 
} from './types';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Header, UserRoleContext } from './components/layout/Header';
import { OverviewView } from './components/dashboard/OverviewView';
import { DistributionFlowVisualizer } from './components/dashboard/DistributionFlowVisualizer';
import { DiscrepancyManagementView } from './components/dashboard/DiscrepancyManagementView';
import { OrganizationManagementView } from './components/dashboard/OrganizationManagementView';
import { ProvinceStockMap } from './components/dashboard/ProvinceStockMap';
import { LiveActivityFeed } from './components/dashboard/LiveActivityFeed';
import { AuditLogView } from './components/dashboard/AuditLogView';
import { ReportsAnalyticsView } from './components/dashboard/ReportsAnalyticsView';
import { PlantOperatorPortal } from './components/roles/PlantOperatorPortal';
import { DistributorPortal } from './components/roles/DistributorPortal';
import { RetailerPortal } from './components/roles/RetailerPortal';
import { PublicConsumerPortal } from './components/roles/PublicConsumerPortal';
import { PublicWebsite } from './components/public/PublicWebsite';
import { AuthModal } from './components/auth/AuthModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CheckCircle2, AlertCircle, Info, ShieldCheck, Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';
import { BrandLogo } from './components/common/BrandLogo';
import { api } from './api/client';
import { OfflineDraftManager } from './utils/offlineDraftManager';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast, showToast, addNotification } = useNotifications();
  const { theme } = useTheme();

  // Role Context State
  const [activeRole, setActiveRole] = useState<UserRoleContext>('NOC_SUPER_ADMIN');

  // Public View vs Operator Console State
  const [isPublicView, setIsPublicView] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingDraftsCount, setPendingDraftsCount] = useState<number>(OfflineDraftManager.getPendingCount());
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Dynamic Data Store State
  const [metrics, setMetrics] = useState(mockNationalMetrics);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>(mockDiscrepancies);
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [provinces, setProvinces] = useState<ProvinceMetric[]>(mockProvinces);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>(mockAuditTrail);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);

  // Connectivity and Draft Synchronization Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Internet connection detected. Resuming real-time data sync.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline mode active. Operations are securely buffered locally.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodically inspect offline drafts store
    const draftInterval = setInterval(() => {
      setPendingDraftsCount(OfflineDraftManager.getPendingCount());
    }, 2500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(draftInterval);
    };
  }, []);

  // Initial and Role-Based Live API Fetch with Graceful Mock Fallback
  useEffect(() => {
    api.setRole(activeRole);

    const loadLiveTelemetry = async () => {
      try {
        const [orgsRes, discRes] = await Promise.allSettled([
          api.getOrganizations(),
          api.getDiscrepancies()
        ]);

        let connected = false;

        if (orgsRes.status === 'fulfilled' && orgsRes.value?.organizations?.length > 0) {
          connected = true;
          // Successfully retrieved live data from Express backend
        }

        if (discRes.status === 'fulfilled' && discRes.value?.discrepancies?.length > 0) {
          connected = true;
        }

        setIsBackendConnected(connected);
      } catch {
        setIsBackendConnected(false);
      }
    };

    loadLiveTelemetry();
  }, [activeRole]);

  // Discrepancy Action Handler
  const handleUpdateDiscrepancy = (updated: DiscrepancyRecord, actionType: string) => {
    setDiscrepancies(prev => prev.map(d => d.id === updated.id ? updated : d));

    const newSeq = auditTrail.length > 0 ? auditTrail[0].sequenceNumber + 1 : 1000;
    const newAuditEntry: AuditTrailEntry = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      sequenceNumber: newSeq,
      timestamp: new Date().toISOString(),
      actorId: 'NOC-USR-004',
      actorName: 'Dr. Chandan Adhikari',
      actorRole: 'NOC_SUPER_ADMIN',
      actionType: actionType,
      targetResource: `${updated.id} (${updated.consignmentId})`,
      newState: `STATUS: ${updated.status}; REMARKS: ${updated.initialRemarks}`,
      ipAddress: '103.10.232.14 (NOC Babarmahal HQ)',
      deviceFingerprint: 'CHROME-WIN-SECURE-SHA256',
      tamperProofHash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
    };

    setAuditTrail([newAuditEntry, ...auditTrail]);

    // Dispatch to Backend API or buffer offline
    api.transitionDiscrepancyStatus(updated.id, updated.status, updated.initialRemarks).catch(() => {
      OfflineDraftManager.saveDraft({
        type: 'DISCREPANCY_UPDATE',
        payload: { id: updated.id, status: updated.status, remarks: updated.initialRemarks }
      });
      setPendingDraftsCount(OfflineDraftManager.getPendingCount());
    });

    const newActivity: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      category: 'DISCREPANCY_FLAG',
      actor: {
        name: 'Dr. Chandan Adhikari',
        role: 'NOC Super Admin',
        org: 'NOC HQ Babarmahal',
      },
      action: `Discrepancy Ruling: ${updated.id}`,
      details: `Status shifted to ${updated.status}. Action audited under #${newSeq}.`,
      referenceId: updated.id,
      status: updated.status === 'RESOLVED' ? 'SUCCESS' : updated.status === 'SUSPECTED_DIVERSION' ? 'ALERT' : 'WARNING',
    };

    setActivityLogs([newActivity, ...activityLogs]);

    const openCases = discrepancies.filter(d => d.id !== updated.id ? d.status !== 'RESOLVED' : updated.status !== 'RESOLVED').length;
    setMetrics(m => ({ ...m, activeDiscrepanciesCount: openCases }));
  };

  // Organization Action Handler
  const handleUpdateOrg = (updated: Organization, actionType: string) => {
    setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));

    const newSeq = auditTrail.length > 0 ? auditTrail[0].sequenceNumber + 1 : 1000;
    const newAuditEntry: AuditTrailEntry = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      sequenceNumber: newSeq,
      timestamp: new Date().toISOString(),
      actorId: 'NOC-USR-004',
      actorName: 'Dr. Chandan Adhikari',
      actorRole: 'NOC_SUPER_ADMIN',
      actionType: actionType,
      targetResource: `${updated.id} (${updated.name})`,
      newState: `STATUS: ${updated.status}`,
      ipAddress: '103.10.232.14',
      deviceFingerprint: 'CHROME-WIN-SECURE-SHA256',
      tamperProofHash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
    };

    setAuditTrail([newAuditEntry, ...auditTrail]);

    // Dispatch to Backend API or buffer offline
    if (updated.status === 'ACTIVE') {
      api.approveOrganization(updated.id, actionType).catch(() => {
        OfflineDraftManager.saveDraft({
          type: 'ORG_APPROVAL',
          payload: { id: updated.id, status: updated.status, action: actionType }
        });
        setPendingDraftsCount(OfflineDraftManager.getPendingCount());
      });
    }

    const newActivity: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      category: 'APPROVAL',
      actor: {
        name: 'Dr. Chandan Adhikari',
        role: 'NOC Super Admin',
        org: 'NOC HQ Babarmahal',
      },
      action: `Entity Licensing: ${updated.name}`,
      details: `Operating status set to ${updated.status}. Registration #${updated.regNumber}`,
      referenceId: updated.id,
      status: updated.status === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
    };

    setActivityLogs([newActivity, ...activityLogs]);

    const pending = organizations.filter(o => o.id !== updated.id ? o.status === 'PENDING_APPROVAL' : updated.status === 'PENDING_APPROVAL').length;
    setMetrics(m => ({ ...m, pendingApprovalsCount: pending }));
  };

  // Province Quota Handler
  const handleUpdateQuota = (provId: number, newQuota: number) => {
    setProvinces(prev => prev.map(p => p.id === provId ? { ...p, monthlyQuotaMT: newQuota } : p));
  };

  // Cross-Role Lifecycle: Plant Outbound Dispatch
  const handlePlantDispatchCreated = (dispatchData: any) => {
    setMetrics(m => ({ ...m, cylindersDispatchedCount: m.cylindersDispatchedCount + dispatchData.quantity }));

    const newActivity: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      category: 'DISPATCH',
      actor: {
        name: 'Bikash Karki',
        role: 'Plant Dispatch Officer',
        org: 'Nepal Gas Udyog Ltd. (Balaju)',
      },
      action: `Plant Outbound Gate Pass Issued: ${dispatchData.id}`,
      details: `${dispatchData.quantity} cylinders dispatched to ${dispatchData.receiver} on truck ${dispatchData.vehicle}. Barcode seal #${dispatchData.tamperSeal}`,
      referenceId: dispatchData.id,
      status: 'SUCCESS',
    };
    setActivityLogs(prev => [newActivity, ...prev]);
    showToast(`Consignment ${dispatchData.id} recorded in national dispatch ledger.`, 'success');
  };

  // Cross-Role Lifecycle: Distributor Inbound Receiving Bay Intake
  const handleDistributorConfirmedDelivery = (consignmentCode: string, receivedCount: number, missingSerials: string[]) => {
    const isMismatch = missingSerials.length > 0 || receivedCount < 800;

    if (isMismatch) {
      const varianceQty = 800 - receivedCount;
      const newCaseId = `DSC-2083-${Math.floor(100 + Math.random() * 900)}`;
      const newDiscrepancy: DiscrepancyRecord = {
        id: newCaseId,
        consignmentId: consignmentCode,
        sourceEntity: {
          id: 'PLANT-001',
          name: 'Nepal Gas Udyog Ltd.',
          type: 'BOTTLING_PLANT',
          location: 'Balaju Industrial Area, Kathmandu',
          province: 'Bagmati Province',
        },
        destinationEntity: {
          id: 'DIST-0042',
          name: 'Patan Traders & Energy Suppliers',
          type: 'DISTRIBUTOR',
          location: 'Lagankhel, Lalitpur',
          province: 'Bagmati Province',
        },
        dispatchedAt: new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        expectedQty: 800,
        dispatchedQty: 800,
        receivedQty: receivedCount,
        varianceQty: -Math.abs(varianceQty),
        unmatchedSerials: missingSerials,
        status: 'UNDER_INVESTIGATION',
        severity: varianceQty > 20 ? 'CRITICAL' : 'HIGH',
        assignedOfficer: 'Er. Rajesh K. Shrestha (NOC Tech Cell)',
        lastUpdated: new Date().toISOString(),
        initialRemarks: `Receiving bay scan detected ${varianceQty} missing or unreadable valve tags (${missingSerials.join(', ') || 'barcode unreadable'}). Flagged for formal NOC investigation.`,
        investigationNotes: [
          {
            id: `NOTE-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: 'Patan Receiving Supervisor',
            role: 'Distributor Receiving Officer',
            note: `Inbound conveyor bay verified ${receivedCount} compliant units out of 800 expected. ${varianceQty} units unlocated or tags unreadable.`,
            statusChange: 'UNDER_INVESTIGATION',
          }
        ],
      };

      setDiscrepancies(prev => [newDiscrepancy, ...prev]);
      setMetrics(m => ({ ...m, activeDiscrepanciesCount: m.activeDiscrepanciesCount + 1 }));

      const newSeq = auditTrail.length > 0 ? auditTrail[0].sequenceNumber + 1 : 1000;
      const newAuditEntry: AuditTrailEntry = {
        id: `AUD-${Date.now().toString().slice(-5)}`,
        sequenceNumber: newSeq,
        timestamp: new Date().toISOString(),
        actorId: 'DIST-USR-102',
        actorName: 'Patan Receiving Supervisor',
        actorRole: 'DISTRIBUTOR',
        actionType: 'RECEIVING_VARIANCE_FLAGGED',
        targetResource: `${consignmentCode} (${newCaseId})`,
        newState: `RECEIVED: ${receivedCount}/800; MISSING_TAGS: ${missingSerials.length}`,
        ipAddress: '103.10.235.91 (Lagankhel Wholesale Bay)',
        deviceFingerprint: 'RFID-CONVEYOR-UNIT-04',
        tamperProofHash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      };
      setAuditTrail(prev => [newAuditEntry, ...prev]);

      addNotification({
        title: 'Discrepancy Auto-Flagged at Receiving Bay',
        description: `Consignment ${consignmentCode} received with ${varianceQty} missing units. Case ${newCaseId} created for NOC review.`,
        type: 'WARNING',
      });
    } else {
      setMetrics(m => ({ ...m, cylindersConfirmedReceivedCount: m.cylindersConfirmedReceivedCount + receivedCount }));
    }
  };

  // Live Sync Trigger
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('National LPG telemetry nodes synchronized with 0 packet drops.', 'success');
      addNotification({
        title: 'Telemetry Synchronization Completed',
        description: '28 Bottling Plants and IOC Customs Gates reported fresh inventory logs.',
        type: 'SUCCESS',
      });
    }, 1000);
  };

  const pendingApprovalsCount = organizations.filter(o => o.status === 'PENDING_APPROVAL').length;
  const activeDiscrepanciesCount = discrepancies.filter(d => d.status !== 'RESOLVED').length;

  // New Organization Self-Registration Handler
  const handleRegisterOrganization = (newOrg: Organization) => {
    setOrganizations(prev => [newOrg, ...prev]);
    setMetrics(m => ({ ...m, pendingApprovalsCount: m.pendingApprovalsCount + 1 }));
    showToast(`Registration for ${newOrg.name} submitted for NOC review.`, 'success');
    addNotification({
      title: 'New Organization Registration Pending Review',
      description: `${newOrg.name} (${newOrg.type.replace(/_/g, ' ')}) registered under Reg #${newOrg.regNumber}. Review in Entity Approvals.`,
      type: 'WARNING',
    });
    setIsAuthModalOpen(false);
  };

  // If in Citizen Public Mode, render dedicated Public Experience with modal overlays
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-[#F3F1EC] dark:bg-[#192630] text-slate-800 dark:text-slate-100 transition-colors duration-150">
        <PublicWebsite
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || 'LOGIN');
            setIsAuthModalOpen(true);
          }}
          onEnterOperatorConsole={() => {
            setIsPublicView(false);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onLoginSuccess={(role) => {
            setActiveRole(role);
            setIsPublicView(false);
            setIsAuthModalOpen(false);
            showToast(`Signed into console as ${role.replace(/_/g, ' ')}`, 'success');
          }}
          onRegisterOrganization={handleRegisterOrganization}
        />

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200 shadow-dropdown">
            <div className={`px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-xs font-semibold border ${
              toast.type === 'error'
                ? 'bg-red-900 text-white border-red-800'
                : toast.type === 'info'
                  ? 'bg-brand-950 text-white border-brand-800'
                  : 'bg-emerald-900 text-white border-emerald-800'
            }`}>
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-flame-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF1F6] dark:bg-[#09121E] text-slate-800 dark:text-slate-100 flex transition-colors duration-150">
      
      {/* Sidebar (Rendered for Super Admin or collapsible) */}
      {activeRole === 'NOC_SUPER_ADMIN' && (
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={collapsedSidebar}
          onToggleCollapse={() => setCollapsedSidebar(!collapsedSidebar)}
          discrepancyCount={activeDiscrepanciesCount}
          pendingApprovalsCount={pendingApprovalsCount}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onGoToPublic={() => setIsPublicView(true)}
        />
      )}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
        activeRole === 'NOC_SUPER_ADMIN' ? (collapsedSidebar ? 'lg:pl-20' : 'lg:pl-72') : 'pl-0'
      }`}>
        
        {/* Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectTab={setCurrentTab}
          onTriggerSync={handleTriggerSync}
          isSyncing={isSyncing}
          activeRole={activeRole}
          onSelectRole={setActiveRole}
          onGoToPublic={() => setIsPublicView(true)}
        />

        {/* Brand Infrastructure Identity Banner */}
        <div className="bg-brand-950 dark:bg-black/40 text-slate-300 px-4 lg:px-8 py-2 text-xs flex flex-wrap items-center justify-between border-b border-brand-850 dark:border-brand-900 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
            <span className="font-bold text-white">
              {language === 'ne' ? 'नेपाल आयल निगम (एनओसी) — राष्ट्रिय एलपिजी अनुगमन कन्सोल' : 'Nepal Oil Corporation (NOC) — National LPG Custody Grid'}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-[11px] bg-brand-900 px-2 py-0.5 rounded text-flame-300 border border-brand-800 font-mono">
              Role: {activeRole.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-flame-400" />
              <span>MoICS Standard NS:533</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-300">Gazetted Domestic: NPR 1,895</span>
          </div>
        </div>

        {/* Connectivity, Offline Drafts & Telemetry Synchronizer Strip */}
        {(!isOnline || pendingDraftsCount > 0 || isBackendConnected) && (
          <div className={`px-4 lg:px-8 py-1.5 text-xs flex flex-wrap items-center justify-between border-b transition-colors gap-2 ${
            !isOnline
              ? 'bg-amber-950/80 text-amber-200 border-amber-800'
              : pendingDraftsCount > 0
                ? 'bg-flame-950/80 text-flame-200 border-flame-800'
                : 'bg-brand-900/40 text-slate-300 border-brand-800/60'
          }`}>
            <div className="flex items-center space-x-2">
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-300">Offline Standalone Mode:</span>
                  <span className="text-amber-200">Local cryptographic journal active. Forms will sync upon reconnecting.</span>
                </>
              ) : pendingDraftsCount > 0 ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-flame-400 animate-spin shrink-0" />
                  <span className="font-semibold text-flame-300">{pendingDraftsCount} Local Operation(s) Pending Gateway Sync</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-mono text-[11px]">API Node Connected — HMAC Audit Chaining Verified</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {pendingDraftsCount > 0 && (
                <button
                  onClick={handleTriggerSync}
                  className="px-2.5 py-0.5 bg-flame-600 hover:bg-flame-500 text-white font-bold rounded text-[11px] transition-colors shadow-2xs"
                >
                  Flush Drafts ({pendingDraftsCount})
                </button>
              )}
              <span className="font-mono text-[10px] bg-brand-950 px-2 py-0.5 rounded text-slate-300 border border-brand-800">
                Grid: {isOnline ? (isBackendConnected ? 'CONNECTED' : 'STANDBY') : 'OFFLINE'}
              </span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. PLANT OPERATOR VIEW */}
          {activeRole === 'PLANT_OPERATOR' && (
            <PlantOperatorPortal onDispatchCreated={handlePlantDispatchCreated} />
          )}

          {/* 2. DISTRIBUTOR VIEW */}
          {activeRole === 'DISTRIBUTOR_MANAGER' && (
            <DistributorPortal onConfirmDelivery={handleDistributorConfirmedDelivery} />
          )}

          {/* 3. RETAILER VIEW */}
          {activeRole === 'RETAILER_OPERATOR' && (
            <RetailerPortal />
          )}

          {/* 4. PUBLIC CITIZEN VIEW */}
          {activeRole === 'PUBLIC_CITIZEN' && (
            <PublicConsumerPortal />
          )}

          {/* 5. NOC SUPER ADMIN CONSOLE (DEFAULT) */}
          {activeRole === 'NOC_SUPER_ADMIN' && (
            <>
              {currentTab === 'dashboard' && (
                <OverviewView
                  metrics={metrics}
                  discrepancies={discrepancies}
                  activities={activityLogs}
                  organizations={organizations}
                  provinces={provinces}
                  onNavigateTab={setCurrentTab}
                  onSelectDiscrepancy={() => setCurrentTab('discrepancies')}
                />
              )}

              {currentTab === 'distribution-chain' && (
                <div className="space-y-6">
                  <DistributionFlowVisualizer />
                  <ProvinceStockMap
                    provinces={provinces}
                    onUpdateQuota={handleUpdateQuota}
                  />
                </div>
              )}

              {currentTab === 'discrepancies' && (
                <DiscrepancyManagementView
                  discrepancies={discrepancies}
                  onUpdateDiscrepancy={handleUpdateDiscrepancy}
                />
              )}

              {currentTab === 'organizations' && (
                <OrganizationManagementView
                  organizations={organizations}
                  onUpdateOrg={handleUpdateOrg}
                  initialFilter="ALL"
                />
              )}

              {currentTab === 'approvals' && (
                <OrganizationManagementView
                  organizations={organizations}
                  onUpdateOrg={handleUpdateOrg}
                  initialFilter="PENDING_APPROVAL"
                />
              )}

              {currentTab === 'provinces' && (
                <ProvinceStockMap
                  provinces={provinces}
                  onUpdateQuota={handleUpdateQuota}
                />
              )}

              {currentTab === 'activity' && (
                <LiveActivityFeed logs={activityLogs} />
              )}

              {currentTab === 'audit-log' && (
                <AuditLogView entries={auditTrail} />
              )}

              {currentTab === 'reports' && (
                <ReportsAnalyticsView />
              )}
            </>
          )}

        </main>

        {/* Professional Government Infrastructure Footer */}
        <footer className="border-t border-slate-200 dark:border-brand-850 bg-white dark:bg-brand-900/90 py-4 px-4 lg:px-8 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <BrandLogo size="sm" showText={false} />
              <span className="font-bold text-slate-700 dark:text-slate-200">LPG Tracker Nepal</span>
              <span>— Government of Nepal • Nepal Oil Corporation (NOC)</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400 dark:text-slate-500">
              <span>National Accountability Framework</span>
              <span>•</span>
              <span>Excludes Household Retail Scope</span>
              <span>•</span>
              <span className="font-mono">Security Seal: Validated</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Global Auth & Registration Modal for Operator Console */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={(role) => {
          setActiveRole(role);
          setIsAuthModalOpen(false);
          showToast(`Switched active console role to ${role.replace(/_/g, ' ')}`, 'success');
        }}
        onRegisterOrganization={handleRegisterOrganization}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200 shadow-dropdown">
          <div className={`px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-xs font-semibold border ${
            toast.type === 'error'
              ? 'bg-red-900 text-white border-red-800'
              : toast.type === 'info'
                ? 'bg-brand-950 text-white border-brand-800'
                : 'bg-emerald-900 text-white border-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-flame-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
