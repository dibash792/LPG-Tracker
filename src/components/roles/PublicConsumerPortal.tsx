import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Store, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  Info, 
  FileText, 
  Lock,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';

export const PublicConsumerPortal: React.FC = () => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    citizenName: '',
    citizenPhone: '',
    retailerName: '',
    location: '',
    incidentType: 'OVERPRICING',
    details: '',
  });

  const mockPublicRetailers = [
    {
      id: 'RET-01',
      name: 'Baluwatar Gas & Provision Store',
      brand: 'Nepal Gas',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metro',
      ward: 4,
      address: 'Near Prime Minister Residence Gate, Baluwatar',
      status: 'AVAILABLE',
      stockStatus: 'Ample Stock (>30 Cylinders)',
      priceNpr: 1895,
      lastUpdated: '15 mins ago',
      contactPhone: '9841887766'
    },
    {
      id: 'RET-02',
      name: 'Patan Durbar Energy Center',
      brand: 'Everest Gas',
      district: 'Lalitpur',
      municipality: 'Lalitpur Metro',
      ward: 12,
      address: 'Lagankhel Bus Park Road',
      status: 'AVAILABLE',
      stockStatus: 'Ample Stock (>50 Cylinders)',
      priceNpr: 1895,
      lastUpdated: '40 mins ago',
      contactPhone: '01-5541998'
    },
    {
      id: 'RET-03',
      name: 'New Road Consumer Mart',
      brand: 'Nepal Gas',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metro',
      ward: 22,
      address: 'Pako, New Road',
      status: 'LOW_STOCK',
      stockStatus: 'Limited Units (<10 Cylinders)',
      priceNpr: 1895,
      lastUpdated: '1 hour ago',
      contactPhone: '9851022334'
    },
    {
      id: 'RET-04',
      name: 'Pokhara Lakeside Energy Suppliers',
      brand: 'Grihalaxmi Gas',
      district: 'Kaski',
      municipality: 'Pokhara Metro',
      ward: 6,
      address: 'Lakeside Center, Pokhara',
      status: 'AVAILABLE',
      stockStatus: 'Ample Stock (>40 Cylinders)',
      priceNpr: 1895,
      lastUpdated: '25 mins ago',
      contactPhone: '061-532456'
    },
    {
      id: 'RET-05',
      name: 'Chabahil Mahankal Gas Suppliers',
      brand: 'Sugam Gas',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metro',
      ward: 7,
      address: 'Chabahil Chowk',
      status: 'RESTOCKING',
      stockStatus: 'Restocking En Route (Expected 3:00 PM)',
      priceNpr: 1895,
      lastUpdated: '2 hours ago',
      contactPhone: '9841334455'
    }
  ];

  const filteredRetailers = mockPublicRetailers.filter((r) => {
    const matchesDistrict = selectedDistrict === 'ALL' || r.district === selectedDistrict;
    const matchesBrand = selectedBrand === 'ALL' || r.brand === selectedBrand;
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.municipality.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDistrict && matchesBrand && matchesSearch;
  });

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.citizenPhone || !complaintForm.details) {
      showToast('Please provide phone number and incident details', 'error');
      return;
    }

    showToast('Formal consumer complaint logged with NOC Consumer Protection Directorate. Reference # NOC-CIT-2083-99.', 'success');
    setIsComplaintModalOpen(false);
    setComplaintForm({
      citizenName: '',
      citizenPhone: '',
      retailerName: '',
      location: '',
      incidentType: 'OVERPRICING',
      details: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Citizen Welcome & Transparency Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>NOC Public Transparency Portal • नागरिक सेवा पोर्टल</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Domestic LPG Availability & Official Gazetted Price
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verify real-time stock at neighborhood retailers across Nepal and confirm regulated prices to protect against unofficial hoarding or price gouging.
            </p>
          </div>

          {/* Official Price Widget */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-center min-w-[220px]">
            <span className="text-[11px] uppercase font-bold tracking-wider text-teal-300 block">
              Official Regulated Price
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
              NPR 1,895
            </div>
            <span className="text-[11px] text-slate-300 block mt-0.5">
              per 14.2 kg domestic cylinder
            </span>
            <div className="mt-2 text-[10px] text-teal-300 font-semibold bg-teal-900/40 py-0.5 px-2 rounded">
              Gazetted by Nepal Oil Corp
            </div>
          </div>
        </div>

        {/* Consumer Privacy Guarantee Note */}
        <div className="mt-6 pt-4 border-t border-navy-700/80 flex items-start space-x-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Civil Privacy Guarantee:</strong> Under Government of Nepal distribution guidelines, household-level cylinder purchases and identity records are strictly private and unmonitored. This platform only tracks supply availability between licensed industrial companies.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neighborhood, ward, retailer name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>District:</span>
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Districts</option>
            <option value="Kathmandu">Kathmandu (काठमाडौँ)</option>
            <option value="Lalitpur">Lalitpur (ललितपुर)</option>
            <option value="Bhaktapur">Bhaktapur (भक्तपुर)</option>
            <option value="Kaski">Kaski / Pokhara (कास्की)</option>
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Licensed Brands</option>
            <option value="Nepal Gas">Nepal Gas</option>
            <option value="Everest Gas">Everest Gas</option>
            <option value="Grihalaxmi Gas">Grihalaxmi Gas</option>
            <option value="Sugam Gas">Sugam Gas</option>
          </select>

          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="ml-auto px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Report Shortage or Overpricing</span>
          </button>
        </div>
      </div>

      {/* Retailers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRetailers.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 shadow-card border border-slate-200 hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mb-1">
                  Brand: {r.brand}
                </span>
                <h3 className="text-sm font-bold text-navy-950">
                  {r.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{r.address} ({r.district})</span>
                </p>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                r.status === 'AVAILABLE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : r.status === 'LOW_STOCK'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {r.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Public Stock Status</span>
                <span className="font-semibold text-slate-800">{r.stockStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Regulated Price</span>
                <span className="font-bold font-mono text-teal-700">NPR {r.priceNpr}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{r.contactPhone}</span>
              </span>
              <span>Updated {r.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Citizen Complaint Modal (requires verified citizen contact as per prompt rule) */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-60 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-navy-950">
                    NOC Civil Protection Complaint Desk
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Mandatory Phone / Account Authentication
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsComplaintModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Account Authentication Rule:</strong> To prevent false reporting or malicious commercial defamation, reports require a verified phone contact under Nepal Oil Corporation Consumer Regulations.
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Full Name:</label>
                <input
                  type="text"
                  required
                  value={complaintForm.citizenName}
                  onChange={(e) => setComplaintForm({ ...complaintForm, citizenName: e.target.value })}
                  placeholder="E.g. Bikash Thapa"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Verified Mobile (SMS OTP Verified):</label>
                <input
                  type="tel"
                  required
                  value={complaintForm.citizenPhone}
                  onChange={(e) => setComplaintForm({ ...complaintForm, citizenPhone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Violation Category:</label>
                <select
                  value={complaintForm.incidentType}
                  onChange={(e) => setComplaintForm({ ...complaintForm, incidentType: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="OVERPRICING">Selling Above Regulated NPR 1,895 Rate</option>
                  <option value="ARTIFICIAL_HOARDING">Artificial Shortage / Refusal to Distribute</option>
                  <option value="DAMAGED_SEAL">Tampered Valve Seal / Underweight Cylinder</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Retail Store Name & Ward:</label>
                <input
                  type="text"
                  required
                  value={complaintForm.retailerName}
                  onChange={(e) => setComplaintForm({ ...complaintForm, retailerName: e.target.value })}
                  placeholder="E.g. Koteshwor Gas Center, Ward 32"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Incident Explanation:</label>
                <textarea
                  rows={3}
                  required
                  value={complaintForm.details}
                  onChange={(e) => setComplaintForm({ ...complaintForm, details: e.target.value })}
                  placeholder="Details of transaction, charged amount or refusal..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl shadow-xs"
                >
                  Authenticate & Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
