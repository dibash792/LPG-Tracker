import React, { useState } from 'react';
import { ProvinceMetric } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  MapPin, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Store, 
  Truck, 
  Building2, 
  Sliders, 
  ArrowUpRight,
  ShieldAlert,
  Edit3
} from 'lucide-react';

interface ProvinceStockMapProps {
  provinces: ProvinceMetric[];
  onUpdateQuota: (provId: number, newQuota: number) => void;
}

export const ProvinceStockMap: React.FC<ProvinceStockMapProps> = ({
  provinces,
  onUpdateQuota,
}) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(3); // Bagmati as default
  const [editingProvince, setEditingProvince] = useState<ProvinceMetric | null>(null);
  const [tempQuota, setTempQuota] = useState<number>(0);

  const selectedProv = provinces.find(p => p.id === selectedProvinceId) || provinces[0];

  const handleSaveQuota = () => {
    if (!editingProvince || tempQuota <= 0) return;
    onUpdateQuota(editingProvince.id, tempQuota);
    setEditingProvince(null);
    showToast(`Quota for ${editingProvince.nameEn} revised to ${tempQuota} MT`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-brand-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-flame-50 dark:bg-flame-950/50 text-flame-600 dark:text-flame-400 border border-flame-200 dark:border-flame-900/60">
                <MapPin className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {language === 'ne' ? 'प्रादेशिक एलपिजी मौज्दात तथा कोटा व्यवस्थापन' : 'Province Quota Allocation & Strategic Reserves'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time regional balance across all 7 provinces of Nepal to prevent artificial shortages and highway transit bottlenecks.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>4 Optimal</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>2 Moderate</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>1 Low Alert</span>
            </span>
          </div>
        </div>
      </div>

      {/* Provinces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {provinces.map((prov) => {
          const isSelected = prov.id === selectedProvinceId;

          return (
            <div
              key={prov.id}
              onClick={() => setSelectedProvinceId(prov.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative ${
                isSelected
                  ? 'bg-brand-950 dark:bg-brand-950 text-white border-brand-800 shadow-xl ring-2 ring-flame-500/50'
                  : 'bg-white dark:bg-brand-900 hover:bg-slate-50 dark:hover:bg-brand-850 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-brand-800 shadow-card'
              }`}
            >
              {/* Province Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                    isSelected 
                      ? 'bg-brand-900 text-flame-400 border border-brand-800' 
                      : 'bg-slate-100 dark:bg-brand-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    PROVINCE {prov.id}
                  </span>
                  <h3 className="text-sm font-bold mt-1.5 truncate">
                    {language === 'ne' ? prov.nameNe : prov.nameEn}
                  </h3>
                  <p className={`text-[11px] truncate ${
                    isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Hub: {prov.headquarters}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  prov.stockStatus === 'OPTIMAL'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : prov.stockStatus === 'MODERATE'
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}>
                  {prov.stockStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Numerical breakdown */}
              <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs border-slate-200/40 dark:border-brand-800">
                <div>
                  <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    Monthly Quota
                  </span>
                  <span className="font-mono font-bold">
                    {formatNumber(prov.monthlyQuotaMT)} MT
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    Live Stock
                  </span>
                  <span className={`font-mono font-bold ${
                    isSelected ? 'text-flame-400' : 'text-flame-600 dark:text-flame-400'
                  }`}>
                    {formatNumber(prov.currentStockCylinders)}
                  </span>
                </div>
              </div>

              {/* Retail network count */}
              <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/30 dark:border-brand-800">
                <span className={isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}>
                  {prov.retailersCount} Retailers • {prov.bottlingPlantsCount} Plants
                </span>
                {prov.discrepancyCount > 0 && (
                  <span className="text-amber-400 font-semibold font-mono text-[10px]">
                    {prov.discrepancyCount} cases
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Province Drilldown & Quota Adjustment */}
      <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-brand-800 space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-brand-800 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedProv.nameEn} ({selectedProv.nameNe}) — Detailed Supply Intelligence
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded bg-brand-100 dark:bg-brand-800 text-brand-900 dark:text-brand-200 font-mono font-semibold">
                HQ: {selectedProv.headquarters}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Administered through NOC Regional Logistics Command Center.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProvince(selectedProv);
              setTempQuota(selectedProv.monthlyQuotaMT);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-brand-800 hover:bg-slate-200 dark:hover:bg-brand-700 rounded-xl transition-colors flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-flame-500" />
            <span>Reallocate Monthly Quota</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Monthly Import Quota</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatNumber(selectedProv.monthlyQuotaMT)} MT
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ~{formatNumber(Math.round(selectedProv.monthlyQuotaMT * 70.4))} standard cylinders
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Daily Consumption / Dispatch</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatNumber(selectedProv.dailyDispatchedCylinders)} Cylinders
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Regular flow rate
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Active Bottling Plants</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {selectedProv.bottlingPlantsCount} Facilities
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Connected to automated tare SCADA
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Retail Distribution Outlets</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {selectedProv.retailersCount} Stores
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Backed by {selectedProv.distributorsCount} wholesale depots
            </span>
          </div>
        </div>
      </div>

      {/* Quota Adjustment Modal */}
      {editingProvince && (
        <div className="fixed inset-0 z-50 bg-brand-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-brand-800 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-flame-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Adjust Quota for {editingProvince.nameEn}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Specify revised national bulk import allocation in Metric Tonnes (MT). Changes take effect on the next dispatch cycle from Indian Oil terminals.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Monthly Target Quota (MT):
              </label>
              <input
                type="number"
                value={tempQuota}
                onChange={(e) => setTempQuota(Number(e.target.value))}
                className="w-full p-2.5 text-sm font-mono bg-slate-50 dark:bg-brand-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-brand-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-flame-500/20 focus:border-flame-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingProvince(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-2 text-xs font-bold text-white bg-flame-600 hover:bg-flame-500 rounded-xl shadow-xs"
              >
                Confirm Quota Modification
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ProvinceStockMap;
