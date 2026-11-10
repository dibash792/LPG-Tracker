import React, { useState } from 'react';
import { ActivityLog } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Activity, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  UserCheck, 
  Cpu, 
  Clock, 
  Filter,
  Search
} from 'lucide-react';

interface LiveActivityFeedProps {
  logs: ActivityLog[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ logs }) => {
  const { t, language } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.name.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.org.toLowerCase().includes(search.toLowerCase()) ||
      log.referenceId.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DISPATCH':
        return Truck;
      case 'RECEIVING':
        return CheckCircle2;
      case 'DISCREPANCY_FLAG':
        return AlertTriangle;
      case 'APPROVAL':
        return UserCheck;
      case 'STOCK_AUDIT':
        return Cpu;
      case 'SECURITY':
        return ShieldCheck;
      default:
        return Activity;
    }
  };

  const getCategoryColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'WARNING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ALERT':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Feed Header */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-navy-950">
                {language === 'ne' ? 'प्रत्यक्ष प्रणाली प्रवाह तथा घटनाक्रम' : 'National Real-Time Operational Activity Stream'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live operational stream aggregating consignments, weighbridge events, telemetry synchs, and regulatory actions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              <span>Real-Time Stream Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity, actor, consignment ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Event Categories</option>
            <option value="DISPATCH">Dispatches</option>
            <option value="RECEIVING">Receipt Confirmations</option>
            <option value="DISCREPANCY_FLAG">Discrepancy Flags</option>
            <option value="APPROVAL">Approvals</option>
            <option value="STOCK_AUDIT">Stock & Telemetry</option>
            <option value="SECURITY">Security & Auth</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredLogs.map((log) => {
            const Icon = getCategoryIcon(log.category);
            const colorClass = getCategoryColor(log.status);

            return (
              <div key={log.id} className="relative group">
                {/* Timeline node */}
                <div className={`absolute -left-[30px] top-1 p-1 rounded-full bg-white border shadow-2xs ${colorClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-navy-950">
                        {log.action}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${colorClass}`}>
                        {log.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    {log.details}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-500">
                    <span className="font-medium text-slate-700">
                      Actor: {log.actor.name} ({log.actor.role}) • <span className="text-slate-400">{log.actor.org}</span>
                    </span>
                    <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Ref: {log.referenceId}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
