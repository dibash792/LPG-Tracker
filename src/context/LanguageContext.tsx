import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ne';

interface TranslationMap {
  [key: string]: {
    en: string;
    ne: string;
  };
}

export const translations: TranslationMap = {
  // Navigation
  dashboard: { en: 'Dashboard', ne: 'ड्यासबोर्ड' },
  distributionChain: { en: 'Distribution Chain', ne: 'वितरण शृङ्खला' },
  discrepancies: { en: 'Discrepancy Cases', ne: 'असामञ्जस्य / फरक विवरण' },
  organizations: { en: 'Organization Directory', ne: 'संस्था तथा कम्पनीहरू' },
  approvals: { en: 'Pending Approvals', ne: 'स्वीकृति पर्खिरहेका' },
  regionalStock: { en: 'Province Quotas & Stock', ne: 'प्रादेशिक मौज्दात र कोटा' },
  activityFeed: { en: 'Live Activity Feed', ne: 'प्रत्यक्ष गतिविधि प्रवाह' },
  auditLog: { en: 'Immutable Audit Trail', ne: 'लेखापरीक्षण अडिट लग' },
  reports: { en: 'Reports & Analytics', ne: 'प्रतिवेदन तथा विश्लेषण' },
  systemSettings: { en: 'System Settings', ne: 'प्रणाली सेटिङ' },

  // System Brand
  appTitle: { en: 'LPG Tracker Nepal', ne: 'एलपिजी ट्र्याकर नेपाल' },
  nationalPlatform: { en: 'National LPG Distribution Monitoring Platform', ne: 'राष्ट्रिय एलपिजी ग्यास वितरण अनुगमन तथा जवाफदेहिता प्रणाली' },
  nocEntity: { en: 'Nepal Oil Corporation', ne: 'नेपाल आयल निगम' },
  superAdminConsole: { en: 'NOC Super Admin Console', ne: 'एनओसी सुपर एडमिन कन्सोल' },
  demoModeBadge: { en: 'Simulated Demo Data Mode', ne: 'सिम्युलेटेड डेमो डाटा मोड' },

  // Metrics
  bulkImportReceived: { en: 'Bulk LPG Received (MT)', ne: 'आयातित बल्क एलपिजी (मेट्रिक टन)' },
  cylindersFilled: { en: 'Cylinders Filled', ne: 'भरिएका सिलिन्डर' },
  cylindersDispatched: { en: 'Cylinders Dispatched', ne: 'प्रेषित सिलिन्डर' },
  cylindersConfirmed: { en: 'Confirmed Received', ne: 'प्राप्ति पुष्टि सिलिन्डर' },
  retailerStock: { en: 'Retailer Stock Available', ne: 'खुद्रा विक्रेता मौज्दात' },
  discrepanciesFlagged: { en: 'Discrepancies Requiring Review', ne: 'छानबिन आवश्यक असामञ्जस्य' },

  // Statuses
  active: { en: 'Active', ne: 'सक्रिय' },
  pendingReview: { en: 'Pending Review', ne: 'समीक्षा पर्खिरहेको' },
  underInvestigation: { en: 'Under Investigation', ne: 'अनुसन्धानधीन' },
  technicalVariance: { en: 'Technical Variance', ne: 'प्राविधिक फरक (तौल/मापन)' },
  suspectedDiversion: { en: 'Suspected Diversion', ne: 'शङ्कास्पद विचलन' },
  confirmedFraud: { en: 'Confirmed Fraud', ne: 'प्रमाणित अनियमितता' },
  resolved: { en: 'Resolved', ne: 'फर्छ्यौट भएको' },
  suspended: { en: 'Suspended', ne: 'निलम्बित' },
  pendingApproval: { en: 'Pending Approval', ne: 'स्वीकृति प्रतीक्षारत' },

  // Chain stages
  stage1: { en: '1. NOC Bulk Terminal', ne: '१. एनओसी बल्क डिपो' },
  stage2: { en: '2. Bottling Plant', ne: '२. बोटलिङ प्लान्ट' },
  stage3: { en: '3. Authorized Distributor', ne: '३. अधिकृत वितरक' },
  stage4: { en: '4. Local LPG Retailer', ne: '४. स्थानीय खुद्रा बिक्रेता' },

  // Action buttons
  searchPlaceholder: { en: 'Search by consignment, plant, distributor, serial...', ne: 'चलानी नं, प्लान्ट, वितरक वा सिलिन्डर सिरियल खोज्नुहोस्...' },
  filterAll: { en: 'All', ne: 'सबै' },
  exportReport: { en: 'Export Official Report', ne: 'आधिकारिक प्रतिवेदन निकाल्नुहोस्' },
  investigateCase: { en: 'Open Investigation', ne: 'अनुसन्धान खोल्नुहोस्' },
  approveOrganization: { en: 'Approve License', ne: 'इजाजतपत्र स्वीकृत गर्नुहोस्' },
  rejectOrganization: { en: 'Reject Application', ne: 'आवेदन अस्वीकृत गर्नुहोस्' },
  viewAuditSeal: { en: 'Verify SHA-256 Seal', ne: 'एसएचए-२५६ छाप रुजु गर्नुहोस्' },
  refreshLive: { en: 'Live Sync', ne: 'प्रत्यक्ष ताजा' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatNumber: (num: number) => string;
  dateBS: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Nepali digits converter helper
export const toNepaliDigits = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num
    .toString()
    .replace(/\d/g, (x) => nepaliDigits[parseInt(x, 10)]);
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return key;
  };

  const formatNumber = (num: number): string => {
    const formatted = new Intl.NumberFormat(language === 'ne' ? 'ne-NP' : 'en-US').format(num);
    return language === 'ne' ? toNepaliDigits(formatted) : formatted;
  };

  const dateBS = language === 'ne' ? '२०८३ कार्तिक २५ मंगलबार' : '2026 Nov 10, Tuesday';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber, dateBS }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
