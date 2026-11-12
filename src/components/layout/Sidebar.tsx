import React from 'react';
import { 
  LayoutDashboard, 
  GitFork, 
  AlertTriangle, 
  Building2, 
  UserCheck, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Radio,
  Globe
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../common/BrandLogo';

export type NavigationTab = 
  | 'dashboard'
  | 'distribution-chain'
  | 'discrepancies'
  | 'organizations'
  | 'approvals'
  | 'provinces'
  | 'activity'
  | 'audit-log'
  | 'reports';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  discrepancyCount: number;
  pendingApprovalsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onGoToPublic?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  discrepancyCount,
  pendingApprovalsCount,
  isOpenMobile,
  onCloseMobile,
  onGoToPublic,
}) => {
  const { t, language } = useLanguage();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: t('dashboard'),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'distribution-chain' as NavigationTab,
      label: t('distributionChain'),
      icon: GitFork,
      badge: 'Live',
      badgeColor: 'bg-flame-500/20 text-flame-300 border border-flame-500/30',
    },
    {
      id: 'discrepancies' as NavigationTab,
      label: t('discrepancies'),
      icon: AlertTriangle,
      badge: discrepancyCount > 0 ? String(discrepancyCount) : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'organizations' as NavigationTab,
      label: t('organizations'),
      icon: Building2,
      badge: null,
    },
    {
      id: 'approvals' as NavigationTab,
      label: t('approvals'),
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : null,
      badgeColor: 'bg-brand-500 text-white font-bold',
    },
    {
      id: 'provinces' as NavigationTab,
      label: t('regionalStock'),
      icon: MapPin,
      badge: '7 Prov',
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'activity' as NavigationTab,
      label: t('activityFeed'),
      icon: Activity,
      badge: null,
    },
    {
      id: 'audit-log' as NavigationTab,
      label: t('auditLog'),
      icon: ShieldCheck,
      badge: 'SHA-256',
      badgeColor: 'bg-brand-900 text-slate-300 font-mono text-[10px] border border-brand-700',
    },
    {
      id: 'reports' as NavigationTab,
      label: t('reports'),
      icon: FileSpreadsheet,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-brand-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-brand-900 dark:bg-brand-950 text-slate-100 border-r border-brand-800 dark:border-brand-900 transition-all duration-200 ease-in-out ${
        collapsed ? 'w-20' : 'w-72'
      } ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Brand / NOC Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-brand-800/80 dark:border-brand-900 bg-brand-950/40">
          <BrandLogo size="md" collapsed={collapsed} />

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar width"
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-brand-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Super Admin Context Pill */}
        {!collapsed && (
          <div className="px-4 py-3 mx-3 my-3 bg-brand-850/80 dark:bg-brand-900/60 rounded-xl border border-brand-750 dark:border-brand-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-flame-400 uppercase">
                {language === 'ne' ? 'केन्द्रीय प्रशासन' : 'NOC Regulatory Authority'}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flame-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-flame-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-semibold truncate mt-0.5">
              NOC Babarmahal HQ • Kathmandu
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isOpenMobile) onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl font-medium transition-all duration-150 group relative ${
                  collapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-flame-600 text-white shadow-md shadow-flame-900/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-brand-800/70 dark:hover:bg-brand-900'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-flame-400'
                  }`} />
                  {!collapsed && (
                    <span className="text-sm truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed active indicator bar */}
                {collapsed && isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-flame-500 rounded-r" />
                )}
              </button>
            );
          })}
        </div>

        {/* System & Trust Footer */}
        <div className="p-3 border-t border-brand-800/80 dark:border-brand-900 bg-brand-950/60">
          {onGoToPublic && (
            <button
              onClick={() => {
                onCloseMobile();
                onGoToPublic();
              }}
              className={`w-full flex items-center rounded-xl font-semibold transition-all duration-150 mb-3 text-flame-400 hover:text-white bg-brand-900/90 hover:bg-flame-600 border border-brand-800 shadow-2xs ${
                collapsed ? 'justify-center p-3' : 'px-3 py-2 space-x-2.5 text-xs'
              }`}
              title="Return to Citizen Public Portal"
            >
              <Globe className="w-4 h-4 shrink-0 text-flame-400 group-hover:text-white" />
              {!collapsed && (
                <span>{language === 'ne' ? 'नागरिक पोर्टल' : 'Citizen Portal'}</span>
              )}
            </button>
          )}

          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-flame-400" />
                  <span className="font-medium">National Grid Active</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">v2.5-PROD</span>
              </div>
              <div className="text-[11px] text-slate-400 bg-brand-900/90 p-2.5 rounded-lg border border-brand-800">
                <p className="font-bold text-slate-200">
                  {language === 'ne' ? 'प्रणाली नीति सूचना:' : 'Accountability Note:'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  Discrepancy is an operational variance trigger, not immediate proof of wrongdoing.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="NOC Live Monitoring Active">
              <div className="w-2.5 h-2.5 rounded-full bg-flame-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
