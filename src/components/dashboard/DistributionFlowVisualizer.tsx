import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  Store, 
  ArrowRight, 
  Fuel, 
  Boxes, 
  Info,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mockDistributionChain } from '../../data/mockData';

interface DistributionFlowVisualizerProps {
  onDrilldownStage?: (stage: string) => void;
}

export const DistributionFlowVisualizer: React.FC<DistributionFlowVisualizerProps> = ({
  onDrilldownStage
}) => {
  const { t, formatNumber, language } = useLanguage();
  const [selectedStage, setSelectedStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage2');

  const stages = [
    {
      id: 'stage1' as const,
      number: '01',
      title: language === 'ne' ? '१. एनओसी बल्क डिपो' : 'NOC Bulk Import & Depots',
      subtitle: language === 'ne' ? 'इण्डियन आयल कर्पोरेसनबाट आयात' : 'IOC Barauni/Haldia Cross-Border',
      icon: Fuel,
      stat: '41,280 MT',
      statLabel: 'Import Received',
      activeStatus: 'Optimal Flow',
    },
    {
      id: 'stage2' as const,
      number: '02',
      title: language === 'ne' ? '२. बोटलिङ तथा रिफिलिङ प्लान्ट' : 'Bottling & Filling Plants',
      subtitle: language === 'ne' ? '२८ वटा उद्योग (अटोमेटेड लाइन)' : '28 Licensed Industrial Facilities',
      icon: Building2,
      stat: '2,841,600',
      statLabel: 'Cylinders Filled',
      activeStatus: '91.8% Operational',
    },
    {
      id: 'stage3' as const,
      number: '03',
      title: language === 'ne' ? '३. अधिकृत क्षेत्रीय वितरक' : 'Authorized Distributors',
      subtitle: language === 'ne' ? '८४२ वटा थोक ढुवानीकर्ता' : '842 Wholesale Logistics Partners',
      icon: Truck,
      stat: '2,795,400',
      statLabel: 'Dispatched to Retail',
      activeStatus: '142 Active Trucks',
    },
    {
      id: 'stage4' as const,
      number: '04',
      title: language === 'ne' ? '४. स्थानीय एलपिजी खुद्रा पसल' : 'Local Retail Outlets',
      subtitle: language === 'ne' ? '४,२१० वटा समुदायिक बिक्रेता' : '4,210 Neighborhood Stores',
      icon: Store,
      stat: '624,100',
      statLabel: 'Buffer Stock in Hand',
      activeStatus: '7.1 Days Reserve',
    },
  ];

  return (
    <div className="bg-white dark:bg-brand-900/70 rounded-2xl p-6 shadow-card border border-slate-200/90 dark:border-brand-800/80 transition-colors">
      
      {/* Title & Scope Alert */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-brand-800/60">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-flame-100 dark:bg-flame-950/60 text-flame-700 dark:text-flame-300 border border-flame-200 dark:border-flame-800">
              <Boxes className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ne' ? 'राष्ट्रिय एलपिजी वितरण शृङ्खला अनुगमन' : 'National LPG Custody Transfer Pipeline'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking custody transfer between state bulk depots, industrial filling carousels, wholesale distributors, and retail points.
          </p>
        </div>

        {/* Boundary Notice */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>Scope Boundary:</strong> Household-level cylinder retail transactions are intentionally excluded from platform scope.
          </span>
        </div>
      </div>

      {/* Interactive 4-Stage Horizontal Flow Diagram */}
      <div className="py-6 overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-4 gap-4 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.id;

            return (
              <div key={stage.id} className="relative">
                <button
                  onClick={() => setSelectedStage(stage.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-150 relative group ${
                    isSelected
                      ? 'bg-brand-900 dark:bg-brand-800 text-white border-brand-700 shadow-lg shadow-brand-950/20 ring-2 ring-flame-500/50'
                      : 'bg-slate-50/80 dark:bg-brand-950/60 hover:bg-white dark:hover:bg-brand-850 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-brand-800 shadow-2xs'
                  }`}
                >
                  {/* Stage number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-flame-600 text-white' : 'bg-slate-200 dark:bg-brand-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      STAGE {stage.number}
                    </span>
                    <span className={`text-[11px] font-semibold ${
                      isSelected ? 'text-flame-300' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {stage.activeStatus}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center space-x-2.5 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-brand-950 text-flame-400' : 'bg-white dark:bg-brand-900 text-brand-800 dark:text-slate-200 border border-slate-200 dark:border-brand-800'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold truncate">
                      {stage.title}
                    </h4>
                  </div>

                  <p className={`text-xs mb-3 truncate ${
                    isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {stage.subtitle}
                  </p>

                  {/* Primary KPI */}
                  <div className={`pt-2 border-t flex items-baseline justify-between ${
                    isSelected ? 'border-brand-800' : 'border-slate-200/80 dark:border-brand-800/60'
                  }`}>
                    <span className={`text-[11px] font-medium ${
                      isSelected ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {stage.statLabel}
                    </span>
                    <span className="text-sm font-bold font-mono">
                      {stage.stat}
                    </span>
                  </div>
                </button>

                {/* Arrow connecting stages */}
                {idx < 3 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-brand-850 border border-slate-300 dark:border-brand-700 items-center justify-center text-slate-400 shadow-xs pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Drawer */}
      <div className="mt-2 p-5 bg-slate-50/80 dark:bg-brand-950/70 rounded-xl border border-slate-200/80 dark:border-brand-800/80 transition-colors">
        
        {selectedStage === 'stage1' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bulk LPG Customs Ports & National Terminal Throughput
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Imported exclusively via IOC Barauni, Haldia & Mathura Refineries through licensed bulk cryogenic road tankers.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-100 dark:bg-brand-900 text-brand-900 dark:text-brand-200 border border-brand-200 dark:border-brand-800">
                Transit Loss: {mockDistributionChain.stage1BulkImport.transitLossRate}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mockDistributionChain.stage1BulkImport.entryPoints.map((ep, i) => (
                <div key={i} className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800 space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{ep.name}</span>
                    <span className="text-flame-600 dark:text-flame-400 font-semibold">{ep.activeTankers} Tankers En Route</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-brand-950 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-brand-700 dark:bg-flame-600 h-2 rounded-full" 
                      style={{ width: `${(ep.currentFlowMT / ep.capacityMT) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Current: {formatNumber(ep.currentFlowMT)} MT</span>
                    <span>Cap: {formatNumber(ep.capacityMT)} MT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedStage === 'stage2' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bottling & Filling Facility Telemetry Integration
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  28 plants equipped with calibrated tare scales and electronic check-weighers (NBSM NS:533 standard).
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Tare Compliance: {mockDistributionChain.stage2BottlingPlants.tareWeightCompliance}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Active Filling Lines</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">28 Industrial Plants</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">100% Licensed by NOC</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Today's Production</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{formatNumber(mockDistributionChain.stage2BottlingPlants.dailyProductionCylinders)} Units</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">14.2 kg domestic standard</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Hydraulic Test Validity</span>
                <span className="text-base font-bold text-flame-600 dark:text-flame-400">99.1% In-Code</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Expired cylinders decanted</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Plant Automation API</span>
                <span className="text-base font-bold text-brand-700 dark:text-brand-300">SCADA Synchronized</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Real-time gate pass dispatch</span>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 'stage3' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Wholesale Distributor Dispatches & Transit Custody
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  842 licensed regional operators with electronic consignment receipts and GPS route tracking.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-100 dark:bg-brand-900 text-brand-900 dark:text-brand-200 border border-brand-200 dark:border-brand-800">
                Arrival Confirmation: {mockDistributionChain.stage3Distributors.confirmationRateOnArrival}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">In-Transit Consignments</span>
                <span className="text-base font-bold text-flame-600 dark:text-flame-400">142 Trucks</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">71,200 cylinders en route</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Avg Highway Transit Time</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{mockDistributionChain.stage3Distributors.averageTransitDurationHours} Hours</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Corridor check-posts logged</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Physical Tamper Seals</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Barcoded Wire Seal</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Checked at receiving bay</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Direct Wholesale Warehouses</span>
                <span className="text-base font-bold text-brand-700 dark:text-brand-300">842 Registered</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">NOC Geo-tagged</span>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 'stage4' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Local Retail Stores & Regional Consumer Supply Buffer
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  4,210 authorized neighborhood retail stores maintaining minimum buffer stock for civil energy security.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-100 dark:bg-brand-900 text-brand-900 dark:text-brand-200 border border-brand-200 dark:border-brand-800">
                National Reserve Buffer: {mockDistributionChain.stage4Retailers.averageBufferDays} Days
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Retail Buffer Stock</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{formatNumber(mockDistributionChain.stage4Retailers.cylindersInStock)} Cylinders</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Across all 7 provinces</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Average Daily Public Draw</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{formatNumber(mockDistributionChain.stage4Retailers.dailyRetailTurnover)} Cylinders/day</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Steady consumption pattern</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Retail Price Compliance</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">NPR 1,895 / unit</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Official gazetted domestic rate</span>
              </div>
              <div className="p-3 bg-white dark:bg-brand-900/80 rounded-lg border border-slate-200 dark:border-brand-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Public Availability Portal</span>
                <span className="text-base font-bold text-flame-600 dark:text-flame-400">Live for Citizens</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Civil availability without consumer tracking</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
