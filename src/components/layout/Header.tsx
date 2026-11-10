import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Globe, 
  RefreshCw, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  ExternalLink,
  Check,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSelectTab: (tab: any) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  searchTerm,
  onSearchChange,
  onSelectTab,
  onTriggerSync,
  isSyncing,
}) => {
  const { language, setLanguage, t, dateBS } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, showToast } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-xs">
      
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
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
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 placeholder-slate-400 font-sans"
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

      {/* Right: National Identity, Date, Language, Live Refresh, Alerts, Admin User */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        
        {/* National Date & Time */}
        <div className="hidden xl:flex flex-col text-right pr-2 border-r border-slate-200">
          <span className="text-xs font-semibold text-navy-950 flex items-center justify-end space-x-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>{dateBS}</span>
          </span>
          <span className="text-[11px] text-slate-400">
            NOC National LPG Grid
          </span>
        </div>

        {/* Language Switcher Button */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setLanguage('en');
              showToast('Switched to English interface', 'info');
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              language === 'en'
                ? 'bg-navy-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => {
              setLanguage('ne');
              showToast('नेपाली भाषामा रूपान्तरण भयो', 'info');
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              language === 'ne'
                ? 'bg-navy-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isSyncing ? 'Syncing...' : 'Live Sync'}
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
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
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-dropdown border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">System Alerts & Notices</h4>
                  <p className="text-xs text-slate-300">
                    {unreadCount} unacknowledged events
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-300 hover:text-white underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
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
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="pt-0.5">
                          {n.type === 'CRITICAL' ? (
                            <div className="w-2 h-2 rounded-full bg-red-600" />
                          ) : n.type === 'WARNING' ? (
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-teal-500" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-semibold text-navy-950">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-2">
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

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  onClick={() => {
                    onSelectTab('audit-log');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-medium text-navy-800 hover:text-teal-600"
                >
                  View Complete Audit Trail →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Profile Badge */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-navy-800 text-teal-400 font-bold flex items-center justify-center text-sm shadow-xs">
              NOC
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-navy-950">
                Dr. Chandan Adhikari
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Super Admin • Director
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-dropdown border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Highest Clearance
                  </span>
                </div>
                <p className="text-sm font-bold text-navy-950 mt-1">
                  Dr. Chandan Adhikari
                </p>
                <p className="text-xs text-slate-500">
                  chandan.adhikari@noc.org.np
                </p>
                <div className="mt-2 text-[10px] bg-teal-50 text-teal-800 font-mono px-2 py-0.5 rounded border border-teal-200 inline-block">
                  Session Token: NOC-HW-9912-SEC
                </div>
              </div>

              <div className="py-2 px-1 text-xs">
                <button
                  onClick={() => {
                    onSelectTab('audit-log');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-between"
                >
                  <span>My Administrative Actions</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    onSelectTab('approvals');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-between"
                >
                  <span>Pending Approvals Queue</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">2 New</span>
                </button>
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-xs">
                <button
                  onClick={() => {
                    showToast('Logged out of demo session. Reloading credentials...', 'info');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Super Admin Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
