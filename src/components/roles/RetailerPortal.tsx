import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Store, 
  Boxes, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Radio, 
  Clock, 
  AlertTriangle, 
  FileText,
  MapPin,
  Check,
  ShieldCheck
} from 'lucide-react';

export const RetailerPortal: React.FC = () => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [currentStock, setCurrentStock] = useState(42);
  const [emptyStock, setEmptyStock] = useState(35);
  const [isPublicBeaconActive, setIsPublicBeaconActive] = useState(true);
  const [publicStatus, setPublicStatus] = useState<'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK'>('AVAILABLE');
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [newCountInput, setNewCountInput] = useState(42);

  // Incoming delivery from distributor
  const [incomingDelivery, setIncomingDelivery] = useState({
    id: 'RDL-2083-042',
    distributor: 'Patan Traders & Energy Suppliers',
    dispatchedQty: 80,
    vehicle: 'BA 1 CHA 4410',
    status: 'IN_TRANSIT',
  });

  const handleConfirmReception = () => {
    setCurrentStock(prev => prev + incomingDelivery.dispatchedQty);
    setIncomingDelivery(prev => ({ ...prev, status: 'DELIVERED_CONFIRMED' }));
    showToast(`Received 80 cylinders from ${incomingDelivery.distributor}. Stock updated!`, 'success');
  };

  const handleSaveStockAdjustment = () => {
    if (!adjustmentReason.trim()) {
      showToast('Please state official explanation for count correction.', 'error');
      return;
    }

    const delta = newCountInput - currentStock;
    setCurrentStock(newCountInput);
    setIsStockAdjustmentModalOpen(false);
    showToast(`Stock updated to ${newCountInput} units (${delta > 0 ? `+${delta}` : delta}). Audited reason logged.`, 'success');
    setAdjustmentReason('');
  };

  const handleToggleBeacon = () => {
    const nextState = !isPublicBeaconActive;
    setIsPublicBeaconActive(nextState);
    showToast(
      nextState 
        ? 'Public Availability Beacon Active: Citizens can view your stock status.' 
        : 'Public Availability Beacon Paused.',
      'info'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Retailer Store Badge */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-navy-950">
                  Baluwatar Gas & Provision Store
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  License RET-7890
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kathmandu Metro Ward 4 • Near Prime Minister Residence Gate, Baluwatar
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              Regulated Price: NPR 1,895
            </span>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Main Stock Counter Card */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-card border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Current Domestic 14.2kg Stock In Store
          </span>
          <button
            onClick={() => {
              setNewCountInput(currentStock);
              setIsStockAdjustmentModalOpen(true);
            }}
            className="text-xs text-slate-300 hover:text-white underline"
          >
            Adjust Physical Count
          </button>
        </div>

        <div className="flex items-baseline space-x-3">
          <div className="text-5xl font-extrabold font-mono text-white">
            {currentStock}
          </div>
          <span className="text-sm font-semibold text-slate-400">
            Cylinders Available for Public
          </span>
        </div>

        {/* Quick Adjustment and Status Indicator */}
        <div className="pt-4 border-t border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Empty Cylinders Held:</span>
            <span className="font-mono font-bold text-slate-200">{emptyStock} Units</span>
          </div>

          {/* Public Beacon Switch */}
          <div className="flex items-center space-x-3 bg-navy-800/80 px-3 py-2 rounded-xl border border-navy-700">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isPublicBeaconActive ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="font-semibold text-xs">Citizen Visibility:</span>
            </div>

            <button
              onClick={handleToggleBeacon}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                isPublicBeaconActive 
                  ? 'bg-teal-500 text-navy-950' 
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isPublicBeaconActive ? 'Broadcasting Active' : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      {/* Incoming Delivery Alert from Distributor */}
      {incomingDelivery.status === 'IN_TRANSIT' && (
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Boxes className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-amber-950">
                Inbound Delivery Arriving Today ({incomingDelivery.dispatchedQty} Cylinders)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
              {incomingDelivery.id}
            </span>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            From Wholesale Distributor: <strong>{incomingDelivery.distributor}</strong> on mini-truck {incomingDelivery.vehicle}. Click below when offloaded at store.
          </p>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleConfirmReception}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Receipt of {incomingDelivery.dispatchedQty} Cylinders</span>
            </button>
          </div>
        </div>
      )}

      {/* Physical Stock Adjustment Modal with Mandatory Explanation */}
      {isStockAdjustmentModalOpen && (
        <div className="fixed inset-0 z-60 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-950">
                Record Physical Stock Count Correction
              </h3>
              <button
                onClick={() => setIsStockAdjustmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-600 leading-relaxed">
                <strong>Statutory Audit Requirement:</strong> Every manual stock modification requires a factual explanation recorded into the permanent NOC ledger to prevent unrecorded cash sales.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Corrected Physical Count on Floor:</label>
              <input
                type="number"
                value={newCountInput}
                onChange={(e) => setNewCountInput(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Mandatory Explanation / Justification:</label>
              <textarea
                rows={3}
                required
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="E.g., Physical floor audit identified 2 returned defective valve cylinders quarantined in storage shed..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStockAdjustmentModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStockAdjustment}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl shadow-xs"
              >
                Sign & Save Count Correction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
