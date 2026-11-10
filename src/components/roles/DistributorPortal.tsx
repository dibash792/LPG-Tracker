import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { CylinderScannerModal } from '../common/CylinderScannerModal';
import { 
  Truck, 
  Store, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes, 
  ArrowRight, 
  Plus, 
  Clock, 
  FileText,
  MapPin
} from 'lucide-react';

interface DistributorPortalProps {
  onConfirmDelivery?: (consignmentCode: string, receivedCount: number, missingSerials: string[]) => void;
}

export const DistributorPortal: React.FC<DistributorPortalProps> = ({ onConfirmDelivery }) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'DELIVERIES' | 'DISPATCH_RETAIL' | 'STOCK'>('DELIVERIES');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<any>(null);

  const [inboundDeliveries, setInboundDeliveries] = useState([
    {
      id: 'CNS-BG-94032',
      plant: 'Nepal Gas Udyog Ltd. (Balaju)',
      vehicle: 'BA 3 KHA 1109',
      driver: 'Sujan Sharma (9841223344)',
      dispatchedQty: 800,
      dispatchedAt: '2026-11-10 09:15',
      status: 'AWAITING_RECEPTION',
      tamperSeal: 'SEAL-NP-99401'
    },
    {
      id: 'CNS-BG-94021',
      plant: 'Nepal Gas Udyog Ltd. (Balaju)',
      vehicle: 'BA 2 KHA 7104',
      driver: 'Prem Bahadur (9841556677)',
      dispatchedQty: 450,
      dispatchedAt: '2026-11-09 08:30',
      status: 'DELIVERED_DISCREPANCY',
      receivedQty: 438,
      tamperSeal: 'SEAL-NP-88490'
    }
  ]);

  const [retailDeliveries, setRetailDeliveries] = useState([
    {
      id: 'RDL-2083-041',
      retailer: 'Baluwatar Gas & Provision Store',
      ward: 'Ward 4, Kathmandu',
      quantity: 80,
      vehicle: 'BA 1 CHA 4410',
      status: 'CONFIRMED'
    },
    {
      id: 'RDL-2083-042',
      retailer: 'Patan Consumer Corner',
      ward: 'Ward 12, Lalitpur',
      quantity: 120,
      vehicle: 'BA 1 CHA 4410',
      status: 'IN_TRANSIT'
    }
  ]);

  const [newRetailForm, setNewRetailForm] = useState({
    retailerName: 'Baluwatar Gas & Provision Store',
    quantity: 80,
    vehicle: 'BA 1 CHA 4410',
  });

  const handleStartIntake = (consignment: any) => {
    setSelectedConsignment(consignment);
    setIsScannerOpen(true);
  };

  const handleCompleteIntake = (scannedCount: number, missingSerials: string[]) => {
    if (!selectedConsignment) return;

    const variance = scannedCount - selectedConsignment.dispatchedQty;
    const isMismatch = variance !== 0 || missingSerials.length > 0;

    setInboundDeliveries(prev => prev.map(d => {
      if (d.id === selectedConsignment.id) {
        return {
          ...d,
          status: isMismatch ? 'DELIVERED_DISCREPANCY' : 'DELIVERED_CONFIRMED',
          receivedQty: scannedCount,
        };
      }
      return d;
    }));

    if (onConfirmDelivery) {
      onConfirmDelivery(selectedConsignment.id, scannedCount, missingSerials);
    }

    if (isMismatch) {
      showToast(`Consignment ${selectedConsignment.id} confirmed with ${variance} variance. Case ticket automatically created for NOC review.`, 'info');
    } else {
      showToast(`Consignment ${selectedConsignment.id} confirmed with 100% quantity match! Stock credited to wholesale warehouse.`, 'success');
    }
  };

  const handleCreateRetailDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const newDelivery = {
      id: `RDL-2083-${Math.floor(100 + Math.random() * 900)}`,
      retailer: newRetailForm.retailerName,
      ward: 'Ward 4, Kathmandu',
      quantity: Number(newRetailForm.quantity),
      vehicle: newRetailForm.vehicle,
      status: 'IN_TRANSIT'
    };

    setRetailDeliveries([newDelivery, ...retailDeliveries]);
    showToast(`Dispatched ${newRetailForm.quantity} cylinders to ${newRetailForm.retailerName}.`, 'success');
    setActiveTab('DELIVERIES');
  };

  return (
    <div className="space-y-6">
      
      {/* Distributor Identity */}
      <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-brand-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-flame-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Patan Traders & Energy Suppliers — Wholesale Depot
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-brand-200 border border-brand-200 dark:border-brand-700">
                  Authorized License DIST-1049
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bagmati Province • Lalitpur Metro Ward 12 • Lagankhel Bus Park Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-brand-950 p-1 rounded-xl text-xs font-semibold border border-slate-200/50 dark:border-brand-800">
            <button
              onClick={() => setActiveTab('DELIVERIES')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'DELIVERIES' ? 'bg-brand-900 dark:bg-brand-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Inbound Plant Consignments
            </button>
            <button
              onClick={() => setActiveTab('DISPATCH_RETAIL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'DISPATCH_RETAIL' ? 'bg-brand-900 dark:bg-brand-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Dispatch to Retailers
            </button>
            <button
              onClick={() => setActiveTab('STOCK')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'STOCK' ? 'bg-brand-900 dark:bg-brand-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Warehouse Stock
            </button>
          </div>
        </div>
      </div>

      {/* INBOUND DELIVERIES TAB */}
      {activeTab === 'DELIVERIES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-brand-900 p-5 rounded-2xl border border-slate-200 dark:border-brand-800 shadow-card transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Warehouse Live Stock</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">840 Cylinders</div>
              <span className="text-[11px] text-flame-600 dark:text-flame-400 block mt-0.5 font-medium">Domestic 14.2kg standard</span>
            </div>
            <div className="bg-white dark:bg-brand-900 p-5 rounded-2xl border border-slate-200 dark:border-brand-800 shadow-card transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">En Route From Plant</span>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">800 Cylinders</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Truck BA 3 KHA 1109 en route</span>
            </div>
            <div className="bg-white dark:bg-brand-900 p-5 rounded-2xl border border-slate-200 dark:border-brand-800 shadow-card transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Active Retailers Supplied</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">28 Neighborhood Stores</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Lalitpur & South Kathmandu</span>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-900 rounded-2xl shadow-card border border-slate-200 dark:border-brand-800 p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-brand-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Inbound Delivery Consignments Awaiting Offloading & Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect truck arriving at receiving bay. Verify physical wire seal and scan cylinders before signing digital custody handover.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {inboundDeliveries.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50/70 dark:bg-brand-950/60 rounded-xl border border-slate-200 dark:border-brand-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'AWAITING_RECEPTION' 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800' 
                          : item.status === 'DELIVERED_CONFIRMED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 border border-red-300 dark:border-red-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Source: {item.plant}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Truck: {item.vehicle} • Driver: {item.driver} • Tamper Seal: {item.tamperSeal}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Consignment Qty</span>
                      <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                        {item.receivedQty !== undefined ? `${item.receivedQty} / ` : ''}{item.dispatchedQty} Cylinders
                      </span>
                    </div>

                    {item.status === 'AWAITING_RECEPTION' && (
                      <button
                        onClick={() => handleStartIntake(item)}
                        className="px-4 py-2 bg-flame-600 hover:bg-flame-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                      >
                        <Scan className="w-4 h-4" />
                        <span>Start RFID Conveyor Scan</span>
                      </button>
                    )}

                    {item.status === 'DELIVERED_DISCREPANCY' && item.receivedQty !== undefined && (
                      <span className="px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
                        Variance Flagged ({item.receivedQty - item.dispatchedQty} Units)
                      </span>
                    )}

                    {item.status === 'DELIVERED_CONFIRMED' && (
                      <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched & Reconciled</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH TO RETAILERS TAB */}
      {activeTab === 'DISPATCH_RETAIL' && (
        <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-brand-800 max-w-2xl mx-auto space-y-4 transition-colors">
          <div className="border-b border-slate-100 dark:border-brand-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Dispatch Cylinder Batch to Local Neighborhood Retailer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Creates secondary custody transfer to verified retail store. Retailer will confirm receipt on mobile.
            </p>
          </div>

          <form onSubmit={handleCreateRetailDelivery} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Select Verified Local Retailer:</label>
              <select
                value={newRetailForm.retailerName}
                onChange={(e) => setNewRetailForm({ ...newRetailForm, retailerName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg font-medium text-slate-800 dark:text-slate-100"
              >
                <option value="Baluwatar Gas & Provision Store">Baluwatar Gas & Provision Store (Kathmandu Ward 4)</option>
                <option value="Patan Durbar Energy Center">Patan Durbar Energy Center (Lalitpur Ward 12)</option>
                <option value="New Road Consumer Mart">New Road Consumer Mart (Kathmandu Ward 22)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Cylinder Units to Transfer:</label>
                <input
                  type="number"
                  required
                  value={newRetailForm.quantity}
                  onChange={(e) => setNewRetailForm({ ...newRetailForm, quantity: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg font-mono font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Delivery Mini-Truck Reg Number:</label>
                <input
                  type="text"
                  required
                  value={newRetailForm.vehicle}
                  onChange={(e) => setNewRetailForm({ ...newRetailForm, vehicle: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-brand-800">
              <button
                type="button"
                onClick={() => setActiveTab('DELIVERIES')}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-flame-600 hover:bg-flame-500 text-white font-bold rounded-xl shadow-xs"
              >
                Confirm Retail Transfer Dispatch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STOCK TAB */}
      {activeTab === 'STOCK' && (
        <div className="bg-white dark:bg-brand-900 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-brand-800 space-y-4 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Wholesale Warehouse Stock Ledger & Category Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Domestic 14.2kg Filled</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">840 Units</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Regulated Subsidized</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Empty Cylinders for Return</span>
              <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-1 block">420 Units</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled for plant turnaround</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-brand-950 rounded-xl border border-slate-200 dark:border-brand-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Commercial 19.0kg Units</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">45 Units</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Restaurant & Hotel Quota</span>
            </div>
          </div>
        </div>
      )}

      {/* RFID Cylinder Scanner Modal */}
      {selectedConsignment && (
        <CylinderScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          consignmentId={selectedConsignment.id}
          expectedQty={selectedConsignment.dispatchedQty}
          plantName={selectedConsignment.plant}
          distributorName="Patan Traders (Lagankhel)"
          onCompleteScan={handleCompleteIntake}
        />
      )}

    </div>
  );
};
export default DistributorPortal;
