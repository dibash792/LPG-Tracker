import React, { useState } from 'react';
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
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, ShieldCheck, Flame } from 'lucide-react';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast, showToast, addNotification } = useNotifications();

  // Role Context State
  const [activeRole, setActiveRole] = useState<UserRoleContext>('NOC_SUPER_ADMIN');

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic Data Store State
  const [metrics, setMetrics] = useState(mockNationalMetrics);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>(mockDiscrepancies);
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [provinces, setProvinces] = useState<ProvinceMetric[]>(mockProvinces);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>(mockAuditTrail);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);

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

  return (
    <div className="min-h-screen bg-surface-canvas flex">
      
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
        />
      )}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
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
        />

        {/* Demo Data & Transparency Banner */}
        <div className="bg-navy-950 text-slate-300 px-4 lg:px-8 py-2 text-xs flex flex-wrap items-center justify-between border-b border-navy-800 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-semibold text-white">
              {language === 'ne' ? 'नेपाल आयल निगम (एनओसी) — राष्ट्रिय एलपिजी अनुगमन कन्सोल' : 'Nepal Oil Corporation (NOC) — National LPG Custody Grid'}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-[11px] bg-navy-800 px-2 py-0.5 rounded text-amber-300 border border-navy-700">
              Active Role: {activeRole.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>MoICS Standard NS:533</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-300">Regulated Domestic: NPR 1,895</span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. PLANT OPERATOR VIEW */}
          {activeRole === 'PLANT_OPERATOR' && (
            <PlantOperatorPortal />
          )}

          {/* 2. DISTRIBUTOR VIEW */}
          {activeRole === 'DISTRIBUTOR_MANAGER' && (
            <DistributorPortal />
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

        {/* Professional Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-4 lg:px-8 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-700">LPG Tracker Nepal</span>
              <span>— Government of Nepal • Nepal Oil Corporation (NOC)</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span>National Accountability Platform</span>
              <span>•</span>
              <span>Excludes Household Retail Scope</span>
              <span>•</span>
              <span className="font-mono">Security Seal: Validated</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200 shadow-dropdown">
          <div className={`px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-xs font-semibold border ${
            toast.type === 'error'
              ? 'bg-red-900 text-white border-red-800'
              : toast.type === 'info'
                ? 'bg-navy-900 text-white border-navy-800'
                : 'bg-emerald-900 text-white border-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
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
    <LanguageProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;
