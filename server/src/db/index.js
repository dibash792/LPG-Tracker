import crypto from 'node:crypto';
import { config } from '../config/index.js';

// In-Memory Relational Engine that adheres strictly to PostgreSQL schema
class RelationalDatabaseStore {
  constructor() {
    this.organizations = [];
    this.users = [];
    this.locations = [];
    this.cylinderCategories = [];
    this.bulkReceipts = [];
    this.fillingBatches = [];
    this.dispatches = [];
    this.dispatchItems = [];
    this.receiptConfirmations = [];
    this.receiptConfirmationItems = [];
    this.stockBalances = [];
    this.stockMovements = [];
    this.stockAdjustments = [];
    this.discrepancyCases = [];
    this.discrepancyComments = [];
    this.discrepancyEvidence = [];
    this.publicAvailability = [];
    this.complaints = [];
    this.complaintUpdates = [];
    this.auditLogs = [];
    this.systemSettings = [];
    
    this.currentAuditSeq = 104820;
    this.lastAuditHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    this.seedInitialData();
  }

  // Cryptographic HMAC Chaining for Audit Logs
  generateAuditHMAC(seq, timestamp, actor, action, target, prevState, newState) {
    const payload = `${seq}:${timestamp}:${actor}:${action}:${target}:${JSON.stringify(prevState)}:${JSON.stringify(newState)}:${this.lastAuditHash}`;
    const hmac = crypto.createHmac('sha256', config.jwtSecret);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    this.lastAuditHash = signature;
    return signature;
  }

  appendAuditLog({ actorId, actorName, actorRole, actionType, targetResource, previousState = null, newState = null, ipAddress = '103.10.232.14', userAgent = 'LPG-Tracker-GovEngine' }) {
    this.currentAuditSeq += 1;
    const timestamp = new Date().toISOString();
    const signature = this.generateAuditHMAC(
      this.currentAuditSeq,
      timestamp,
      actorId,
      actionType,
      targetResource,
      previousState,
      newState
    );

    const logEntry = {
      id: crypto.randomUUID(),
      sequence_number: this.currentAuditSeq,
      timestamp,
      actor_user_id: actorId,
      actor_name: actorName,
      actor_role: actorRole,
      action_type: actionType,
      target_resource: targetResource,
      previous_state: previousState,
      new_state: newState,
      ip_address: ipAddress,
      user_agent: userAgent,
      tamper_proof_hmac: signature,
    };

    this.auditLogs.unshift(logEntry);
    return logEntry;
  }

  seedInitialData() {
    // 1. Cylinder Categories
    this.cylinderCategories = [
      {
        id: 'DOMESTIC_14_2',
        name_en: 'Domestic 14.2 kg Subsidized Cylinder',
        name_ne: 'घरायसी १४.२ केजी अनुदानित सिलिन्डर',
        nominal_lpg_weight_kg: 14.20,
        tare_weight_min_kg: 14.50,
        tare_weight_max_kg: 16.80,
        standard_code: 'NS:533',
        official_subsidized_price_npr: 1895.00,
        is_active: true
      },
      {
        id: 'COMMERCIAL_19_0',
        name_en: 'Commercial 19.0 kg Cylinder',
        name_ne: 'व्यावसायिक १९.० केजी सिलिन्डर',
        nominal_lpg_weight_kg: 19.00,
        tare_weight_min_kg: 18.00,
        tare_weight_max_kg: 21.50,
        standard_code: 'NS:533',
        official_subsidized_price_npr: 2540.00,
        is_active: true
      },
      {
        id: 'COMPACT_5_0',
        name_en: 'Compact 5.0 kg Mountain Cylinder',
        name_ne: 'हिमाली ५.० केजी सिलिन्डर',
        nominal_lpg_weight_kg: 5.00,
        tare_weight_min_kg: 6.20,
        tare_weight_max_kg: 7.50,
        standard_code: 'NS:533',
        official_subsidized_price_npr: 680.00,
        is_active: true
      }
    ];

    // 2. Initial Users
    this.users = [
      {
        id: 'usr-noc-admin',
        email: 'chandan.adhikari@noc.org.np',
        phone_number: '9851012345',
        password_hash: '$2a$10$wK1n3F2qB9M.5YqG7N8Y0e9GZ4W3f6g1h8k0l2m4n6p8r0t2v4x6', // demo pass: Admin@123
        full_name: 'Dr. Chandan Adhikari',
        system_role: 'NOC_SUPER_ADMIN',
        is_active: true,
      },
      {
        id: 'usr-plant-nepal-gas',
        email: 'gm@nepalgas.com.np',
        phone_number: '9851123456',
        password_hash: '$2a$10$wK1n3F2qB9M.5YqG7N8Y0e9GZ4W3f6g1h8k0l2m4n6p8r0t2v4x6',
        full_name: 'Gokul Bhandari',
        system_role: 'PLANT_OPERATOR',
        is_active: true,
      },
      {
        id: 'usr-dist-patan',
        email: 'patantraders@wlink.com.np',
        phone_number: '9851234567',
        password_hash: '$2a$10$wK1n3F2qB9M.5YqG7N8Y0e9GZ4W3f6g1h8k0l2m4n6p8r0t2v4x6',
        full_name: 'Bishnu Prasad Maharjan',
        system_role: 'DISTRIBUTOR_MANAGER',
        is_active: true,
      },
      {
        id: 'usr-ret-baluwatar',
        email: 'rudrasen@gmail.com',
        phone_number: '9841887766',
        password_hash: '$2a$10$wK1n3F2qB9M.5YqG7N8Y0e9GZ4W3f6g1h8k0l2m4n6p8r0t2v4x6',
        full_name: 'Rudra Sen',
        system_role: 'RETAILER_OPERATOR',
        is_active: true,
      },
      {
        id: 'usr-citizen-bikash',
        email: 'bikash.thapa@gmail.com',
        phone_number: '9841998877',
        password_hash: '$2a$10$wK1n3F2qB9M.5YqG7N8Y0e9GZ4W3f6g1h8k0l2m4n6p8r0t2v4x6',
        full_name: 'Bikash Thapa',
        system_role: 'PUBLIC_CITIZEN',
        is_active: true,
      }
    ];

    // 3. Organizations
    this.organizations = [
      {
        id: 'org-noc-hq',
        reg_number: 'GOV-NOC-HQ-01',
        legal_name: 'Nepal Oil Corporation Limited',
        trade_name: 'NOC Central Babarmahal',
        org_type: 'NOC_CENTRAL',
        province_id: 3,
        district: 'Kathmandu',
        municipality: 'Kathmandu Metro',
        ward_number: 11,
        address_line: 'Babarmahal, Kathmandu',
        storage_capacity_cylinders: 500000,
        compliance_rating: 100.00,
        status: 'ACTIVE',
        license_expiry_date: '2035-12-31',
        created_at: '2020-01-01T00:00:00Z',
      },
      {
        id: 'org-bp-nepal-gas',
        reg_number: 'NOC/LPG/BP-2051/01',
        legal_name: 'Nepal Gas Udyog Private Limited',
        trade_name: 'Nepal Gas Udyog Ltd.',
        org_type: 'BOTTLING_PLANT',
        province_id: 3,
        district: 'Kathmandu',
        municipality: 'Kathmandu Metro',
        ward_number: 16,
        address_line: 'Balaju Industrial Area, Kathmandu',
        storage_capacity_cylinders: 45000,
        compliance_rating: 98.40,
        filling_unit_model: 'Siraga Automated Electronic Carousel (24-head)',
        status: 'ACTIVE',
        license_expiry_date: '2028-03-31',
        created_at: '2020-01-01T00:00:00Z',
      },
      {
        id: 'org-bp-everest-gas',
        reg_number: 'NOC/LPG/BP-2058/08',
        legal_name: 'Everest Gas Industries Pvt. Ltd.',
        trade_name: 'Everest Gas Industries',
        org_type: 'BOTTLING_PLANT',
        province_id: 2,
        district: 'Bara',
        municipality: 'Amlekhgunj Rural Municipality',
        ward_number: 2,
        address_line: 'Amlekhgunj Industrial Hub, Bara',
        storage_capacity_cylinders: 60000,
        compliance_rating: 96.20,
        filling_unit_model: 'Kosan Crisplant Automated Line (32-head)',
        status: 'ACTIVE',
        license_expiry_date: '2027-11-30',
        created_at: '2020-01-01T00:00:00Z',
      },
      {
        id: 'org-dist-patan',
        reg_number: 'NOC/LPG/DIST-1049',
        legal_name: 'Patan Traders Private Limited',
        trade_name: 'Patan Traders & Energy Suppliers',
        org_type: 'AUTHORIZED_DISTRIBUTOR',
        province_id: 3,
        district: 'Lalitpur',
        municipality: 'Lalitpur Metro',
        ward_number: 12,
        address_line: 'Lagankhel Bus Park Road, Lalitpur',
        storage_capacity_cylinders: 2500,
        compliance_rating: 89.20,
        status: 'ACTIVE',
        license_expiry_date: '2027-04-30',
        created_at: '2021-06-15T00:00:00Z',
      },
      {
        id: 'org-ret-baluwatar',
        reg_number: 'NOC/RET-7890',
        legal_name: 'Baluwatar Gas & Provision Store',
        trade_name: 'Baluwatar Gas Corner',
        org_type: 'LOCAL_RETAILER',
        province_id: 3,
        district: 'Kathmandu',
        municipality: 'Kathmandu Metro',
        ward_number: 4,
        address_line: 'Baluwatar Chowk, Kathmandu',
        storage_capacity_cylinders: 150,
        compliance_rating: 99.00,
        status: 'ACTIVE',
        license_expiry_date: '2027-01-15',
        created_at: '2022-03-20T00:00:00Z',
      },
      {
        id: 'org-pending-himalayan',
        reg_number: 'APP-REG-2083-994',
        legal_name: 'Himalayan Frontier Energy Pvt. Ltd.',
        trade_name: 'Himalayan Frontier Gas & Energy',
        org_type: 'BOTTLING_PLANT',
        province_id: 6,
        district: 'Surkhet',
        municipality: 'Birendranagar',
        ward_number: 11,
        address_line: 'Industrial Estate, Birendranagar',
        storage_capacity_cylinders: 20000,
        compliance_rating: 88.00,
        status: 'PENDING_APPROVAL',
        license_expiry_date: null,
        created_at: '2026-10-31T00:00:00Z',
      }
    ];

    // 4. Locations & Stock Balances
    this.locations = [
      { id: 'loc-plant-balaju', organization_id: 'org-bp-nepal-gas', name: 'Balaju Main Storage & Carousel Bay', location_type: 'BOTTLING_BAY', capacity_cylinders: 45000 },
      { id: 'loc-dist-patan', organization_id: 'org-dist-patan', name: 'Lagankhel Wholesale Warehouse', location_type: 'WHOLESALE_WAREHOUSE', capacity_cylinders: 2500 },
      { id: 'loc-ret-baluwatar', organization_id: 'org-ret-baluwatar', name: 'Baluwatar Retail Shop', location_type: 'RETAIL_SHOP', capacity_cylinders: 150 },
    ];

    this.stockBalances = [
      { id: 'sb-1', location_id: 'loc-plant-balaju', cylinder_category_id: 'DOMESTIC_14_2', current_filled_quantity: 31200, current_empty_quantity: 8400, in_transit_inbound_quantity: 0 },
      { id: 'sb-2', location_id: 'loc-dist-patan', cylinder_category_id: 'DOMESTIC_14_2', current_filled_quantity: 840, current_empty_quantity: 420, in_transit_inbound_quantity: 450 },
      { id: 'sb-3', location_id: 'loc-ret-baluwatar', cylinder_category_id: 'DOMESTIC_14_2', current_filled_quantity: 42, current_empty_quantity: 35, in_transit_inbound_quantity: 80 },
    ];

    // 5. Initial Dispatches & Discrepancies
    this.dispatches = [
      {
        id: 'dsp-001',
        dispatch_code: 'CNS-BG-94021',
        sender_organization_id: 'org-bp-nepal-gas',
        receiver_organization_id: 'org-dist-patan',
        sender_location_id: 'loc-plant-balaju',
        receiver_location_id: 'loc-dist-patan',
        dispatched_at: '2026-11-09T08:30:00Z',
        vehicle_registration_number: 'BA 2 KHA 7104',
        driver_name: 'Prem Bahadur Tamang',
        driver_phone: '9841556677',
        tamper_seal_barcode: 'SEAL-NP-88490',
        authorized_by_user_id: 'usr-plant-nepal-gas',
        dispatch_status: 'DELIVERED_DISCREPANCY',
        qr_verification_code: 'QR-NOC-CNS-BG-94021-VERIFIED',
        total_quantity: 450,
      }
    ];

    this.discrepancyCases = [
      {
        id: 'disc-001',
        case_number: 'DISC-2083-00891',
        dispatch_id: 'dsp-001',
        source_organization_id: 'org-bp-nepal-gas',
        destination_organization_id: 'org-dist-patan',
        expected_quantity: 450,
        received_quantity: 438,
        variance_quantity: -12,
        severity: 'HIGH',
        investigation_status: 'UNDER_INVESTIGATION',
        assigned_officer_user_id: 'usr-noc-admin',
        unmatched_serials: ['NP-GAS-78401', 'NP-GAS-78409', 'NP-GAS-78440', 'NP-GAS-78442', 'NP-GAS-78455', 'NP-GAS-78490'],
        initial_remarks: 'Delivery truck arrived with transit seal loose at Lagankhel receiving bay. 12 cylinders missing from gate pass.',
        created_at: '2026-11-09T14:15:00Z',
      }
    ];

    // 6. Public Availability
    this.publicAvailability = [
      {
        id: 'pa-1',
        retailer_organization_id: 'org-ret-baluwatar',
        location_id: 'loc-ret-baluwatar',
        cylinder_category_id: 'DOMESTIC_14_2',
        availability_status: 'AVAILABLE',
        reported_stock_range: '> 30 units',
        verified_retail_price_npr: 1895.00,
        is_independently_verified: true,
        last_reported_at: new Date().toISOString()
      }
    ];

    // Initial audit log
    this.appendAuditLog({
      actorId: 'usr-noc-admin',
      actorName: 'Dr. Chandan Adhikari',
      actorRole: 'NOC_SUPER_ADMIN',
      actionType: 'SYSTEM_GENESIS_INITIALIZATION',
      targetResource: 'NOC_NATIONAL_LPG_GRID',
      newState: { status: 'ONLINE', nodes: 28, mode: 'GOVERNMENT_TRANSPARENCY' }
    });
  }
}

export const db = new RelationalDatabaseStore();

