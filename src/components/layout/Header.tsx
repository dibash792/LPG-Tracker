import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Globe, 
  RefreshCw, 
  ShieldCheck, 
  ChevronDown,
  LogOut,
  Clock,
  Building2,
  Truck,
  Store,
  Users
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { ThemeToggle } from '../common/ThemeToggle';

export type UserRoleContext = 
  | 'NOC_SUPER_ADMIN' 
  | 'PLANT_OPERATOR' 
  | 'DISTRIBUTOR_MANAGER' 
  | 'RETAILER_OPERATOR' 
  | 'PUBLIC_CITIZEN';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSelectTab: (tab: any) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  activeRole: UserRoleContext;
  onSelectRole: (role: UserRoleContext) => void;
  onGoToPublic?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  searchTerm,
  onSearchChange,
  onSelectTab,
  onTriggerSync,
  isSyncing,
  activeRole,
  onSelectRole,
  onGoToPublic,
}) => {
  const { language, setLanguage, t, dateBS } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, showToast } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList = [
    {
      id: 'NOC_SUPER_ADMIN' as const,
      label: 'NOC Super Admin',
      entity: 'Nepal Oil Corp Babarmahal HQ',
      icon: ShieldCheck,
      badgeColor: 'bg-brand-900 text-flame-400 border border-brand-700',
    },
    {
      id: 'PLANT_OPERATOR' as const,
      label: 'Bottling Plant Operator',
      entity: 'Nepal Gas Udyog Ltd. (Balaju)',
      icon: Building2,
      badgeColor: 'bg-flame-600 text-white',
    },
    {
      id: 'DISTRIBUTOR_MANAGER' as const,
      label: 'Authorized Distributor',
      entity: 'Patan Traders (Lagankhel)',
      icon: Truck,
      badgeColor: 'bg-brand-700 text-white',
    },
    {
      id: 'RETAILER_OPERATOR' as const,
      label: 'Local LPG Retailer',
      entity: 'Baluwatar Gas & Grocery Store',
      icon: Store,
      badgeColor: 'bg-slate-700 text-white',
    },
    {
      id: 'PUBLIC_CITIZEN' as const,
      label: 'General Citizen / Public',
      entity: 'Public Availability & QRT Portal',
      icon: Users,
      badgeColor: 'bg-blue-700 text-white',
    },
  ];

  const currentRoleObj = rolesList.find(r => r.id === activeRole) || rolesList[0];

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/95 dark:bg-brand-900/95 backdrop-blur border-b border-slate-200/90 dark:border-brand-800/90 px-4 lg:px-8 flex items-center justify-between shadow-2xs transition-colors duration-150">
      
      {/* Left: Mobile hamburger & Global Search bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-brand-950/80 border border-slate-200 dark:border-brand-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-flame-500/20 focus:border-flame-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle, Role Switcher, Language, Live Sync, Alerts */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Switch to Public Portal Button */}
        {onGoToPublic && (
          <button
            onClick={onGoToPublic}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-brand-900 dark:text-slate-100 bg-brand-50 dark:bg-brand-850 hover:bg-brand-100 dark:hover:bg-brand-800 border border-brand-200 dark:border-brand-700 transition-colors shadow-2xs"
            title="Switch to Citizen Public Portal"
          >
            <Globe className="w-3.5 h-3.5 text-flame-500" />
            <span>Public Portal</span>
          </button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Interactive Role Switcher Selector */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-brand-800 bg-slate-50 dark:bg-brand-850 hover:bg-slate-100 dark:hover:bg-brand-800 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${currentRoleObj.badgeColor}`}>
              <currentRoleObj.icon className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{currentRoleObj.label}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">{currentRoleObj.entity}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-brand-900 rounded-2xl shadow-dropdown border border-slate-200 dark:border-brand-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-brand-950 text-white text-xs border-b border-brand-850">
                <span className="font-bold block">Switch User Role Context</span>
                <span className="text-[11px] text-slate-400">Preview system experience across all tiers</span>
              </div>

              <div className="p-1.5 space-y-1">
                {rolesList.map((r) => {
                  const Icon = r.icon;
                  const isSelected = r.id === activeRole;

                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectRole(r.id);
                        setShowRoleMenu(false);
                        showToast(`Switched interface to ${r.label}`, 'info');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 ${
                        isSelected 
                          ? 'bg-slate-100 dark:bg-brand-800 font-bold border border-slate-200 dark:border-brand-700' 
                          : 'hover:bg-slate-50 dark:hover:bg-brand-850 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${r.badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 truncate">
                        <span className="text-xs font-bold block text-slate-900 dark:text-white">{r.label}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{r.entity}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {onGoToPublic && (
                <div className="p-2 border-t border-slate-200 dark:border-brand-850 bg-slate-50 dark:bg-brand-950">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onGoToPublic();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl bg-flame-600 hover:bg-flame-500 text-white transition-colors shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Return to Public Citizen Portal</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* National Date & Time */}
        <div className="hidden 2xl:flex flex-col text-right pr-2 border-r border-slate-200 dark:border-brand-800">
          <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-end space-x-1">
            <Clock className="w-3.5 h-3.5 text-flame-600 dark:text-flame-400" />
            <span>{dateBS}</span>
          </span>
          <span className="text-[11px] text-slate-400">
            NOC National LPG Grid
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-brand-950 p-1 rounded-xl border border-slate-200 dark:border-brand-800">
          <button
            onClick={() => {
              setLanguage('en');
              showToast('Switched to English interface', 'info');
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              language === 'en'
                ? 'bg-brand-800 dark:bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => {
              setLanguage('ne');
              showToast('नेपाली भाषामा रूपान्तरण भयो', 'info');
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              language === 'ne'
                ? 'bg-brand-800 dark:bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            नेपाली
          </button>
        </div>

        {/* Live Sync Action Button */}
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          title={t('refreshLive')}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-brand-850 border border-slate-200 dark:border-brand-800 hover:bg-slate-50 dark:hover:bg-brand-800 rounded-xl transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-flame-600 dark:text-flame-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden xl:inline">
            {isSyncing ? 'Syncing...' : 'Live Sync'}
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-brand-900 rounded-2xl shadow-dropdown border border-slate-200 dark:border-brand-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 bg-brand-950 text-white flex items-center justify-between border-b border-brand-850">
                <div>
                  <h4 className="font-bold text-sm">System Alerts & Notices</h4>
                  <p className="text-xs text-slate-400">
                    {unreadCount} unacknowledged events
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-flame-300 hover:text-white underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-brand-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.linkAction) {
                          onSelectTab(n.linkAction);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-brand-850 cursor-pointer transition-colors ${
                        !n.read ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="pt-0.5">
                          {n.type === 'CRITICAL' ? (
                            <div className="w-2 h-2 rounded-full bg-red-600" />
                          ) : n.type === 'WARNING' ? (
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {n.description}
                          </p>
                          <span className="text-[10px] text-slate-400 block pt-1">
                            {n.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-brand-950 border-t border-slate-200 dark:border-brand-800 text-center">
                <button
                  onClick={() => {
                    onSelectTab('audit-log');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-semibold text-brand-700 dark:text-brand-300 hover:text-flame-600"
                >
                  View Complete Audit Trail →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
