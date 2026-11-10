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
  Flame,
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
      badgeColor: 'bg-teal-500/20 text-teal-300',
    },
    {
      id: 'discrepancies' as NavigationTab,
      label: t('discrepancies'),
      icon: AlertTriangle,
      badge: discrepancyCount > 0 ? String(discrepancyCount) : null,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
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
      badgeColor: 'bg-teal-400 text-navy-950 font-bold',
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
      badgeColor: 'bg-navy-700 text-teal-300 font-mono text-[10px]',
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
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-navy-900 text-slate-100 border-r border-navy-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-72'
      } ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Brand / NOC Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-navy-800/80 bg-navy-950/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <Flame className="w-6 h-6 text-white" />
            </div>

            {!collapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold tracking-tight text-white text-base">
                    LPG TRACKER
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    NEPAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {language === 'ne' ? 'नेपाल आयल निगम' : 'Nepal Oil Corporation'}
                </p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Super Admin Context Pill */}
        {!collapsed && (
          <div className="px-4 py-3 mx-3 my-3 bg-navy-800/60 rounded-lg border border-navy-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-teal-400 uppercase">
                {language === 'ne' ? 'केन्द्रीय प्रशासन' : 'Super Admin Role'}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
              NOC Babarmahal HQ
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
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
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/70'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  }`} />
                  {!collapsed && (
                    <span className="text-sm truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed active indicator bar */}
                {collapsed && isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r" />
                )}
              </button>
            );
          })}
        </div>

        {/* System & Trust Footer */}
        <div className="p-3 border-t border-navy-800/80 bg-navy-950/60">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                  <span>National Grid Online</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">v2.4.0-NOC</span>
              </div>
              <div className="text-[11px] text-slate-400 bg-navy-900/90 p-2 rounded border border-navy-800">
                <p className="font-semibold text-slate-300">
                  {language === 'ne' ? 'प्रणाली नीति सूचना:' : 'Accountability Note:'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  Discrepancy is an operational variance trigger, not immediate proof of fraud.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="NOC Live Monitoring Active">
              <div className="w-3 h-3 rounded-full bg-teal-500 pulse-teal" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
