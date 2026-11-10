import React from 'react';
import { 
  NationalMetrics, 
  DiscrepancyRecord, 
  ActivityLog, 
  Organization,
  ProvinceMetric 
} from '../../types';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { DistributionFlowVisualizer } from './DistributionFlowVisualizer';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Fuel, 
  Boxes, 
  Truck, 
  CheckCircle2, 
  Store, 
  AlertTriangle, 
  ArrowRight, 
  Building2, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  ExternalLink
} from 'lucide-react';

interface OverviewViewProps {
  metrics: NationalMetrics;
  discrepancies: DiscrepancyRecord[];
  activities: ActivityLog[];
  organizations: Organization[];
  provinces: ProvinceMetric[];
  onNavigateTab: (tab: any) => void;
  onSelectDiscrepancy: (caseItem: DiscrepancyRecord) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  discrepancies,
  activities,
  organizations,
  provinces,
  onNavigateTab,
  onSelectDiscrepancy,
}) => {
  const { t, formatNumber, language } = useLanguage();

  const activeDiscrepancies = discrepancies.filter(d => d.status !== 'RESOLVED');
  const pendingApprovals = organizations.filter(o => o.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6">
      
      {/* 1. National Overview Metrics Grid (6 Required Core Metrics) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {language === 'ne' ? 'राष्ट्रिय प्रमुख सूचकहरू (महिनावारी स्थिति)' : 'National Executive Metrics (30-Day Aggregation)'}
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Source: NOC Central Grid & SCADA Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* 1. Bulk LPG received */}
          <MetricCard
            title={t('bulkImportReceived')}
            value={metrics.bulkLpgReceivedMT}
            unit="MT"
            trend={metrics.bulkLpgReceivedTrend}
            icon={Fuel}
            statusVariant="default"
            subtext="From IOC Terminals"
          />

          {/* 2. Cylinders filled */}
          <MetricCard
            title={t('cylindersFilled')}
            value={metrics.cylindersFilledCount}
            trend={metrics.cylindersFilledTrend}
            icon={Boxes}
            statusVariant="accent"
            subtext="28 Bottling Plants"
          />

          {/* 3. Cylinders dispatched */}
          <MetricCard
            title={t('cylindersDispatched')}
            value={metrics.cylindersDispatchedCount}
            trend={metrics.cylindersDispatchedTrend}
            icon={Truck}
            statusVariant="default"
            subtext="En Route to Wholesalers"
          />

          {/* 4. Cylinders confirmed received */}
          <MetricCard
            title={t('cylindersConfirmed')}
            value={metrics.cylindersConfirmedReceivedCount}
            trend={metrics.cylindersConfirmedReceivedTrend}
            icon={CheckCircle2}
            statusVariant="success"
            subtext="Cryptographically signed"
          />

          {/* 5. Retailer stock */}
          <MetricCard
            title={t('retailerStock')}
            value={metrics.retailerStockCount}
            trend={metrics.retailerStockTrend}
            icon={Store}
            statusVariant="default"
            subtext="4,210 Verified Shops"
          />

          {/* 6. Discrepancies requiring investigation (Warning / Alert) */}
          <MetricCard
            title={t('discrepanciesFlagged')}
            value={metrics.activeDiscrepanciesCount}
            unit="Cases"
            trend={metrics.discrepanciesTrend}
            trendLabel="vs last week"
            icon={AlertTriangle}
            statusVariant={metrics.activeDiscrepanciesCount > 10 ? 'alert' : 'warning'}
            onClick={() => onNavigateTab('discrepancies')}
          />
        </div>
      </div>

      {/* Pending Account Approvals Action Callout */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                NOC Administrative Action: {pendingApprovals.length} Entity Registrations Pending
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/80">
                Companies have submitted statutory OCR certificates, EIA environmental clearances, and bank guarantees awaiting license grant.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('approvals')}
            className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto flex items-center space-x-1.5"
          >
            <span>Review Registration Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Visual Representation of the Distribution Chain */}
      <DistributionFlowVisualizer />

      {/* 3. Two Column Section: Live Discrepancy Snapshot & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Discrepancy Management Mini-Desk (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-brand-900/70 rounded-2xl p-6 shadow-card border border-slate-200/90 dark:border-brand-800/80 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-brand-800/60">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Discrepancies Under NOC Review ({activeDiscrepancies.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Custody transfer quantity variances requiring tare check, driver inquiry, or field inspection.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('discrepancies')}
              className="text-xs font-semibold text-brand-700 dark:text-brand-300 hover:text-flame-600 dark:hover:text-flame-400 hover:underline flex items-center space-x-1"
            >
              <span>View All Cases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeDiscrepancies.slice(0, 3).map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => {
                  onSelectDiscrepancy(caseItem);
                  onNavigateTab('discrepancies');
                }}
                className="p-3.5 bg-slate-50/70 dark:bg-brand-950/60 hover:bg-slate-50 dark:hover:bg-brand-850 rounded-xl border border-slate-200 dark:border-brand-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {caseItem.id}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {caseItem.consignmentId}
                    </span>
                  </div>
                  <StatusBadge status={caseItem.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-2">
                  <div className="truncate max-w-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">{caseItem.sourceEntity.name}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="text-slate-700 dark:text-slate-300">{caseItem.destinationEntity.name}</span>
                  </div>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400 shrink-0 ml-2">
                    Variance: {caseItem.varianceQty} units
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200/60 dark:border-brand-800/60">
                  <span>Officer: {caseItem.assignedOfficer || 'Pending Assignment'}</span>
                  <span className="text-brand-700 dark:text-brand-300 group-hover:text-flame-600 dark:group-hover:text-flame-400 group-hover:underline flex items-center space-x-1 font-semibold">
                    <span>Inspect Ledger</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Live Activity Feed Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-brand-900/70 rounded-2xl p-6 shadow-card border border-slate-200/90 dark:border-brand-800/80 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-brand-800/60">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Operational Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live events stream across network
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-semibold text-brand-700 dark:text-brand-300 hover:text-flame-600 dark:hover:text-flame-400 hover:underline flex items-center space-x-1"
            >
              <span>Live Stream</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="p-3 bg-slate-50/70 dark:bg-brand-950/60 rounded-xl border border-slate-200/60 dark:border-brand-800/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                    {act.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                  {act.details}
                </p>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 flex justify-between pt-1">
                  <span>{act.actor.org}</span>
                  <span className="font-mono">{act.referenceId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Provincial Strategic Reserves Snapshot */}
      <div className="bg-white dark:bg-brand-900/70 rounded-2xl p-6 shadow-card border border-slate-200/90 dark:border-brand-800/80 space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-brand-800/60">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-flame-100 dark:bg-flame-950/60 text-flame-700 dark:text-flame-300 border border-flame-200 dark:border-flame-800">
                <MapPin className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Provincial Stock Reserves Across 7 Provinces of Nepal
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live cylinder stocks at retail outlets and distributors vs monthly target quota.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('provinces')}
            className="text-xs font-semibold text-brand-800 dark:text-brand-300 bg-slate-100 dark:bg-brand-850 hover:bg-slate-200 dark:hover:bg-brand-800 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>Province Quota Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {provinces.map((p) => (
            <div 
              key={p.id}
              onClick={() => onNavigateTab('provinces')}
              className="p-3 bg-slate-50/70 dark:bg-brand-950/60 hover:bg-white dark:hover:bg-brand-850 rounded-xl border border-slate-200 dark:border-brand-800 transition-all cursor-pointer text-center space-y-1 shadow-2xs"
            >
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">
                P{p.id}
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {language === 'ne' ? p.nameNe : p.nameEn.split(' ')[0]}
              </p>
              <div className="text-xs font-mono font-bold text-flame-600 dark:text-flame-400">
                {formatNumber(p.currentStockCylinders)}
              </div>
              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                p.stockStatus === 'OPTIMAL' 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                  : p.stockStatus === 'MODERATE' 
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' 
                    : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
              }`}>
                {p.stockStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
