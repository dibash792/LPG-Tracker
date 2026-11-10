import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  Boxes, 
  Fuel, 
  AlertCircle,
  Clock,
  Sparkles,
  Info
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
      color: 'navy',
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
      color: 'teal',
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
      color: 'amber',
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
      color: 'teal',
      activeStatus: '7.1 Days Reserve',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
      
      {/* Title & Scope Alert */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
              <Boxes className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-navy-950">
              {language === 'ne' ? 'राष्ट्रिय एलपिजी वितरण शृङ्खला अनुगमन' : 'National LPG Custody Transfer Pipeline'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking custody transfer between state bulk depots, industrial filling carousels, wholesale distributors, and retail points.
          </p>
        </div>

        {/* Boundary Notice */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
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
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative group ${
                    isSelected
                      ? 'bg-navy-900 text-white border-navy-900 shadow-lg shadow-navy-950/20 ring-2 ring-teal-500/50'
                      : 'bg-slate-50/70 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Stage number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-teal-500 text-navy-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      STAGE {stage.number}
                    </span>
                    <span className={`text-[11px] font-medium ${
                      isSelected ? 'text-teal-300' : 'text-slate-500'
                    }`}>
                      {stage.activeStatus}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center space-x-2.5 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-navy-800 text-teal-300' : 'bg-white text-navy-800 border border-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold truncate">
                      {stage.title}
                    </h4>
                  </div>

                  <p className={`text-xs mb-3 truncate ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {stage.subtitle}
                  </p>

                  {/* Primary KPI */}
                  <div className={`pt-2 border-t flex items-baseline justify-between ${
                    isSelected ? 'border-navy-800' : 'border-slate-200/80'
                  }`}>
                    <span className={`text-[11px] font-medium ${
                      isSelected ? 'text-slate-400' : 'text-slate-500'
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
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-400 shadow-xs pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Drawer / Deep Dive Panel */}
      <div className="mt-2 p-5 bg-slate-50/80 rounded-xl border border-slate-200/80">
        
        {selectedStage === 'stage1' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-navy-950">
                  Bulk LPG Customs Ports & National Terminal Throughput
                </h4>
                <p className="text-xs text-slate-500">
                  Imported exclusively via IOC Barauni, Haldia & Mathura Refineries through licensed bulk cryogenic road tankers.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-100 text-teal-800">
                Transit Loss: {mockDistributionChain.stage1BulkImport.transitLossRate}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mockDistributionChain.stage1BulkImport.entryPoints.map((ep, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-navy-900">{ep.name}</span>
                    <span className="text-teal-600 font-semibold">{ep.activeTankers} Tankers En Route</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-navy-800 h-2 rounded-full" 
                      style={{ width: `${(ep.currentFlowMT / ep.capacityMT) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
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
                <h4 className="text-sm font-bold text-navy-950">
                  Bottling & Filling Facility Telemetry Integration
                </h4>
                <p className="text-xs text-slate-500">
                  28 plants equipped with calibrated tare scales and electronic check-weighers (NBSM NS:533 standard).
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                Tare Compliance: {mockDistributionChain.stage2BottlingPlants.tareWeightCompliance}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Active Filling Lines</span>
                <span className="text-base font-bold text-navy-950">28 Industrial Plants</span>
                <span className="text-[11px] text-emerald-600 block mt-0.5">100% Licensed by NOC</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Today's Production</span>
                <span className="text-base font-bold text-navy-950">{formatNumber(mockDistributionChain.stage2BottlingPlants.dailyProductionCylinders)} Units</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">14.2 kg domestic cylinders</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Hydraulic Test Validity</span>
                <span className="text-base font-bold text-teal-600">99.1% In-Code</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Expired cylinders decanted</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Plant Automation API</span>
                <span className="text-base font-bold text-navy-900">SCADA Synchronized</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Real-time gate pass dispatch</span>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 'stage3' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-navy-950">
                  Wholesale Distributor Dispatches & Transit Custody
                </h4>
                <p className="text-xs text-slate-500">
                  842 licensed regional operators with electronic consignment receipts and GPS route tracking.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-100 text-teal-800">
                Arrival Confirmation: {mockDistributionChain.stage3Distributors.confirmationRateOnArrival}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">In-Transit Consignments</span>
                <span className="text-base font-bold text-amber-600">142 Trucks</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">71,200 cylinders en route</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Avg Highway Transit Time</span>
                <span className="text-base font-bold text-navy-950">{mockDistributionChain.stage3Distributors.averageTransitDurationHours} Hours</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Corridor check-posts logged</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Physical Tamper Seals</span>
                <span className="text-base font-bold text-emerald-600">Barcoded Wire Seal</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Checked at receiving bay</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Direct Wholesale Warehouses</span>
                <span className="text-base font-bold text-navy-900">842 Registered</span>
                <span className="text-[11px] text-teal-600 block mt-0.5">NOC Geo-tagged</span>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 'stage4' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-navy-950">
                  Local Retail Stores & Regional Consumer Supply Buffer
                </h4>
                <p className="text-xs text-slate-500">
                  4,210 authorized neighborhood retail stores maintaining minimum buffer stock for civil energy security.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-100 text-teal-800">
                National Reserve Buffer: {mockDistributionChain.stage4Retailers.averageBufferDays} Days
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Retail Buffer Stock</span>
                <span className="text-base font-bold text-navy-950">{formatNumber(mockDistributionChain.stage4Retailers.cylindersInStock)} Cylinders</span>
                <span className="text-[11px] text-teal-600 block mt-0.5">Across all 7 provinces</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Average Daily Public Draw</span>
                <span className="text-base font-bold text-navy-950">{formatNumber(mockDistributionChain.stage4Retailers.dailyRetailTurnover)} Cylinders/day</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Steady demand pattern</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Retail Price Compliance</span>
                <span className="text-base font-bold text-emerald-600">NPR 1,895 / cylinder</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Official NOC gazetted rate</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Public Availability Portal</span>
                <span className="text-base font-bold text-teal-600">Live for Citizens</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Stock visibility without tracking consumer identity</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
