import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Play, 
  RotateCcw, 
  Check, 
  Flame, 
  Hash, 
  Scale, 
  Truck,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { DiscrepancyRecord } from '../../types';

interface CylinderScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  consignmentId: string;
  expectedQty: number;
  plantName: string;
  distributorName: string;
  onCompleteScan: (scannedCount: number, missingSerials: string[]) => void;
}

export const CylinderScannerModal: React.FC<CylinderScannerModalProps> = ({
  isOpen,
  onClose,
  consignmentId,
  expectedQty,
  plantName,
  distributorName,
  onCompleteScan,
}) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<Array<{ serial: string; status: 'VALID' | 'UNREADABLE' | 'MISMATCH'; tareWeight: number }>>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isScanning && currentProgress < expectedQty) {
      timer = setTimeout(() => {
        const nextIdx = currentProgress + 1;
        // Simulate real-world 2% tare variance or missing tag
        const isDamaged = nextIdx === Math.floor(expectedQty * 0.4) || nextIdx === Math.floor(expectedQty * 0.7);
        const serialTag = `NP-LPG-${2083000 + nextIdx}`;
        
        const newItem = {
          serial: serialTag,
          status: isDamaged ? ('UNREADABLE' as const) : ('VALID' as const),
          tareWeight: isDamaged ? 14.05 : +(14.2 + (Math.random() * 0.08 - 0.04)).toFixed(2),
        };

        setScannedItems(prev => [newItem, ...prev]);
        setCurrentProgress(nextIdx);
      }, 35);
    } else if (currentProgress >= expectedQty) {
      setIsScanning(false);
    }
    return () => clearTimeout(timer);
  }, [isScanning, currentProgress, expectedQty]);

  if (!isOpen) return null;

  const validCount = scannedItems.filter(i => i.status === 'VALID').length;
  const defectiveItems = scannedItems.filter(i => i.status !== 'VALID');

  const handleFinish = () => {
    const missingSerials = defectiveItems.map(d => d.serial);
    onCompleteScan(validCount, missingSerials);
    onClose();
  };

  const handleReset = () => {
    setIsScanning(false);
    setScannedItems([]);
    setCurrentProgress(0);
  };

  return (
    <div className="fixed inset-0 z-60 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950">
                RFID & Barcode Inbound Bay Verification
              </h3>
              <p className="text-xs text-slate-500">
                Consignment: <span className="font-mono font-bold">{consignmentId}</span> ({plantName} → {distributorName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Status Gauge */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Simulated Conveyor Scanner:</span>
            <span className="font-mono text-navy-950">
              {currentProgress} / {expectedQty} Units Scanned
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-teal-500 h-3 rounded-full transition-all duration-75"
              style={{ width: `${(currentProgress / expectedQty) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] pt-1 text-slate-500">
            <span className="text-emerald-700 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{validCount} Verified Compliant (14.2kg standard)</span>
            </span>
            {defectiveItems.length > 0 && (
              <span className="text-red-600 font-semibold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{defectiveItems.length} Unmatched / Damaged Valve Tag</span>
              </span>
            )}
          </div>
        </div>

        {/* Scanned Serial Stream */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Real-Time Tare Scale & Serial Log:
          </span>

          <div className="h-44 overflow-y-auto bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-xs space-y-1">
            {scannedItems.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Scanner idle. Click "Start Conveyor Scanner" below to simulate truck offloading.
              </div>
            ) : (
              scannedItems.slice(0, 15).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] py-0.5 border-b border-slate-800">
                  <span className="text-slate-400">#{item.serial}</span>
                  <span className="text-slate-300">Net Tare: {item.tareWeight} kg</span>
                  {item.status === 'VALID' ? (
                    <span className="text-teal-400 font-semibold">[MATCHED OK]</span>
                  ) : (
                    <span className="text-red-400 font-bold">[TAG UNREADABLE / VARIANCE]</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scanner</span>
          </button>

          <div className="flex items-center space-x-2">
            {!isScanning && currentProgress < expectedQty && (
              <button
                onClick={() => setIsScanning(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{currentProgress === 0 ? 'Start Conveyor Scanner' : 'Resume Scan'}</span>
              </button>
            )}

            {isScanning && (
              <button
                onClick={() => setIsScanning(false)}
                className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 rounded-xl"
              >
                Pause Scan
              </button>
            )}

            {currentProgress >= expectedQty && (
              <button
                onClick={handleFinish}
                className="px-4 py-2 text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accept Delivery & File Receiving Log</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
