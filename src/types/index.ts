export type UserRole = 'NOC_SUPER_ADMIN' | 'PLANT_OPERATOR' | 'DISTRIBUTOR' | 'RETAILER' | 'PUBLIC_AUDITOR';

export type DiscrepancyStatus = 
  | 'PENDING_REVIEW'
  | 'UNDER_INVESTIGATION'
  | 'TECHNICAL_VARIANCE'
  | 'SUSPECTED_DIVERSION'
  | 'CONFIRMED_FRAUD'
  | 'RESOLVED';

export type DiscrepancySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DiscrepancyRecord {
  id: string;
  consignmentId: string;
  sourceEntity: {
    id: string;
    name: string;
    type: 'NOC_DEPOT' | 'BOTTLING_PLANT' | 'DISTRIBUTOR';
    location: string;
    province: string;
  };
  destinationEntity: {
    id: string;
    name: string;
    type: 'BOTTLING_PLANT' | 'DISTRIBUTOR' | 'RETAILER';
    location: string;
    province: string;
  };
  dispatchedAt: string;
  receivedAt: string;
  expectedQty: number; // In cylinders (14.2kg standard)
  dispatchedQty: number;
  receivedQty: number;
  varianceQty: number; // e.g. -15 or +2
  unmatchedSerials: string[];
  status: DiscrepancyStatus;
  severity: DiscrepancySeverity;
  assignedOfficer?: string;
  lastUpdated: string;
  initialRemarks: string;
  investigationNotes: Array<{
    id: string;
    timestamp: string;
    author: string;
    role: string;
    note: string;
    statusChange?: DiscrepancyStatus;
  }>;
}

export type OrgType = 'BOTTLING_PLANT' | 'AUTHORIZED_DISTRIBUTOR' | 'LOCAL_RETAILER';
export type OrgStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'INACTIVE';

export interface Organization {
  id: string;
  regNumber: string;
  name: string;
  legalEntityName: string;
  type: OrgType;
  province: string;
  district: string;
  municipality: string;
  ward: number;
  primaryContact: {
    name: string;
    designation: string;
    phone: string;
    email: string;
  };
  status: OrgStatus;
  registrationDate: string;
  approvedDate?: string;
  approvedBy?: string;
  storageCapacityCylinders: number;
  currentStockCylinders: number;
  activeDispatchesCount: number;
  complianceRating: number; // 0 - 100%
  fillingUnitModel?: string; // Integrated scale/carousels for bottling plants
  licenseExpiryDate: string;
  submittedDocuments: Array<{
    name: string;
    type: string;
    verified: boolean;
  }>;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'DISPATCH' | 'RECEIVING' | 'STOCK_AUDIT' | 'APPROVAL' | 'DISCREPANCY_FLAG' | 'SECURITY';
  actor: {
    name: string;
    role: string;
    org: string;
  };
  action: string;
  details: string;
  referenceId: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface AuditTrailEntry {
  id: string;
  sequenceNumber: number;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actionType: string;
  targetResource: string;
  previousState?: string;
  newState?: string;
  ipAddress: string;
  deviceFingerprint: string;
  tamperProofHash: string;
}

export interface NationalMetrics {
  bulkLpgReceivedMT: number;
  bulkLpgReceivedTrend: number; // percentage
  cylindersFilledCount: number;
  cylindersFilledTrend: number;
  cylindersDispatchedCount: number;
  cylindersDispatchedTrend: number;
  cylindersConfirmedReceivedCount: number;
  cylindersConfirmedReceivedTrend: number;
  retailerStockCount: number;
  retailerStockTrend: number;
  activeDiscrepanciesCount: number;
  discrepanciesTrend: number;
  registeredPlantsCount: number;
  authorizedDistributorsCount: number;
  activeRetailersCount: number;
  pendingApprovalsCount: number;
}

export interface ProvinceMetric {
  id: number;
  nameEn: string;
  nameNe: string;
  headquarters: string;
  monthlyQuotaMT: number;
  currentStockCylinders: number;
  dailyDispatchedCylinders: number;
  retailersCount: number;
  distributorsCount: number;
  bottlingPlantsCount: number;
  stockStatus: 'OPTIMAL' | 'MODERATE' | 'LOW_ALERT';
  discrepancyCount: number;
}
