import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Building2, 
  Fuel, 
  Boxes, 
  Truck, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  FileText, 
  QrCode, 
  Clock, 
  Send,
  Calendar,
  Layers,
  Check
} from 'lucide-react';

interface PlantOperatorPortalProps {
  onDispatchCreated?: (dispatchData: any) => void;
}

export const PlantOperatorPortal: React.FC<PlantOperatorPortalProps> = ({ onDispatchCreated }) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BULK_RECEIPT' | 'DISPATCH' | 'CAROUSEL'>('OVERVIEW');
  
  // Bulk decanting form
  const [bulkForm, setBulkForm] = useState({
    tankerNumber: 'BA 1 KHA 8821',
    challanNumber: 'IOC-BR-2083-9941',
    customsPoint: 'Raxaul / Birgunj',
    supplier: 'Indian Oil Corporation Ltd. (Barauni)',
    grossWeightMt: 32.45,
    tareWeightMt: 14.25,
  });

  // Outbound dispatch form
  const [dispatchForm, setDispatchForm] = useState({
    receiverOrg: 'Patan Traders & Energy Suppliers',
    vehicleNumber: 'BA 3 KHA 9912',
    driverName: 'Hari Prasad Shrestha',
    driverPhone: '9851088776',
    tamperSeal: 'SEAL-NP-2083-771',
    quantity: 600,
    cylinderCategory: 'DOMESTIC_14_2',
  });

  const [recentDispatches, setRecentDispatches] = useState([
    {
      id: 'DSP-0912',
      receiver: 'Patan Traders & Energy Suppliers (Lalitpur)',
      vehicle: 'BA 2 KHA 7104',
      quantity: 450,
      status: 'DELIVERED_DISCREPANCY',
      timestamp: '2026-11-09 08:30',
      tamperSeal: 'SEAL-NP-88490'
    },
    {
      id: 'DSP-0911',
      receiver: 'Bhaktapur Central Gas Depot (Suryabinayak)',
      vehicle: 'BA 1 KHA 4452',
      quantity: 500,
      status: 'DELIVERED_CONFIRMED',
      timestamp: '2026-11-08 14:00',
      tamperSeal: 'SEAL-NP-88489'
    }
  ]);

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const netLpg = +(bulkForm.grossWeightMt - bulkForm.tareWeightMt).toFixed(3);
    showToast(`Decanted ${netLpg} MT Bulk LPG from Tanker ${bulkForm.tankerNumber}. Decanting ticket verified.`, 'success');
    setActiveTab('OVERVIEW');
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `DSP-2083-${Math.floor(10000 + Math.random() * 90000)}`;
    const newDispatchItem = {
      id: newCode,
      receiver: dispatchForm.receiverOrg,
      vehicle: dispatchForm.vehicleNumber,
      quantity: Number(dispatchForm.quantity),
      status: 'IN_TRANSIT',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tamperSeal: dispatchForm.tamperSeal
    };

    setRecentDispatches([newDispatchItem, ...recentDispatches]);
    if (onDispatchCreated) onDispatchCreated(newDispatchItem);
    showToast(`Dispatch ${newCode} sealed with barcode ${dispatchForm.tamperSeal} and handed over to driver.`, 'success');
    setActiveTab('OVERVIEW');
  };

  return (
    <div className="space-y-6">
      
      {/* Plant Identity Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-navy-900 text-teal-400 flex items-center justify-center font-bold text-lg shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-navy-950">
                  Nepal Gas Udyog Ltd. — Balaju Industrial Facility
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Licensed Plant BP-2051/01
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bagmati Province • Kathmandu Metro Ward 16 • SCADA Telemetry Node #BP-01
              </p>
            </div>
          </div>

          {/* Plant Mode Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'OVERVIEW' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('BULK_RECEIPT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'BULK_RECEIPT' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log Bulk Decanting
            </button>
            <button
              onClick={() => setActiveTab('DISPATCH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'DISPATCH' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Dispatch
            </button>
            <button
              onClick={() => setActiveTab('CAROUSEL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'CAROUSEL' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Carousel Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Bulk LPG Tank Farm</span>
              <div className="text-2xl font-bold font-mono text-navy-950 mt-1">1,480 MT</div>
              <span className="text-[11px] text-teal-600 block mt-0.5">82.4% tank capacity</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Filled Stock in Yard</span>
              <div className="text-2xl font-bold font-mono text-navy-950 mt-1">31,200 Units</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Ready for wholesale transit</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Today's Carousel Filling</span>
              <div className="text-2xl font-bold font-mono text-teal-600 mt-1">4,280 Units</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Day Shift • 24-Head Carousel</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Tare Scale Compliance</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">99.4%</div>
              <span className="text-[11px] text-slate-500 block mt-0.5">NS:533 ±100g margin</span>
            </div>
          </div>

          {/* Plant Dispatches Table */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-navy-950">
                Recent Plant Dispatches & Waybill Gate Passes
              </h3>
              <button
                onClick={() => setActiveTab('DISPATCH')}
                className="px-3 py-1.5 text-xs font-bold bg-navy-800 text-white rounded-lg flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Consignment</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Gate Pass / Code</th>
                    <th className="py-2.5 px-3">Authorized Distributor</th>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3 text-center">Quantity</th>
                    <th className="py-2.5 px-3">Seal Barcode</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDispatches.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-navy-950">{d.id}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{d.receiver}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{d.vehicle}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{d.quantity}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{d.tamperSeal}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          d.status === 'DELIVERED_CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-800'
                            : d.status === 'DELIVERED_DISCREPANCY'
                              ? 'bg-amber-50 text-amber-900 font-bold'
                              : 'bg-sky-50 text-sky-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BULK DECANTING TAB */}
      {activeTab === 'BULK_RECEIPT' && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy-950">
              Bulk Cryogenic LPG Tanker Decanting Entry
            </h3>
            <p className="text-xs text-slate-500">
              Record receipt of liquid petroleum gas decanted from cross-border Indian Oil bullet tanker into plant mounded pressure vessels.
            </p>
          </div>

          <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bullet Tanker Reg Number:</label>
                <input
                  type="text"
                  required
                  value={bulkForm.tankerNumber}
                  onChange={(e) => setBulkForm({ ...bulkForm, tankerNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customs Entry Terminal:</label>
                <input
                  type="text"
                  required
                  value={bulkForm.customsPoint}
                  onChange={(e) => setBulkForm({ ...bulkForm, customsPoint: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Gross Weighbridge Mass (MT):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bulkForm.grossWeightMt}
                  onChange={(e) => setBulkForm({ ...bulkForm, grossWeightMt: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tare (Empty Tanker) Mass (MT):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bulkForm.tareWeightMt}
                  onChange={(e) => setBulkForm({ ...bulkForm, tareWeightMt: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex justify-between items-center font-mono">
              <span className="font-bold text-teal-900">Computed Net Bulk LPG Decanted:</span>
              <span className="text-base font-bold text-teal-800">
                {(bulkForm.grossWeightMt - bulkForm.tareWeightMt).toFixed(3)} MT
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className="px-4 py-2 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl"
              >
                Verify & Commit Decanting Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DISPATCH CREATION TAB */}
      {activeTab === 'DISPATCH' && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy-950">
              Create Outbound Consignment & Gate Pass
            </h3>
            <p className="text-xs text-slate-500">
              Authorizes transport of filled cylinders to licensed distributor wholesale depots. Generates tamper seal QR code.
            </p>
          </div>

          <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Receiving Wholesale Distributor:</label>
              <select
                value={dispatchForm.receiverOrg}
                onChange={(e) => setDispatchForm({ ...dispatchForm, receiverOrg: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="Patan Traders & Energy Suppliers">Patan Traders & Energy Suppliers (Lalitpur)</option>
                <option value="Janakpur City Gas Depot">Janakpur City Gas Depot (Madhesh)</option>
                <option value="Annapurna Gas Center">Annapurna Gas Center (Pokhara)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Truck Reg Number:</label>
                <input
                  type="text"
                  required
                  value={dispatchForm.vehicleNumber}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
                  placeholder="E.g. BA 3 KHA 9912"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Carrier Driver Name & Mobile:</label>
                <input
                  type="text"
                  required
                  value={dispatchForm.driverName}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                  placeholder="Driver Full Name"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cylinder Quantity (Domestic 14.2kg):</label>
                <input
                  type="number"
                  required
                  value={dispatchForm.quantity}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, quantity: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tamper Wire Seal Barcode:</label>
                <input
                  type="text"
                  required
                  value={dispatchForm.tamperSeal}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, tamperSeal: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className="px-4 py-2 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
              >
                Seal Consignment & Print Gate Pass
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CAROUSEL TELEMETRY TAB */}
      {activeTab === 'CAROUSEL' && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                Filling Carousel Telemetry & Electronic Tare Check-Weigher
              </h3>
              <p className="text-xs text-slate-500">
                Siraga 24-head automated electronic carousel with integrated optical leak detector.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
              SCADA Sync Normal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Tare Scale Calibration Status</span>
              <p className="text-sm font-bold text-navy-950">Last Calibrated: 2026-11-09</p>
              <p className="text-xs text-slate-500">Certified by Nepal Bureau of Standards & Metrology (NS:533).</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Hydraulic Test Surveillance</span>
              <p className="text-sm font-bold text-navy-950">14 Cylinders Quarantined</p>
              <p className="text-xs text-slate-500">Cylinders approaching 5-year test expiry isolated for decanting.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Daily Filling Throughput</span>
              <p className="text-sm font-bold text-teal-600">4,280 Cylinders / Shift</p>
              <p className="text-xs text-slate-500">18.2 seconds average cycle time per head.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
