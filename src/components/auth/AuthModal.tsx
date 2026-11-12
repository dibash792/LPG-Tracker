import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  X, 
  Lock, 
  Building2, 
  Truck, 
  Store, 
  ShieldCheck, 
  Check, 
  CheckCircle2,
  AlertCircle, 
  FileText, 
  User, 
  Key,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { UserRoleContext } from '../layout/Header';
import { Organization, OrgType } from '../../types';
import { api } from '../../api/client';
import { OfflineDraftManager } from '../../utils/offlineDraftManager';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
  onLoginSuccess: (role: UserRoleContext) => void;
  onRegisterOrganization: (newOrg: Organization) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'LOGIN',
  onLoginSuccess,
  onRegisterOrganization,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useNotifications();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>(initialMode);
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType>('BOTTLING_PLANT');

  // Login Form
  const [loginPhone, setLoginPhone] = useState('9841234567');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRoleContext>('NOC_SUPER_ADMIN');

  // Forgot password
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Registration Form
  const [regForm, setRegForm] = useState({
    name: '',
    legalEntityName: '',
    panNumber: '',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metro',
    ward: 4,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    storageCapacity: 2000,
    fillingUnitModel: 'Siraga Automated Electronic Carousel (24 Heads)',
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Authenticated as ${selectedDemoRole.replace('_', ' ')}. Session established.`, 'success');
    onLoginSuccess(selectedDemoRole);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.contactPhone || !regForm.contactName) {
      showToast('Please complete all statutory applicant fields.', 'error');
      return;
    }

    const regNum = `APP-REG-${Date.now().toString().slice(-4)}`;
    const newOrg: Organization = {
      id: `org-app-${Date.now().toString().slice(-4)}`,
      regNumber: regNum,
      name: regForm.name,
      legalEntityName: regForm.legalEntityName || regForm.name,
      type: selectedOrgType,
      province: regForm.province,
      district: regForm.district,
      municipality: regForm.municipality,
      ward: Number(regForm.ward) || 1,
      primaryContact: {
        name: regForm.contactName,
        designation: selectedOrgType === 'BOTTLING_PLANT' ? 'Plant Manager' : selectedOrgType === 'AUTHORIZED_DISTRIBUTOR' ? 'Managing Director' : 'Proprietor',
        phone: regForm.contactPhone,
        email: regForm.contactEmail || 'contact@entity.np',
      },
      status: 'PENDING_APPROVAL',
      registrationDate: new Date().toISOString().split('T')[0],
      storageCapacityCylinders: Number(regForm.storageCapacity) || 1000,
      currentStockCylinders: 0,
      activeDispatchesCount: 0,
      complianceRating: 90.0,
      fillingUnitModel: selectedOrgType === 'BOTTLING_PLANT' ? regForm.fillingUnitModel : undefined,
      licenseExpiryDate: '2028-04-13',
      submittedDocuments: [
        { name: 'Company Registration / Trade License', type: 'PDF', verified: true },
        { name: 'PAN / VAT Tax Clearance Certificate', type: 'PDF', verified: true },
        { name: 'Explosive Containment Boundary Clearance', type: 'PDF', verified: false },
      ]
    };

    // Forward to API & App state
    api.registerOrganization({
      legal_name: newOrg.legalEntityName,
      trade_name: newOrg.name,
      org_type: newOrg.type,
      province_id: 3,
      district: newOrg.district,
      municipality: newOrg.municipality,
      ward_number: newOrg.ward,
      phone_number: newOrg.primaryContact.phone,
      contact_name: newOrg.primaryContact.name,
      storage_capacity_cylinders: newOrg.storageCapacityCylinders
    }).catch(() => {
      OfflineDraftManager.saveDraft({
        type: 'ORG_REGISTRATION',
        payload: newOrg
      });
    });

    onRegisterOrganization(newOrg);
    showToast(`Registration application for "${newOrg.name}" submitted in PENDING status. Forwarded to NOC Super Admin Board for review.`, 'success');
    onClose();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1F2B]/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FBFAF7] dark:bg-[#223440] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E7E8E5] dark:border-[#3B4F5C] animate-in zoom-in-95 duration-150 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E7E8E5] dark:border-[#3B4F5C] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-[#E8EEF3] dark:bg-[#2B3F4C] text-[#17364A] dark:text-[#F3A34A] border border-[#D2DDE6] dark:border-[#3B4F5C]">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#17364A] dark:text-white">
                {authMode === 'LOGIN' 
                  ? 'Authorized Personnel Sign In' 
                  : authMode === 'REGISTER'
                    ? 'New Organization Registration'
                    : 'Recover Password & Verification'}
              </h3>
            </div>
            <p className="text-xs text-[#71808C] dark:text-[#B3C0C9] mt-1">
              {authMode === 'LOGIN'
                ? 'Access operational consoles for NOC administrators, plants, distributors, and retailers.'
                : authMode === 'REGISTER'
                  ? 'Submit your organization for Nepal Oil Corporation statutory operating licensing.'
                  : 'Enter your registered authorized phone number to receive an OTP reset link.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#2B3F4C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#EBE8E1] dark:bg-[#192630] rounded-2xl text-xs font-bold border border-[#E7E8E5] dark:border-[#2D3E4B]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setForgotSubmitted(false);
            }}
            className={`py-2 rounded-xl transition-all ${authMode === 'LOGIN' ? 'bg-[#17364A] text-white shadow-xs' : 'text-[#71808C] dark:text-[#B3C0C9] hover:text-[#17364A]'}`}
          >
            Staff Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('REGISTER')}
            className={`py-2 rounded-xl transition-all ${authMode === 'REGISTER' ? 'bg-[#17364A] text-white shadow-xs' : 'text-[#71808C] dark:text-[#B3C0C9] hover:text-[#17364A]'}`}
          >
            Register Entity
          </button>
        </div>

        {/* ======================================================== */}
        {/* LOGIN FORM */}
        {/* ======================================================== */}
        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#344454] dark:text-white block mb-1">
                Select Your Operational Role (Demonstration Profile):
              </label>
              <select
                value={selectedDemoRole}
                onChange={(e) => setSelectedDemoRole(e.target.value as UserRoleContext)}
                className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-medium focus:outline-hidden"
              >
                <option value="NOC_SUPER_ADMIN">NOC Super Admin (Dr. Chandan Adhikari — Babarmahal HQ)</option>
                <option value="PLANT_OPERATOR">Bottling Plant Operator (Nepal Gas Udyog Ltd. — Balaju)</option>
                <option value="DISTRIBUTOR_MANAGER">Authorized Distributor (Patan Traders & Energy — Lagankhel)</option>
                <option value="RETAILER_OPERATOR">Local LPG Retailer (Baluwatar Gas & Grocery Store)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Registered Mobile Number:</label>
                <input
                  type="tel"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Password:</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#71808C] dark:text-[#B3C0C9]">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span>HMAC Session Encryption</span>
              </span>
              <button
                type="button"
                onClick={() => setAuthMode('FORGOT_PASSWORD')}
                className="text-[#E56B35] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-[#E56B35] hover:bg-[#C8572A] rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* FORGOT PASSWORD */}
        {/* ======================================================== */}
        {authMode === 'FORGOT_PASSWORD' && (
          <div className="space-y-4 text-xs">
            {forgotSubmitted ? (
              <div className="p-5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" />
                <h4 className="font-bold text-sm text-[#15803D]">Recovery Link Dispatched</h4>
                <p className="text-xs text-[#15803D]">
                  If <strong>{forgotPhone}</strong> is registered, a one-time reset link has been dispatched via SMS. Follow the link within 15 minutes.
                </p>
                <button
                  onClick={() => setAuthMode('LOGIN')}
                  className="mt-2 text-xs font-bold text-[#17364A] underline"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-[#4F6375] dark:text-[#CBD6DD]">
                  Enter your registered official mobile number. An authorized OTP code will be sent to recover access.
                </p>

                <div>
                  <label className="font-bold text-[#344454] dark:text-white block mb-1">Official Mobile Number:</label>
                  <input
                    type="tel"
                    required
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-mono"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="text-xs text-[#71808C] hover:underline"
                  >
                    Back to Sign In
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-bold text-white bg-[#17364A] hover:bg-[#23455C] rounded-xl shadow-xs"
                  >
                    Send Recovery SMS OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ORGANIZATIONAL REGISTRATION (3 PATHS) */}
        {/* ======================================================== */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            
            {/* Separate Registration Paths */}
            <div>
              <label className="font-bold text-[#344454] dark:text-white block mb-1.5">
                Select Your Statutory Entity Type:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrgType('BOTTLING_PLANT')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedOrgType === 'BOTTLING_PLANT'
                      ? 'bg-[#17364A] text-white border-[#17364A] shadow-xs'
                      : 'bg-[#F3F1EC] dark:bg-[#192630] text-[#344454] dark:text-white border-[#E7E8E5] dark:border-[#3B4F5C]'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-[#F3A34A]" />
                  <span className="font-bold block text-[11px]">Bottling Plant</span>
                  <span className="text-[10px] text-slate-400 block">बोटलिङ उद्योग</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrgType('AUTHORIZED_DISTRIBUTOR')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedOrgType === 'AUTHORIZED_DISTRIBUTOR'
                      ? 'bg-[#17364A] text-white border-[#17364A] shadow-xs'
                      : 'bg-[#F3F1EC] dark:bg-[#192630] text-[#344454] dark:text-white border-[#E7E8E5] dark:border-[#3B4F5C]'
                  }`}
                >
                  <Truck className="w-5 h-5 mx-auto mb-1 text-[#F3A34A]" />
                  <span className="font-bold block text-[11px]">Distributor</span>
                  <span className="text-[10px] text-slate-400 block">अधिकृत वितरक</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrgType('LOCAL_RETAILER')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedOrgType === 'LOCAL_RETAILER'
                      ? 'bg-[#17364A] text-white border-[#17364A] shadow-xs'
                      : 'bg-[#F3F1EC] dark:bg-[#192630] text-[#344454] dark:text-white border-[#E7E8E5] dark:border-[#3B4F5C]'
                  }`}
                >
                  <Store className="w-5 h-5 mx-auto mb-1 text-[#F3A34A]" />
                  <span className="font-bold block text-[11px]">Local Retailer</span>
                  <span className="text-[10px] text-slate-400 block">खुद्रा बिक्रेता</span>
                </button>
              </div>
            </div>

            {/* Statutory Notice */}
            <div className="p-3 bg-[#E8EEF3] dark:bg-[#192630] rounded-xl border border-[#D2DDE6] dark:border-[#3B4F5C] text-[11px] text-[#4F6375] dark:text-[#CBD6DD]">
              <strong>Pending Review Notice:</strong> Under NOC rules, registration creates a <span className="font-bold text-[#B45309]">PENDING</span> application. Your account cannot dispatch or receive cylinders until the NOC Super Admin Board reviews your statutory documents.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Trade Business Name:</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder={selectedOrgType === 'BOTTLING_PLANT' ? 'E.g. Sagarmatha Gas Udyog Ltd.' : selectedOrgType === 'AUTHORIZED_DISTRIBUTOR' ? 'E.g. Himalayan Energy Suppliers' : 'E.g. Thapa Kirana & Gas Provision'}
                  className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Legal Registered Entity Name:</label>
                <input
                  type="text"
                  required
                  value={regForm.legalEntityName}
                  onChange={(e) => setRegForm({ ...regForm, legalEntityName: e.target.value })}
                  placeholder="Official Company Registrar Name"
                  className="w-full p-2.5 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Province:</label>
                <select
                  value={regForm.province}
                  onChange={(e) => setRegForm({ ...regForm, province: e.target.value })}
                  className="w-full p-2 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                >
                  <option value="Bagmati Province">Bagmati Province</option>
                  <option value="Koshi Province">Koshi Province</option>
                  <option value="Madhesh Province">Madhesh Province</option>
                  <option value="Gandaki Province">Gandaki Province</option>
                  <option value="Lumbini Province">Lumbini Province</option>
                  <option value="Karnali Province">Karnali Province</option>
                  <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">District:</label>
                <input
                  type="text"
                  required
                  value={regForm.district}
                  onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                  placeholder="E.g. Kathmandu"
                  className="w-full p-2 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Ward Number:</label>
                <input
                  type="number"
                  required
                  value={regForm.ward}
                  onChange={(e) => setRegForm({ ...regForm, ward: Number(e.target.value) })}
                  className="w-full p-2 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Authorized Contact Official:</label>
                <input
                  type="text"
                  required
                  value={regForm.contactName}
                  onChange={(e) => setRegForm({ ...regForm, contactName: e.target.value })}
                  placeholder="Officer Name"
                  className="w-full p-2 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Official Mobile Phone:</label>
                <input
                  type="tel"
                  required
                  value={regForm.contactPhone}
                  onChange={(e) => setRegForm({ ...regForm, contactPhone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full p-2 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white font-mono"
                />
              </div>
            </div>

            {selectedOrgType === 'BOTTLING_PLANT' && (
              <div>
                <label className="font-bold text-[#344454] dark:text-white block mb-1">Filling Unit SCADA Model:</label>
                <input
                  type="text"
                  value={regForm.fillingUnitModel}
                  onChange={(e) => setRegForm({ ...regForm, fillingUnitModel: e.target.value })}
                  className="w-full p-2 bg-[#F3F1EC] dark:bg-[#192630] border border-[#E7E8E5] dark:border-[#3B4F5C] rounded-xl text-[#344454] dark:text-white"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-[#17364A] hover:bg-[#23455C] rounded-xl shadow-xs transition-colors"
              >
                Submit Application for NOC Board Verification
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
export default AuthModal;
