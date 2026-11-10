import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { config } from '../config/index.js';

export const getPublicAvailability = (req, res) => {
  const { district, municipality, brand, status } = req.query;

  // Aggregate retail locations and published statuses
  let retailers = db.organizations
    .filter(o => o.org_type === 'LOCAL_RETAILER')
    .map(o => {
      const pub = db.publicAvailability.find(p => p.retailer_organization_id === o.id);
      return {
        id: o.id,
        name: o.trade_name,
        legalName: o.legal_name,
        district: o.district,
        municipality: o.municipality,
        ward: o.ward_number,
        address: o.address_line,
        status: pub?.availability_status || 'AVAILABLE',
        reportedStockRange: pub?.reported_stock_range || '> 30 units',
        verifiedPriceNpr: pub?.verified_retail_price_npr || config.gazettedDomesticPriceNpr,
        lastReportedAt: pub?.last_reported_at || o.created_at,
        isVerified: pub?.is_independently_verified || false,
      };
    });

  if (district && district !== 'ALL') {
    retailers = retailers.filter(r => r.district.toLowerCase() === district.toLowerCase());
  }
  if (municipality && municipality !== 'ALL') {
    retailers = retailers.filter(r => r.municipality.toLowerCase().includes(municipality.toLowerCase()));
  }

  return res.json({
    success: true,
    officialGazettedPriceNpr: config.gazettedDomesticPriceNpr,
    privacyNotice: 'Under Government of Nepal distribution guidelines, household-level cylinder purchases and identity records are strictly private and unmonitored.',
    count: retailers.length,
    retailers
  });
};

export const submitCitizenComplaint = (req, res) => {
  const {
    citizen_name,
    citizen_phone,
    target_business_name,
    complaint_type,
    incident_district,
    incident_municipality,
    incident_details
  } = req.body;

  // Enforce account/phone requirement as per business rules
  if (!citizen_phone || citizen_phone.trim().length < 8 || !incident_details || !target_business_name) {
    return res.status(400).json({
      success: false,
      message: 'Verified phone contact, retailer name, and factual explanation are mandatory for complaint submission under NOC consumer protection rules.'
    });
  }

  const ticketNumber = `CMP-2083-${Math.floor(1000 + Math.random() * 9000)}`;

  const complaint = {
    id: crypto.randomUUID(),
    ticket_number: ticketNumber,
    citizen_name: citizen_name || req.user?.full_name || 'Anonymous Consumer',
    citizen_phone: citizen_phone || req.user?.phone_number,
    target_business_name,
    complaint_type: complaint_type || 'OVERPRICING',
    incident_district: incident_district || 'Kathmandu',
    incident_municipality: incident_municipality || 'Central Ward',
    incident_details,
    status: 'SUBMITTED',
    created_at: new Date().toISOString()
  };

  db.complaints.unshift(complaint);

  // Audit
  db.appendAuditLog({
    actorId: req.user?.id || 'PUBLIC_CITIZEN_API',
    actorName: complaint.citizen_name,
    actorRole: 'PUBLIC_CITIZEN',
    actionType: 'CONSUMER_GRIEVANCE_REGISTERED',
    targetResource: `${ticketNumber} (${complaint_type} against ${target_business_name})`,
    newState: { status: 'SUBMITTED', district: incident_district }
  });

  return res.status(201).json({
    success: true,
    message: `Grievance registered under Reference Ticket #${ticketNumber}. Forwarded to NOC Consumer Protection & Quick Response Team (QRT).`,
    ticketNumber,
    complaint
  });
};

