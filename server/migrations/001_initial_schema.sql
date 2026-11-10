-- ============================================================================
-- LPG TRACKER NEPAL — NATIONAL CUSTODY MONITORING PLATFORM
-- PostgreSQL Migration: 001_initial_schema.sql
-- Covers all 26 domain entities with UUIDv4 keys, foreign keys, and indexes.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ORGANIZATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_number VARCHAR(100) UNIQUE NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    org_type VARCHAR(50) NOT NULL CHECK (org_type IN ('NOC_CENTRAL', 'NOC_DEPOT', 'BOTTLING_PLANT', 'AUTHORIZED_DISTRIBUTOR', 'LOCAL_RETAILER')),
    province_id INT NOT NULL CHECK (province_id BETWEEN 1 AND 7),
    district VARCHAR(100) NOT NULL,
    municipality VARCHAR(150) NOT NULL,
    ward_number INT NOT NULL,
    address_line TEXT,
    storage_capacity_cylinders INT NOT NULL DEFAULT 0,
    compliance_rating NUMERIC(5,2) DEFAULT 100.00,
    filling_unit_model VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'INACTIVE')),
    license_expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_province ON organizations(province_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- ----------------------------------------------------------------------------
-- 2. USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    system_role VARCHAR(50) NOT NULL CHECK (system_role IN ('NOC_SUPER_ADMIN', 'NOC_INSPECTOR', 'PLANT_OPERATOR', 'DISTRIBUTOR_MANAGER', 'RETAILER_OPERATOR', 'PUBLIC_CITIZEN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(system_role);

-- ----------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERSHIPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_role VARCHAR(50) NOT NULL,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 4. ORGANIZATION DOCUMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by_user_id UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ORGANIZATION APPROVALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reviewed_by_user_id UUID NOT NULL REFERENCES users(id),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'SUSPENDED', 'REINSTATED')),
    formal_reason TEXT NOT NULL,
    statutory_reference VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. LOCATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    location_type VARCHAR(50) NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    capacity_cylinders INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. CYLINDER CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cylinder_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    nominal_lpg_weight_kg NUMERIC(5,2) NOT NULL,
    tare_weight_min_kg NUMERIC(5,2) NOT NULL,
    tare_weight_max_kg NUMERIC(5,2) NOT NULL,
    standard_code VARCHAR(50) DEFAULT 'NS:533',
    official_subsidized_price_npr NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 8. BULK RECEIPTS (NOC -> Plant)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bulk_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_reference VARCHAR(100) UNIQUE NOT NULL,
    bottling_plant_id UUID NOT NULL REFERENCES organizations(id),
    supplier_name VARCHAR(200) NOT NULL,
    customs_entry_point VARCHAR(100) NOT NULL,
    bullet_tanker_number VARCHAR(50) NOT NULL,
    challan_number VARCHAR(100) NOT NULL,
    gross_mass_mt NUMERIC(10,3) NOT NULL,
    tare_mass_mt NUMERIC(10,3) NOT NULL,
    net_lpg_received_mt NUMERIC(10,3) NOT NULL,
    decanted_at TIMESTAMPTZ NOT NULL,
    recorded_by_user_id UUID NOT NULL REFERENCES users(id),
    verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. FILLING BATCHES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS filling_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    bottling_plant_id UUID NOT NULL REFERENCES organizations(id),
    cylinder_category_id VARCHAR(50) NOT NULL REFERENCES cylinder_categories(id),
    shift_date DATE NOT NULL,
    shift_type VARCHAR(20) NOT NULL CHECK (shift_type IN ('DAY', 'NIGHT')),
    cylinders_filled_count INT NOT NULL,
    cylinders_defective_count INT NOT NULL DEFAULT 0,
    bulk_lpg_consumed_mt NUMERIC(10,3) NOT NULL,
    integrated_carousel_id VARCHAR(100),
    supervisor_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. INTEGRATION IMPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bottling_plant_id UUID NOT NULL REFERENCES organizations(id),
    source_system VARCHAR(100) NOT NULL,
    import_reference VARCHAR(200) NOT NULL,
    records_count INT NOT NULL,
    successful_count INT NOT NULL,
    failed_count INT NOT NULL DEFAULT 0,
    raw_payload_json JSONB,
    imported_by_user_id UUID NOT NULL REFERENCES users(id),
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. DISPATCHES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_code VARCHAR(100) UNIQUE NOT NULL,
    sender_organization_id UUID NOT NULL REFERENCES organizations(id),
    receiver_organization_id UUID NOT NULL REFERENCES organizations(id),
    sender_location_id UUID NOT NULL REFERENCES locations(id),
    receiver_location_id UUID NOT NULL REFERENCES locations(id),
    dispatched_at TIMESTAMPTZ NOT NULL,
    vehicle_registration_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(50) NOT NULL,
    tamper_seal_barcode VARCHAR(100) NOT NULL,
    authorized_by_user_id UUID NOT NULL REFERENCES users(id),
    dispatch_status VARCHAR(50) NOT NULL DEFAULT 'IN_TRANSIT' CHECK (dispatch_status IN ('IN_TRANSIT', 'DELIVERED_CONFIRMED', 'DELIVERED_DISCREPANCY', 'CANCELLED')),
    qr_verification_code VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispatches_sender ON dispatches(sender_organization_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_receiver ON dispatches(receiver_organization_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON dispatches(dispatch_status);

-- ----------------------------------------------------------------------------
-- 12. DISPATCH ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dispatch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    cylinder_category_id VARCHAR(50) NOT NULL REFERENCES cylinder_categories(id),
    dispatched_quantity INT NOT NULL CHECK (dispatched_quantity > 0),
    scanned_cylinder_serials TEXT[],
    CONSTRAINT uq_dispatch_category UNIQUE (dispatch_id, cylinder_category_id)
);

-- ----------------------------------------------------------------------------
-- 13. RECEIPT CONFIRMATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receipt_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id),
    confirmed_by_user_id UUID NOT NULL REFERENCES users(id),
    receiving_organization_id UUID NOT NULL REFERENCES organizations(id),
    received_at TIMESTAMPTZ NOT NULL,
    tamper_seal_intact BOOLEAN NOT NULL DEFAULT TRUE,
    total_dispatched_quantity INT NOT NULL,
    total_received_quantity INT NOT NULL,
    total_variance_quantity INT NOT NULL,
    receiver_remarks TEXT,
    confirmation_status VARCHAR(50) NOT NULL CHECK (confirmation_status IN ('ACCEPTED_MATCH', 'ACCEPTED_WITH_VARIANCE', 'REJECTED_DAMAGED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipt_dispatch ON receipt_confirmations(dispatch_id);

-- ----------------------------------------------------------------------------
-- 14. RECEIPT CONFIRMATION ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receipt_confirmation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_confirmation_id UUID NOT NULL REFERENCES receipt_confirmations(id) ON DELETE CASCADE,
    cylinder_category_id VARCHAR(50) NOT NULL REFERENCES cylinder_categories(id),
    dispatched_quantity INT NOT NULL,
    received_quantity INT NOT NULL,
    variance_quantity INT NOT NULL,
    unmatched_serials TEXT[]
);

-- ----------------------------------------------------------------------------
-- 15. STOCK BALANCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    cylinder_category_id VARCHAR(50) NOT NULL REFERENCES cylinder_categories(id),
    current_filled_quantity INT NOT NULL DEFAULT 0 CHECK (current_filled_quantity >= 0),
    current_empty_quantity INT NOT NULL DEFAULT 0 CHECK (current_empty_quantity >= 0),
    in_transit_inbound_quantity INT NOT NULL DEFAULT 0 CHECK (in_transit_inbound_quantity >= 0),
    last_movement_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_stock_location_cat UNIQUE (location_id, cylinder_category_id)
);

-- ----------------------------------------------------------------------------
-- 16. STOCK MOVEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id),
    cylinder_category_id VARCHAR(50) NOT NULL REFERENCES cylinder_categories(id),
    movement_type VARCHAR(50) NOT NULL,
    quantity_delta INT NOT NULL,
    balance_after INT NOT NULL,
    reference_table VARCHAR(50) NOT NULL,
    reference_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 17. STOCK ADJUSTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id),
    cylinder_category_id VARCHAR(50) NOT NULL REFERENCES cylinder_categories(id),
    previous_quantity INT NOT NULL,
    adjusted_quantity INT NOT NULL,
    difference_quantity INT NOT NULL,
    mandatory_reason TEXT NOT NULL,
    authorized_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 18. DISCREPANCY CASES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discrepancy_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(100) UNIQUE NOT NULL,
    dispatch_id UUID NOT NULL REFERENCES dispatches(id),
    receipt_confirmation_id UUID NOT NULL REFERENCES receipt_confirmations(id),
    source_organization_id UUID NOT NULL REFERENCES organizations(id),
    destination_organization_id UUID NOT NULL REFERENCES organizations(id),
    expected_quantity INT NOT NULL,
    received_quantity INT NOT NULL,
    variance_quantity INT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    investigation_status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (investigation_status IN ('OPEN', 'AWAITING_EXPLANATION', 'UNDER_REVIEW', 'EVIDENCE_REQUESTED', 'TECHNICAL_VARIANCE', 'SUSPECTED_DIVERSION', 'CONFIRMED_FRAUD', 'RESOLVED', 'CLOSED_WITHOUT_FINDING')),
    assigned_officer_user_id UUID REFERENCES users(id),
    resolution_summary TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discrepancies_status ON discrepancy_cases(investigation_status);
CREATE INDEX IF NOT EXISTS idx_discrepancies_severity ON discrepancy_cases(severity);

-- ----------------------------------------------------------------------------
-- 19. DISCREPANCY EVIDENCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discrepancy_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discrepancy_case_id UUID NOT NULL REFERENCES discrepancy_cases(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
    evidence_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 20. DISCREPANCY COMMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discrepancy_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discrepancy_case_id UUID NOT NULL REFERENCES discrepancy_cases(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    status_change VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 21. PUBLIC AVAILABILITY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    cylinder_category_id VARCHAR(50) NOT NULL REFERENCES cylinder_categories(id),
    availability_status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'LIMITED_STOCK', 'OUT_OF_STOCK', 'AWAITING_DELIVERY')),
    reported_stock_range VARCHAR(50),
    verified_retail_price_npr NUMERIC(10,2) NOT NULL,
    is_independently_verified BOOLEAN DEFAULT FALSE,
    last_reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_public_loc_cat UNIQUE (location_id, cylinder_category_id)
);

CREATE INDEX IF NOT EXISTS idx_public_status ON public_availability(availability_status);

-- ----------------------------------------------------------------------------
-- 22. COMPLAINTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    citizen_user_id UUID NOT NULL REFERENCES users(id),
    target_organization_id UUID REFERENCES organizations(id),
    target_business_name VARCHAR(200) NOT NULL,
    complaint_type VARCHAR(100) NOT NULL,
    incident_district VARCHAR(100) NOT NULL,
    incident_municipality VARCHAR(100) NOT NULL,
    incident_details TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ACKNOWLEDGED', 'UNDER_FIELD_INSPECTION', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 23. COMPLAINT UPDATES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    updated_by_user_id UUID NOT NULL REFERENCES users(id),
    update_text TEXT NOT NULL,
    new_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 24. AUDIT LOGS (Immutable Cryptographic Chained Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_number BIGSERIAL UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_user_id UUID NOT NULL REFERENCES users(id),
    actor_name VARCHAR(200) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_resource VARCHAR(200) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(100) NOT NULL,
    user_agent TEXT,
    tamper_proof_hmac VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_seq ON audit_logs(sequence_number);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id);

-- ----------------------------------------------------------------------------
-- 25. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CRITICAL', 'WARNING', 'SUCCESS', 'INFO')),
    reference_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(recipient_user_id, is_read);

-- ----------------------------------------------------------------------------
-- 26. SYSTEM SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    last_modified_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

