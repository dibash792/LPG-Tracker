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
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                <MapPin className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-navy-950">
                {language === 'ne' ? 'प्रादेशिक एलपिजी मौज्दात तथा कोटा व्यवस्थापन' : 'Province Quota Allocation & Strategic Reserves'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time regional balance across all 7 provinces of Nepal to prevent artificial shortages and highway transit bottlenecks.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>4 Optimal</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>2 Moderate</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 text-red-800 rounded-xl border border-red-200 font-semibold">
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
                  ? 'bg-navy-900 text-white border-navy-900 shadow-xl ring-2 ring-teal-500/50'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/80 shadow-card'
              }`}
            >
              {/* Province Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-navy-800 text-teal-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    PROVINCE {prov.id}
                  </span>
                  <h3 className="text-sm font-bold mt-1.5 truncate">
                    {language === 'ne' ? prov.nameNe : prov.nameEn}
                  </h3>
                  <p className={`text-[11px] truncate ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    Hub: {prov.headquarters}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  prov.stockStatus === 'OPTIMAL'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : prov.stockStatus === 'MODERATE'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {prov.stockStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Numerical breakdown */}
              <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs border-slate-200/40">
                <div>
                  <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    Monthly Quota
                  </span>
                  <span className="font-mono font-bold">
                    {formatNumber(prov.monthlyQuotaMT)} MT
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    Live Stock
                  </span>
                  <span className={`font-mono font-bold ${
                    isSelected ? 'text-teal-400' : 'text-teal-600'
                  }`}>
                    {formatNumber(prov.currentStockCylinders)}
                  </span>
                </div>
              </div>

              {/* Retail network count */}
              <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/30">
                <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
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
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-navy-950">
                {selectedProv.nameEn} ({selectedProv.nameNe}) — Detailed Supply Intelligence
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono font-semibold">
                HQ: {selectedProv.headquarters}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administered through NOC Regional Logistics Command Center.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProvince(selectedProv);
              setTempQuota(selectedProv.monthlyQuotaMT);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Reallocate Monthly Quota</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Monthly Import Quota</span>
            <span className="text-lg font-bold font-mono text-navy-950">
              {formatNumber(selectedProv.monthlyQuotaMT)} MT
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ~{formatNumber(Math.round(selectedProv.monthlyQuotaMT * 70.4))} standard cylinders
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Daily Consumption / Dispatch</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {formatNumber(selectedProv.dailyDispatchedCylinders)} Cylinders
            </span>
            <span className="text-[11px] text-teal-600 block mt-0.5">
              Regular flow rate
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Active Bottling Plants</span>
            <span className="text-lg font-bold font-mono text-navy-900">
              {selectedProv.bottlingPlantsCount} Facilities
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Connected to automated tare SCADA
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Retail Distribution Outlets</span>
            <span className="text-lg font-bold font-mono text-navy-900">
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
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-navy-950">
                Adjust Quota for {editingProvince.nameEn}
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Specify revised national bulk import allocation in Metric Tonnes (MT). Changes take effect on the next dispatch cycle from Indian Oil terminals.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Monthly Target Quota (MT):
              </label>
              <input
                type="number"
                value={tempQuota}
                onChange={(e) => setTempQuota(Number(e.target.value))}
                className="w-full p-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingProvince(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-2 text-xs font-bold text-white bg-navy-800 hover:bg-navy-900 rounded-xl shadow-xs"
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
