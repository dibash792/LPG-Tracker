import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Info, 
  FileText, 
  Lock, 
  Clock, 
  ArrowRight, 
  Building2, 
  Truck, 
  Store, 
  HelpCircle, 
  BarChart3, 
  ExternalLink,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  Users
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { api } from '../../api/client';
import { OfflineDraftManager } from '../../utils/offlineDraftManager';

export type PublicTab = 
  | 'home' 
  | 'availability' 
  | 'chain' 
  | 'reports' 
  | 'complaint' 
  | 'track' 
  | 'about' 
  | 'help';

interface PublicWebsiteProps {
  onOpenAuth: (initialMode?: 'LOGIN' | 'REGISTER') => void;
  onEnterOperatorConsole: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  onOpenAuth,
  onEnterOperatorConsole,
}) => {
  const { t, formatNumber, language } = useLanguage();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<PublicTab>('home');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Complaint Form State
  const [complaintForm, setComplaintForm] = useState({
    citizenName: '',
    citizenPhone: '',
    retailerName: '',
    location: '',
    incidentType: 'OVERPRICING',
    details: '',
  });
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  // Complaint Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedResult, setTrackedResult] = useState<any | null>(null);
  const [isTrackSearching, setIsTrackSearching] = useState(false);

  // Mock Retail Availability Records
  const publicRetailers = [
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
      lastUpdated: '12 mins ago',
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
      lastUpdated: '35 mins ago',
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
      lastUpdated: '50 mins ago',
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
      lastUpdated: '20 mins ago',
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
      stockStatus: 'Restocking En Route (Arrival ~3:30 PM)',
      priceNpr: 1895,
      lastUpdated: '1 hour ago',
      contactPhone: '9841334455'
    },
    {
      id: 'RET-06',
      name: 'Suryabinayak Gas Depot',
      brand: 'Bhanu Gas',
      district: 'Bhaktapur',
      municipality: 'Suryabinayak Municipality',
      ward: 5,
      address: 'Araniko Highway, Suryabinayak',
      status: 'AVAILABLE',
      stockStatus: 'Ample Stock (>35 Cylinders)',
      priceNpr: 1895,
      lastUpdated: '15 mins ago',
      contactPhone: '01-6612450'
    }
  ];

  const filteredRetailers = publicRetailers.filter((r) => {
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
    if (!complaintForm.citizenPhone || !complaintForm.details || !complaintForm.retailerName) {
      showToast('Please provide your verified phone number, retailer name, and details.', 'error');
      return;
    }

    const ticket = `CMP-2083-${Math.floor(1000 + Math.random() * 9000)}`;

    api.submitComplaint({
      citizen_name: complaintForm.citizenName,
      citizen_phone: complaintForm.citizenPhone,
      target_business_name: complaintForm.retailerName,
      complaint_type: complaintForm.incidentType,
      incident_details: complaintForm.details
    }).catch(() => {
      OfflineDraftManager.saveDraft({
        type: 'COMPLAINT',
        payload: { ...complaintForm, ticket }
      });
    });

    setGeneratedTicket(ticket);
    showToast(`Grievance submitted under Reference Ticket #${ticket}.`, 'success');
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setIsTrackSearching(true);
    setTimeout(() => {
      setIsTrackSearching(false);
      // Realistic tracking response
      if (trackQuery.toUpperCase().includes('CMP') || trackQuery.toUpperCase().includes('NOC') || trackQuery.length > 3) {
        setTrackedResult({
          ticketNumber: trackQuery.toUpperCase(),
          status: 'UNDER_INVESTIGATION',
          filedDate: '2026-11-10 11:20 AM',
          complainant: 'Verified Citizen (9841****88)',
          targetBusiness: 'Koteshwor Local LPG Outlet, Ward 32, Kathmandu',
          category: 'Selling Above Regulated Gazetted Rate',
          assignedOfficer: 'Er. Rajesh K. Shrestha (NOC QRT Inspection Unit)',
          currentStage: 'Field Inspection Dispatched',
          resolutionNotes: 'NOC Area Inspector deployed to verify weighbridge tare and billing receipt. Retailer notified to produce sales ledger under Consumer Protection Act 2075.',
          timeline: [
            { step: 'Grievance Authenticated & Logged', time: '2026-11-10 11:20 AM', done: true },
            { step: 'Assigned to Area Consumer Protection Inspector', time: '2026-11-10 01:15 PM', done: true },
            { step: 'On-Site Weighbridge & Price Audit Scheduled', time: '2026-11-11 10:00 AM', done: true },
            { step: 'Formal Regulatory Ruling & Action', time: 'Pending completion', done: false },
          ]
        });
      } else {
        setTrackedResult({
          error: true,
          message: `No active grievance ticket found matching "${trackQuery}". Please verify the reference number issued via SMS.`
        });
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F3F1EC] dark:bg-[#192630] text-[#344454] dark:text-[#EDF1F3] transition-colors duration-150 flex flex-col font-sans">
      
      {/* 1. Public Portal Top Bar */}
      <div className="bg-[#17364A] text-white border-b border-[#23455C] px-4 lg:px-8 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#F3A34A] shrink-0" />
            <span className="font-semibold text-white">
              {language === 'ne' 
                ? 'नेपाल सरकार • उद्योग, वाणिज्य तथा आपूर्ति मन्त्रालय • नेपाल आयल निगम (NOC)' 
                : 'Government of Nepal • Ministry of Industry, Commerce and Supplies • Nepal Oil Corporation (NOC)'}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-300">
            <span>Toll-Free Consumer Helpline: <strong className="text-white font-mono">1660-01-00000</strong></span>
            <span>•</span>
            <span className="font-bold text-[#F3A34A] bg-[#23455C] px-2 py-0.5 rounded">
              Gazetted Rate: NPR 1,895
            </span>
          </div>
        </div>
      </div>

      {/* 2. Public Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#FBFAF7]/95 dark:bg-[#223440]/95 backdrop-blur border-b border-[#E7E8E5] dark:border-[#3B4F5C] px-4 lg:px-8 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <BrandLogo size="md" showText={false} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base lg:text-lg text-[#17364A] dark:text-white tracking-tight">
                  LPG Tracker Nepal
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8EEF3] dark:bg-[#2B3F4C] text-[#17364A] dark:text-[#F3A34A] border border-[#D2DDE6] dark:border-[#3B4F5C]">
                  Public Portal
                </span>
              </div>
              <p className="text-[11px] text-[#71808C] dark:text-[#B3C0C9] hidden sm:block">
                National LPG Distribution Transparency & Accountability
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 text-xs font-semibold text-[#4B6C83] dark:text-[#CBD6DD]">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'availability' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              Check Availability
            </button>
            <button
              onClick={() => setActiveTab('chain')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'chain' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              How Gas Moves
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'reports' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              Public Reports
            </button>
            <button
              onClick={() => setActiveTab('complaint')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'complaint' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              Submit Grievance
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'track' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              Track Complaint
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'about' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-3 py-2 rounded-xl transition-colors ${activeTab === 'help' ? 'bg-[#17364A] text-white shadow-xs' : 'hover:bg-[#EBE8E1] dark:hover:bg-[#2B3F4C] text-[#344454] dark:text-white'}`}
            >
              Help & Contact
            </button>
          </nav>

          {/* Action Buttons: Sign In / Operating Console */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenAuth('LOGIN')}
              className="px-3.5 py-2 text-xs font-semibold text-[#17364A] dark:text-white bg-[#EBE8E1] dark:bg-[#2B3F4C] hover:bg-[#D2DDE6] dark:hover:bg-[#3B4F5C] rounded-xl transition-colors border border-[#E7E8E5] dark:border-[#3B4F5C]"
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenAuth('REGISTER')}
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-[#17364A] dark:text-white bg-white dark:bg-[#223440] hover:bg-slate-50 dark:hover:bg-[#2B3F4C] rounded-xl transition-colors border border-[#E7E8E5] dark:border-[#3B4F5C]"
            >
              Register Organization
            </button>

            <button
              onClick={onEnterOperatorConsole}
              className="px-4 py-2 text-xs font-bold text-white bg-[#E56B35] hover:bg-[#C8572A] rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              title="Switch to Operational Console (NOC, Plant, Distributor, Retailer)"
            >
              <span>Operator Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Pills */}
        <div className="xl:hidden flex items-center space-x-2 py-2 overflow-x-auto no-scrollbar text-xs border-t border-[#E7E8E5] dark:border-[#3B4F5C]">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'home' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'availability' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            Check Availability
          </button>
          <button
            onClick={() => setActiveTab('chain')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'chain' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            How Gas Moves
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'reports' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            Public Reports
          </button>
          <button
            onClick={() => setActiveTab('complaint')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'complaint' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            Submit Grievance
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'track' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            Track Complaint
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'about' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${activeTab === 'help' ? 'bg-[#17364A] text-white' : 'text-[#71808C] dark:text-[#B3C0C9]'}`}
          >
            Help & Contact
          </button>
        </div>
      </header>

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* ========================================================== */}
        {/* TAB 1: HOME (LANDING PAGE) */}
        {/* ========================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            
            {/* Hero Section */}
            <div className="bg-[#FBFAF7] dark:bg-[#223440] rounded-3xl p-6 sm:p-10 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FEF3E3] dark:bg-[#3D1606] text-[#A84A22] dark:text-[#F3A34A] border border-[#FDE7C7] dark:border-[#6E280C] text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-[#E56B35]" />
                    <span>Public Transparency Initiative • राष्ट्रिय एलपिजी अनुगमन ग्रिड</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17364A] dark:text-white tracking-tight leading-tight">
                    Know Where Your Cooking Gas Is in Nepal.
                  </h1>

                  <p className="text-sm sm:text-base text-[#4F6375] dark:text-[#CBD6DD] leading-relaxed max-w-2xl">
                    LPG Tracker monitors the official supply chain from Nepal Oil Corporation bulk arrival, through bottling plants and wholesale distributors, down to your local neighborhood retailer. Check live availability, verify the regulated price, and report shortages with accountability.
                  </p>

                  {/* Call to Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('availability')}
                      className="px-5 py-3 text-sm font-bold text-white bg-[#E56B35] hover:bg-[#C8572A] rounded-2xl shadow-sm transition-all flex items-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Check Retailer Availability</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('chain')}
                      className="px-5 py-3 text-sm font-semibold text-[#17364A] dark:text-white bg-[#EBE8E1] dark:bg-[#2B3F4C] hover:bg-[#D2DDE6] dark:hover:bg-[#3B4F5C] rounded-2xl transition-all border border-[#E7E8E5] dark:border-[#3B4F5C] flex items-center space-x-1.5"
                    >
                      <span>How Gas Moves</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Gazetted Domestic Rate Widget */}
                <div className="lg:col-span-4 bg-[#F4F7F9] dark:bg-[#192630] p-6 rounded-2xl border border-[#D2DDE6] dark:border-[#3B4F5C] text-center space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#607D90] dark:text-[#94ABBD] block">
                    Official Regulated Domestic Price
                  </span>
                  
                  <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#17364A] dark:text-white">
                    NPR 1,895
                  </div>

                  <p className="text-xs text-[#71808C] dark:text-[#B3C0C9]">
                    per 14.2 kg domestic red cylinder (all 7 provinces)
                  </p>

                  <div className="pt-2 border-t border-[#E7E8E5] dark:border-[#2D3E4B] text-[11px] text-[#4F6375] dark:text-[#CBD6DD] flex items-center justify-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Fixed by Nepal Oil Corporation</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div 
                onClick={() => setActiveTab('availability')}
                className="p-5 bg-white dark:bg-[#223440] rounded-2xl border border-[#E7E8E5] dark:border-[#3B4F5C] hover:border-[#E56B35] transition-all cursor-pointer shadow-card space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FEF3E3] text-[#E56B35] flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#17364A] dark:text-white group-hover:text-[#E56B35] transition-colors">
                  1. Find Retail Stock
                </h3>
                <p className="text-xs text-[#71808C] dark:text-[#B3C0C9] leading-relaxed">
                  Search neighborhood stores by district, ward, or brand. See verified units in hand.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('chain')}
                className="p-5 bg-white dark:bg-[#223440] rounded-2xl border border-[#E7E8E5] dark:border-[#3B4F5C] hover:border-[#E56B35] transition-all cursor-pointer shadow-card space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8EEF3] text-[#17364A] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#17364A] dark:text-white group-hover:text-[#E56B35] transition-colors">
                  2. 4-Stage Distribution
                </h3>
                <p className="text-xs text-[#71808C] dark:text-[#B3C0C9] leading-relaxed">
                  Understand how liquid gas moves from bulk Indian Oil decanting to your kitchen.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('complaint')}
                className="p-5 bg-white dark:bg-[#223440] rounded-2xl border border-[#E7E8E5] dark:border-[#3B4F5C] hover:border-[#E56B35] transition-all cursor-pointer shadow-card space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#B45309] flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#17364A] dark:text-white group-hover:text-[#E56B35] transition-colors">
                  3. Report Overpricing
                </h3>
                <p className="text-xs text-[#71808C] dark:text-[#B3C0C9] leading-relaxed">
                  Charged above NPR 1,895 or denied delivery? File a verified grievance directly to NOC.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('track')}
                className="p-5 bg-white dark:bg-[#223440] rounded-2xl border border-[#E7E8E5] dark:border-[#3B4F5C] hover:border-[#E56B35] transition-all cursor-pointer shadow-card space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#15803D] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#17364A] dark:text-white group-hover:text-[#E56B35] transition-colors">
                  4. Track Complaint Ticket
                </h3>
                <p className="text-xs text-[#71808C] dark:text-[#B3C0C9] leading-relaxed">
                  Enter your ticket reference to check NOC inspection status and official ruling.
                </p>
              </div>

            </div>

            {/* 4-Stage Distribution Overview in Plain Language */}
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 sm:p-8 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#17364A] dark:text-white">
                  How LPG Distribution is Monitored in Nepal
                </h2>
                <p className="text-xs sm:text-sm text-[#71808C] dark:text-[#B3C0C9]">
                  Every consignment has recorded custody. A physical difference between what was sent and what arrived triggers an administrative review.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-4 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#17364A] text-white flex items-center justify-center font-bold text-xs">1</span>
                    <span className="font-bold text-xs text-[#17364A] dark:text-white">NOC Bulk Depots</span>
                  </div>
                  <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD]">
                    Liquid bulk gas arrives in pressurized bullet tankers from Indian Oil terminals (Barauni, Haldia, Mathura). Weighed at border weighbridges in Metric Tonnes (MT).
                  </p>
                </div>

                <div className="p-4 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#17364A] text-white flex items-center justify-center font-bold text-xs">2</span>
                    <span className="font-bold text-xs text-[#17364A] dark:text-white">28 Bottling Plants</span>
                  </div>
                  <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD]">
                    Automated carousel filling units weigh cylinders to NS:533 standard (14.2 kg gas ± 100g). Tamper-proof wire seal barcodes attached before dispatch.
                  </p>
                </div>

                <div className="p-4 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#17364A] text-white flex items-center justify-center font-bold text-xs">3</span>
                    <span className="font-bold text-xs text-[#17364A] dark:text-white">842 Distributors</span>
                  </div>
                  <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD]">
                    Authorized regional wholesale warehouses verify offloaded truck barcodes. Any missing or damaged cylinder is flagged before stock is accepted.
                  </p>
                </div>

                <div className="p-4 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#17364A] text-white flex items-center justify-center font-bold text-xs">4</span>
                    <span className="font-bold text-xs text-[#17364A] dark:text-white">4,210 Local Retailers</span>
                  </div>
                  <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD]">
                    Neighborhood stores receive daily mini-truck dispatches, confirm physical stock on mobile, and publish live availability for citizens.
                  </p>
                </div>

              </div>
            </div>

            {/* Civil Privacy & Official Framework Guarantee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-5 bg-white dark:bg-[#223440] rounded-2xl border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-2">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#17364A] dark:text-[#F3A34A]" />
                  <h3 className="font-bold text-sm text-[#17364A] dark:text-white">
                    Civil Privacy Guarantee
                  </h3>
                </div>
                <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD] leading-relaxed">
                  Under Government of Nepal civil liberty guidelines, household-level cooking gas consumption and family purchases are strictly private. LPG Tracker stops at the local retail store inventory and never monitors personal consumer identities.
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-[#223440] rounded-2xl border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  <h3 className="font-bold text-sm text-[#17364A] dark:text-white">
                    Complementing Existing NOC Services
                  </h3>
                </div>
                <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD] leading-relaxed">
                  Nepal Oil Corporation currently publishes periodic static dealer listings and plant reports. LPG Tracker introduces digital custody handovers, barcode verification, and live citizen stock beacons to eliminate highway transit blind spots.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: CHECK AVAILABILITY */}
        {/* ========================================================== */}
        {activeTab === 'availability' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Header & Filter Card */}
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#17364A] dark:text-white">
                  Find Cooking Gas in Your Neighborhood
                </h2>
                <p className="text-xs text-[#71808C] dark:text-[#B3C0C9]">
                  Select your district and ward to see verified inventory at licensed retail stores.
                </p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search store name, locality, ward..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#E56B35]/20 focus:border-[#E56B35]"
                  />
                </div>

                <div>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-medium focus:outline-hidden"
                  >
                    <option value="ALL">All Districts (काठमाडौं, ललितपुर, भक्तपुर...)</option>
                    <option value="Kathmandu">Kathmandu (काठमाडौं)</option>
                    <option value="Lalitpur">Lalitpur (ललितपुर)</option>
                    <option value="Bhaktapur">Bhaktapur (भक्तपुर)</option>
                    <option value="Kaski">Kaski / Pokhara (कास्की / पोखरा)</option>
                  </select>
                </div>

                <div>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-medium focus:outline-hidden"
                  >
                    <option value="ALL">All Authorized Brands (सबै ब्राण्ड)</option>
                    <option value="Nepal Gas">Nepal Gas (नेपाल ग्यास)</option>
                    <option value="Everest Gas">Everest Gas (एभरेष्ट ग्यास)</option>
                    <option value="Sugam Gas">Sugam Gas (सुगम ग्यास)</option>
                    <option value="Grihalaxmi Gas">Grihalaxmi Gas (गृहलक्ष्मी ग्यास)</option>
                    <option value="Bhanu Gas">Bhanu Gas (भानु ग्यास)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRetailers.map((r) => (
                <div 
                  key={r.id}
                  className="bg-white dark:bg-[#223440] rounded-2xl p-5 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#17364A] dark:text-[#F3A34A] bg-[#E8EEF3] dark:bg-[#2B3F4C] px-2 py-0.5 rounded border border-[#D2DDE6] dark:border-[#3B4F5C] inline-block mb-1">
                        Brand: {r.brand}
                      </span>
                      <h3 className="font-bold text-sm text-[#17364A] dark:text-white">
                        {r.name}
                      </h3>
                      <p className="text-xs text-[#71808C] dark:text-[#B3C0C9] flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E56B35] shrink-0" />
                        <span>{r.address} ({r.district})</span>
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'AVAILABLE'
                        ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                        : r.status === 'LOW_STOCK'
                          ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                          : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F4F7F9] dark:bg-[#192630] rounded-xl border border-[#E7E8E5] dark:border-[#2D3E4B] text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#71808C] dark:text-[#B3C0C9] uppercase font-bold block">
                        Availability Status
                      </span>
                      <span className="font-bold text-[#17364A] dark:text-white">
                        {r.stockStatus}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#71808C] dark:text-[#B3C0C9] uppercase font-bold block">
                        Regulated Price
                      </span>
                      <span className="font-extrabold font-mono text-[#E56B35]">
                        NPR {r.priceNpr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#71808C] dark:text-[#B3C0C9] pt-2 border-t border-[#E7E8E5] dark:border-[#2D3E4B]">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{r.contactPhone}</span>
                    </span>
                    <span>Updated {r.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: HOW GAS MOVES (DISTRIBUTION CHAIN) */}
        {/* ========================================================== */}
        {activeTab === 'chain' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 sm:p-8 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-[#17364A] dark:text-white">
                  The Complete Journey of an LPG Cylinder in Nepal
                </h2>
                <p className="text-xs sm:text-sm text-[#71808C] dark:text-[#B3C0C9] mt-1">
                  How liquid petroleum gas is decanted, filled to NBSM standards, transported under seal, and delivered to retailers.
                </p>
              </div>

              {/* Step by Step Timeline */}
              <div className="space-y-4">
                
                <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E56B35]">Stage 1 • Bulk Inflow</span>
                    <h3 className="font-bold text-sm text-[#17364A] dark:text-white">
                      Cross-Border Bullet Tanker Decanting (IOC to NOC)
                    </h3>
                    <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD] max-w-2xl leading-relaxed">
                      Cryogenic bullet tankers deliver bulk propane/butane mix from Indian Oil refineries (Barauni, Haldia, Mathura). Tare mass and gross mass are recorded at Nepal customs weighbridges (Birgunj, Kakarbhitta, Sunauli) into plant storage pressure spheres.
                    </p>
                  </div>
                  <div className="text-left md:text-right font-mono text-xs">
                    <span className="text-[#71808C] block text-[10px]">Unit of Measurement</span>
                    <strong className="text-sm text-[#17364A] dark:text-white">Metric Tonnes (MT)</strong>
                  </div>
                </div>

                <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E56B35]">Stage 2 • Precision Filling</span>
                    <h3 className="font-bold text-sm text-[#17364A] dark:text-white">
                      Automated Plant Tare Calibration (NBSM NS:533)
                    </h3>
                    <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD] max-w-2xl leading-relaxed">
                      28 licensed industrial bottling plants use electronic carousels to fill 14.2 kg domestic cylinders. The empty steel tare stamped on the cylinder neck is measured. By statutory NS:533 standards, scale tolerance is ± 100g. A numbered wire seal with barcode is clamped over the valve.
                    </p>
                  </div>
                  <div className="text-left md:text-right font-mono text-xs">
                    <span className="text-[#71808C] block text-[10px]">Statutory Tolerance</span>
                    <strong className="text-sm text-[#15803D]">± 100 grams</strong>
                  </div>
                </div>

                <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E56B35]">Stage 3 • Highway Custody Transfer</span>
                    <h3 className="font-bold text-sm text-[#17364A] dark:text-white">
                      Authorized Wholesale Distributor Bay Offloading
                    </h3>
                    <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD] max-w-2xl leading-relaxed">
                      Delivery trucks arrive at 842 authorized wholesale distributor depots. Receiving managers inspect wire seals and verify counts via barcode/RFID conveyor scans. If 1,000 were dispatched but 950 arrive, an automated discrepancy record is filed for NOC investigation without accusing the driver of theft.
                    </p>
                  </div>
                  <div className="text-left md:text-right font-mono text-xs">
                    <span className="text-[#71808C] block text-[10px]">Due Process</span>
                    <strong className="text-sm text-[#B45309]">Investigated Discrepancy</strong>
                  </div>
                </div>

                <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E56B35]">Stage 4 • Retail Availability</span>
                    <h3 className="font-bold text-sm text-[#17364A] dark:text-white">
                      Community Stores & Citizen Purchase
                    </h3>
                    <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD] max-w-2xl leading-relaxed">
                      Distributor mini-trucks deliver batches to 4,210 local retailers. Retailers confirm receipt and keep stock beacons updated so nearby families know gas is ready for exchange at the official NPR 1,895 gazetted rate.
                    </p>
                  </div>
                  <div className="text-left md:text-right font-mono text-xs">
                    <span className="text-[#71808C] block text-[10px]">Citizen Guarantee</span>
                    <strong className="text-sm text-[#15803D]">NPR 1,895 Gazetted</strong>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: PUBLIC REPORTS */}
        {/* ========================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 sm:p-8 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-[#17364A] dark:text-white">
                  National LPG Supply & Compliance Intelligence
                </h2>
                <p className="text-xs sm:text-sm text-[#71808C] dark:text-[#B3C0C9] mt-1">
                  Public figures published by Nepal Oil Corporation under the Right to Information Act (RTI).
                </p>
              </div>

              {/* Three Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B]">
                  <span className="text-xs text-[#71808C] dark:text-[#B3C0C9] block font-bold uppercase">Monthly Inflow Fulfillment</span>
                  <div className="text-3xl font-extrabold font-mono text-[#17364A] dark:text-white mt-1">41,280 MT</div>
                  <span className="text-xs text-[#15803D] font-semibold mt-1 block">99.5% of National Quota</span>
                </div>

                <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B]">
                  <span className="text-xs text-[#71808C] dark:text-[#B3C0C9] block font-bold uppercase">Regulated Price Compliance</span>
                  <div className="text-3xl font-extrabold font-mono text-[#15803D] mt-1">99.91%</div>
                  <span className="text-xs text-[#71808C] font-semibold mt-1 block">4 price deviation notices issued</span>
                </div>

                <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B]">
                  <span className="text-xs text-[#71808C] dark:text-[#B3C0C9] block font-bold uppercase">NS:533 Tare Scale Accuracy</span>
                  <div className="text-3xl font-extrabold font-mono text-[#17364A] dark:text-white mt-1">99.78%</div>
                  <span className="text-xs text-[#71808C] font-semibold mt-1 block">Within ± 100g legal limit</span>
                </div>
              </div>

              {/* Major Terminal Inflow Table */}
              <div className="border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#E8EEF3] dark:bg-[#2B3F4C] text-[#17364A] dark:text-white font-bold">
                    <tr>
                      <th className="py-3 px-4">Customs / Terminal Gateway</th>
                      <th className="py-3 px-4">Source Refinery</th>
                      <th className="py-3 px-4 text-right">Quota (MT)</th>
                      <th className="py-3 px-4 text-right">Realized Inflow (MT)</th>
                      <th className="py-3 px-4 text-center">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E8E5] dark:divide-[#3B4F5C]">
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#17364A] dark:text-white">Raxaul / Birgunj Dry Port</td>
                      <td className="py-3 px-4 text-[#71808C]">IOC Barauni Refinery</td>
                      <td className="py-3 px-4 text-right font-mono">24,000 MT</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">23,840 MT</td>
                      <td className="py-3 px-4 text-center text-[#15803D] font-bold">99.3%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#17364A] dark:text-white">Siliguri / Kakarbhitta Port</td>
                      <td className="py-3 px-4 text-[#71808C]">IOC Guwahati / Numaligarh</td>
                      <td className="py-3 px-4 text-right font-mono">10,000 MT</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">10,120 MT</td>
                      <td className="py-3 px-4 text-center text-[#15803D] font-bold">101.2%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#17364A] dark:text-white">Mathura / Sunauli Port</td>
                      <td className="py-3 px-4 text-[#71808C]">IOC Mathura Refinery</td>
                      <td className="py-3 px-4 text-right font-mono">7,500 MT</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">7,320 MT</td>
                      <td className="py-3 px-4 text-center text-[#15803D] font-bold">97.6%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: SUBMIT GRIEVANCE / COMPLAINT */}
        {/* ========================================================== */}
        {activeTab === 'complaint' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 sm:p-8 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-[#17364A] dark:text-white">
                  File a Formal Consumer Protection Grievance
                </h2>
                <p className="text-xs sm:text-sm text-[#71808C] dark:text-[#B3C0C9] mt-1">
                  Report overpricing, artificial shortage, or defective seals directly to the Nepal Oil Corporation Quick Response Team.
                </p>
              </div>

              {generatedTicket ? (
                <div className="p-6 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" />
                  <h3 className="text-base font-bold text-[#15803D]">
                    Grievance Registered Successfully
                  </h3>
                  <p className="text-xs text-[#15803D]">
                    Your complaint has been forwarded to the NOC Area Inspector. Save your ticket reference number to track investigation progress:
                  </p>
                  <div className="text-2xl font-extrabold font-mono text-[#17364A] bg-white py-2 px-4 rounded-xl border border-[#BBF7D0] inline-block">
                    {generatedTicket}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setTrackQuery(generatedTicket);
                        setActiveTab('track');
                      }}
                      className="mt-3 px-4 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl shadow-xs transition-colors"
                    >
                      Track This Ticket Now
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
                  
                  <div className="p-3 bg-[#FEF3E3] dark:bg-[#3D1606] rounded-xl border border-[#FDE7C7] dark:border-[#6E280C] text-[#A84A22] dark:text-[#F3A34A] text-xs">
                    <strong>Authentication Rule:</strong> Under NOC Consumer Regulations, complaints require a valid citizen phone contact to prevent fraudulent business defamation. Your number remains confidential.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-[#344454] dark:text-white block mb-1">
                        Your Full Name (तपाईंको नाम):
                      </label>
                      <input
                        type="text"
                        required
                        value={complaintForm.citizenName}
                        onChange={(e) => setComplaintForm({ ...complaintForm, citizenName: e.target.value })}
                        placeholder="E.g. Bikash Thapa"
                        className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#344454] dark:text-white block mb-1">
                        Mobile Phone Number (सम्पर्क नम्बर):
                      </label>
                      <input
                        type="tel"
                        required
                        value={complaintForm.citizenPhone}
                        onChange={(e) => setComplaintForm({ ...complaintForm, citizenPhone: e.target.value })}
                        placeholder="98XXXXXXXX"
                        className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#344454] dark:text-white block mb-1">
                      Violation Category (उजुरीको प्रकार):
                    </label>
                    <select
                      value={complaintForm.incidentType}
                      onChange={(e) => setComplaintForm({ ...complaintForm, incidentType: e.target.value })}
                      className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-medium"
                    >
                      <option value="OVERPRICING">Selling Above Official NPR 1,895 Gazetted Rate</option>
                      <option value="ARTIFICIAL_HOARDING">Artificial Shortage / Refusal to Distribute</option>
                      <option value="TAMPERED_SEAL">Tampered Valve Seal / Underweight Cylinder</option>
                      <option value="MANDATORY_TIE_IN">Forced Tie-in Purchase (Forcing purchase of regulator/stove)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#344454] dark:text-white block mb-1">
                      Retail Store Name & Locality (पसलको नाम र ठेगाना):
                    </label>
                    <input
                      type="text"
                      required
                      value={complaintForm.retailerName}
                      onChange={(e) => setComplaintForm({ ...complaintForm, retailerName: e.target.value })}
                      placeholder="E.g. Shrestha Grocery & Gas Corner, Koteshwor Ward 32"
                      className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#344454] dark:text-white block mb-1">
                      Detailed Incident Explanation (घटनाको विस्तृत विवरण):
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={complaintForm.details}
                      onChange={(e) => setComplaintForm({ ...complaintForm, details: e.target.value })}
                      placeholder="State what occurred, price charged, date and time..."
                      className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 text-xs font-bold text-white bg-[#E56B35] hover:bg-[#C8572A] rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authenticate & Submit Formal Grievance</span>
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 6: TRACK COMPLAINT */}
        {/* ========================================================== */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 sm:p-8 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-[#17364A] dark:text-white">
                  Track Your Complaint Status
                </h2>
                <p className="text-xs sm:text-sm text-[#71808C] dark:text-[#B3C0C9] mt-1">
                  Enter your grievance reference ticket (e.g., <span className="font-mono">NOC-CIT-2083-99</span> or <span className="font-mono">CMP-2083-4921</span>) to inspect live investigation notes.
                </p>
              </div>

              <form onSubmit={handleTrackSearch} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Ticket Number e.g. CMP-2083-4921..."
                  className="flex-1 p-3 text-xs bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-mono"
                />
                <button
                  type="submit"
                  disabled={isTrackSearching}
                  className="px-5 py-3 text-xs font-bold text-white bg-[#17364A] hover:bg-[#23455C] rounded-xl shadow-xs transition-colors"
                >
                  {isTrackSearching ? 'Checking...' : 'Track Ticket'}
                </button>
              </form>

              {/* Search Result */}
              {trackedResult && (
                <div className="space-y-4 pt-2">
                  {trackedResult.error ? (
                    <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-xs text-[#B91C1C]">
                      {trackedResult.message}
                    </div>
                  ) : (
                    <div className="p-5 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E7E8E5] dark:border-[#2D3E4B]">
                        <div>
                          <span className="text-[10px] text-[#71808C] uppercase font-bold block">Reference Ticket</span>
                          <span className="font-mono font-extrabold text-sm text-[#17364A] dark:text-white">{trackedResult.ticketNumber}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          {trackedResult.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[#71808C] block text-[10px]">Target Retail Store:</span>
                          <strong className="text-[#17364A] dark:text-white">{trackedResult.targetBusiness}</strong>
                        </div>
                        <div>
                          <span className="text-[#71808C] block text-[10px]">Assigned Inspector:</span>
                          <strong className="text-[#17364A] dark:text-white">{trackedResult.assignedOfficer}</strong>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#223440] rounded-xl border border-[#E7E8E5] dark:border-[#3B4F5C] space-y-1">
                        <span className="text-[10px] font-bold text-[#E56B35] uppercase block">Official NOC Inspector Note:</span>
                        <p className="text-[#344454] dark:text-slate-200 leading-relaxed">
                          {trackedResult.resolutionNotes}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold uppercase text-[#71808C] block">Investigation Steps:</span>
                        <div className="space-y-1.5">
                          {trackedResult.timeline.map((step: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#223440] border border-[#E7E8E5] dark:border-[#3B4F5C]">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${step.done ? 'bg-[#15803D]' : 'bg-slate-300'}`} />
                                <span className={`text-xs ${step.done ? 'font-bold text-[#17364A] dark:text-white' : 'text-[#71808C]'}`}>{step.step}</span>
                              </div>
                              <span className="text-[10px] text-[#71808C] font-mono">{step.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: ABOUT */}
        {/* ========================================================== */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 sm:p-8 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-4 leading-relaxed text-xs sm:text-sm">
              <h2 className="text-xl font-bold text-[#17364A] dark:text-white">
                About the National LPG Tracker Initiative
              </h2>
              <p className="text-[#4F6375] dark:text-[#CBD6DD]">
                Liquefied Petroleum Gas (LPG) is a vital staple energy source for over 4 million urban and peri-urban households across Nepal. A consistent, transparent distribution chain is essential for national consumer welfare, price stabilization, and industrial accountability.
              </p>
              <h3 className="font-bold text-sm text-[#17364A] dark:text-white pt-2">
                Statutory Regulatory Foundation
              </h3>
              <p className="text-[#4F6375] dark:text-[#CBD6DD]">
                Administered under the directive of the Ministry of Industry, Commerce and Supplies (MoICS) and Nepal Oil Corporation (NOC), LPG Tracker enforces statutory calibration guidelines defined under Nepal Bureau of Standards & Metrology Standard NS:533. Scale variances are audited to ensure fairness for both industrial bottling plants and local retail businesses.
              </p>
              <h3 className="font-bold text-sm text-[#17364A] dark:text-white pt-2">
                Privacy Protection
              </h3>
              <p className="text-[#4F6375] dark:text-[#CBD6DD]">
                The platform monitors inter-organizational custody transfer exclusively. Household cylinder purchases and citizen family details are unrecorded, guaranteeing civil privacy under the Constitution of Nepal.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 8: HELP AND CONTACT */}
        {/* ========================================================== */}
        {activeTab === 'help' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#223440] rounded-3xl p-6 sm:p-8 border border-[#E7E8E5] dark:border-[#3B4F5C] shadow-card space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17364A] dark:text-white">
                  Consumer Help & NOC Emergency Contacts
                </h2>
                <p className="text-xs sm:text-sm text-[#71808C] dark:text-[#B3C0C9] mt-1">
                  Connect directly with the regulatory and inspection authorities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-1">
                  <span className="text-[10px] font-bold text-[#E56B35] uppercase">NOC Central Headquarters</span>
                  <h4 className="font-bold text-sm text-[#17364A] dark:text-white">Babarmahal, Kathmandu</h4>
                  <p className="text-xs text-[#71808C] font-mono">Phone: 01-4262780, 01-4263481</p>
                  <p className="text-xs text-[#71808C]">Email: lpg@noc.org.np</p>
                </div>

                <div className="p-4 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-1">
                  <span className="text-[10px] font-bold text-[#E56B35] uppercase">Consumer Protection Helpline</span>
                  <h4 className="font-bold text-sm text-[#17364A] dark:text-white">Toll-Free Complaint Desk</h4>
                  <p className="text-xs text-[#71808C] font-mono font-bold">1660-01-00000</p>
                  <p className="text-xs text-[#71808C]">Available Sun–Fri 9:00 AM – 5:00 PM</p>
                </div>

                <div className="p-4 bg-[#F4F7F9] dark:bg-[#192630] rounded-2xl border border-[#E7E8E5] dark:border-[#2D3E4B] space-y-1">
                  <span className="text-[10px] font-bold text-[#B91C1C] uppercase">Emergency Fire & Leakage</span>
                  <h4 className="font-bold text-sm text-[#17364A] dark:text-white">Police & Fire Rescue</h4>
                  <p className="text-xs text-[#B91C1C] font-mono font-bold">Dial 101 (Fire) or 100 (Police)</p>
                  <p className="text-xs text-[#71808C]">In case of active valve gas leak</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. Official Public Footer */}
      <footer className="border-t border-[#E7E8E5] dark:border-[#3B4F5C] bg-[#FBFAF7] dark:bg-[#223440] py-6 px-4 lg:px-8 text-xs text-[#71808C] dark:text-[#B3C0C9] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BrandLogo size="sm" showText={false} />
            <span className="font-bold text-[#17364A] dark:text-white">LPG Tracker Nepal</span>
            <span>— Government of Nepal • Nepal Oil Corporation (NOC)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <button onClick={() => setActiveTab('about')} className="hover:underline">About System</button>
            <span>•</span>
            <button onClick={() => setActiveTab('help')} className="hover:underline">Consumer Helpline</button>
            <span>•</span>
            <button onClick={() => setActiveTab('complaint')} className="hover:underline">Submit Grievance</button>
            <span>•</span>
            <span className="font-mono text-[#E56B35]">Regulated Rate: NPR 1,895</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PublicWebsite;
