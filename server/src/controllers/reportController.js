import { db } from '../db/index.js';

export const getNationalOverviewMetrics = (req, res) => {
  const openDiscrepancies = db.discrepancyCases.filter(d => d.investigation_status !== 'RESOLVED').length;
  const pendingApprovals = db.organizations.filter(o => o.status === 'PENDING_APPROVAL').length;

  return res.json({
    success: true,
    metrics: {
      bulkLpgReceivedMT: 41280,
      bulkLpgReceivedTrend: 3.4,
      cylindersFilledCount: 2841600,
      cylindersFilledTrend: 2.1,
      cylindersDispatchedCount: 2795400,
      cylindersDispatchedTrend: 1.8,
      cylindersConfirmedReceivedCount: 2788940,
      cylindersConfirmedReceivedTrend: 1.7,
      retailerStockCount: 624100,
      retailerStockTrend: -0.6,
      activeDiscrepanciesCount: openDiscrepancies,
      discrepanciesTrend: -12.5,
      registeredPlantsCount: 28,
      authorizedDistributorsCount: 842,
      activeRetailersCount: 4210,
      pendingApprovalsCount: pendingApprovals
    }
  });
};

export const getProvincialQuotas = (req, res) => {
  const provinces = [
    { id: 1, nameEn: 'Koshi Province', nameNe: 'कोशी प्रदेश', hq: 'Biratnagar', monthlyQuotaMT: 7200, currentStock: 98400, dailyDispatched: 18200, status: 'OPTIMAL' },
    { id: 2, nameEn: 'Madhesh Province', nameNe: 'मधेश प्रदेश', hq: 'Janakpur', monthlyQuotaMT: 8400, currentStock: 114000, dailyDispatched: 22100, status: 'OPTIMAL' },
    { id: 3, nameEn: 'Bagmati Province', nameNe: 'बागमती प्रदेश', hq: 'Hetauda / Kathmandu', monthlyQuotaMT: 14500, currentStock: 182000, dailyDispatched: 44000, status: 'OPTIMAL' },
    { id: 4, nameEn: 'Gandaki Province', nameNe: 'गण्डकी प्रदेश', hq: 'Pokhara', monthlyQuotaMT: 4800, currentStock: 64500, dailyDispatched: 12600, status: 'OPTIMAL' },
    { id: 5, nameEn: 'Lumbini Province', nameNe: 'लुम्बिनी प्रदेश', hq: 'Deukhuri / Butwal', monthlyQuotaMT: 6200, currentStock: 78000, dailyDispatched: 16800, status: 'MODERATE' },
    { id: 6, nameEn: 'Karnali Province', nameNe: 'कर्णाली प्रदेश', hq: 'Birendranagar', monthlyQuotaMT: 1900, currentStock: 18400, dailyDispatched: 3900, status: 'LOW_ALERT' },
    { id: 7, nameEn: 'Sudurpashchim Province', nameNe: 'सुदूरपश्चिम प्रदेश', hq: 'Godawari / Dhangadhi', monthlyQuotaMT: 2600, currentStock: 26800, dailyDispatched: 6100, status: 'MODERATE' },
  ];

  return res.json({ success: true, provinces });
};

