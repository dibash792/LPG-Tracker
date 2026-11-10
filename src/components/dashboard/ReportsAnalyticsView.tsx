import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  Calendar, 
  PieChart, 
  TrendingUp, 
  Printer, 
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ReportsAnalyticsView: React.FC = () => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [selectedReportType, setSelectedReportType] = useState('MONTHLY_RECONCILIATION');
  const [selectedTimeframe, setSelectedTimeframe] = useState('FY_2081_82_Q2');

  const handleGenerateReport = () => {
    showToast(`Generating official report: ${selectedReportType} (${selectedTimeframe})`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-brand-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-flame-50 dark:bg-flame-950/40 text-flame-600 dark:text-flame-400 border border-flame-200 dark:border-flame-900/60">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {language === 'ne' ? 'राष्ट्रिय प्रतिवेदन तथा विश्लेषण' : 'National LPG Statistical Intelligence & Reports'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Statutory reconciliation, variance trends, quota compliance, and tare integrity audits for the Ministry of Industry, Commerce and Supplies (MoICS).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 text-xs font-bold text-white bg-flame-600 hover:bg-flame-500 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-flame-100" />
              <span>Generate Official Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Selection Card */}
      <div className="bg-white dark:bg-brand-900 rounded-xl p-4 shadow-card border border-slate-200 dark:border-brand-800 flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Report Focus:</span>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg px-3 py-1.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden"
          >
            <option value="MONTHLY_RECONCILIATION">National Monthly Custody Reconciliation</option>
            <option value="DISCREPANCY_ANALYSIS">Highway Discrepancy & Bottleneck Audit</option>
            <option value="TARE_WEIGHT_INTEGRITY">Cylinder Tare Weight Calibration (NBSM NS:533)</option>
            <option value="PROVINCIAL_EQUITY">Provincial Quota Utilization & Equity Index</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg px-3 py-1.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden"
          >
            <option value="FY_2081_82_Q2">Fiscal Year 2081/82 — Kartik 2083</option>
            <option value="FY_2081_82_Q1">Fiscal Year 2081/82 — Ashoj 2083</option>
            <option value="ANNUAL_2080_81">Annual Report FY 2080/81</option>
          </select>
        </div>
      </div>

      {/* Report Cards Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-brand-900 rounded-2xl p-5 shadow-card border border-slate-200 dark:border-brand-800 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              National Reconciliation Efficiency
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>

          <div className="pt-2">
            <div className="text-2xl font-bold font-sans text-slate-900 dark:text-slate-100">99.78%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dispatched vs Confirmed Received match rate</p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-brand-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Allowable Tare Tolerance:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">± 100g</span>
            </div>
            <div className="flex justify-between">
              <span>Unreconciled Variance:</span>
              <span className="font-mono font-bold text-flame-600 dark:text-flame-400">0.22%</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-brand-900 rounded-2xl p-5 shadow-card border border-slate-200 dark:border-brand-800 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Highway Transit Time
            </span>
            <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-800/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>

          <div className="pt-2">
            <div className="text-2xl font-bold font-sans text-slate-900 dark:text-slate-100">4.8 Hours</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Amlekhgunj / Birgunj to Valley Corridor</p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-brand-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Naubise Checkpost Delay:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">22 mins avg</span>
            </div>
            <div className="flex justify-between">
              <span>GPS Tracking Fidelity:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">98.4% online</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-brand-900 rounded-2xl p-5 shadow-card border border-slate-200 dark:border-brand-800 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Retail Price Compliance
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="pt-2">
            <div className="text-2xl font-bold font-sans text-slate-900 dark:text-slate-100">99.91%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sold at official NPR 1,895 gazetted rate</p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-brand-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Monitored Retail Outlets:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">4,210 points</span>
            </div>
            <div className="flex justify-between">
              <span>Price Violations Tagged:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">4 incidents</span>
            </div>
          </div>
        </div>

      </div>

      {/* Visual Data Breakdown Preview Table */}
      <div className="bg-white dark:bg-brand-900 rounded-2xl shadow-card border border-slate-200 dark:border-brand-800 p-6 space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Executive Summary: Monthly National Inflow vs Retail Distribution
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-brand-950 border-b border-slate-200 dark:border-brand-800 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Target (MT)</th>
                <th className="py-2.5 px-3 text-right">Actual Realized</th>
                <th className="py-2.5 px-3 text-right">Fulfillment</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-800">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">IOC Raxaul / Birgunj Terminal</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">24,000 MT</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">23,840 MT</td>
                <td className="py-2.5 px-3 text-right font-mono text-flame-600 dark:text-flame-400 font-bold">99.3%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Normal</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">IOC Siliguri / Kakarbhitta Port</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">10,000 MT</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">10,120 MT</td>
                <td className="py-2.5 px-3 text-right font-mono text-flame-600 dark:text-flame-400 font-bold">101.2%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Normal</span></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">IOC Mathura / Sunauli Port</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">7,500 MT</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">7,320 MT</td>
                <td className="py-2.5 px-3 text-right font-mono text-flame-600 dark:text-flame-400 font-bold">97.6%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Normal</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default ReportsAnalyticsView;
