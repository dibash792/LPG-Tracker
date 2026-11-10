# Database Design Specification — LPG Tracker Nepal
## Relational Schema for PostgreSQL

**Document Ref:** `docs/database-design.md`  
**Database Engine:** PostgreSQL 15+ / 16+  
**Naming Convention:** `snake_case` for tables and columns  
**Primary Keys:** `UUIDv4` (`gen_random_uuid()`) for public-facing domain entities; sequential `BIGSERIAL` for high-throughput immutable audit event indexing.

---

## 1. Schema Design Philosophy

1. **Transaction Safety**: Financial and physical custody transfers must be transaction-safe (`BEGIN ... COMMIT`). Stock balances must never be recalculated concurrently without `SELECT ... FOR UPDATE` row-level locks.
2. **Double-Entry Physical Custody Ledger**: Every dispatch and receiving confirmation creates corresponding `stock_movements` (Debit origin location, Credit destination location).
3. **No In-Place Overwriting of Cross-Entity Records**: A receiving distributor or retailer cannot overwrite or delete a dispatch created by a plant. Variance is tracked as a distinct differential entity (`discrepancy_cases`).
4. **Append-Only Tamper-Evident Audit Logging**: System actions generate immutable audit log records with SHA-256 HMAC cryptographic signatures.

---

## 2. Table Specifications (26 Core Entities)

### 2.1 Organizations & Identity

#### `organizations`
Stores legal business entities (NOC Depots, Bottling Plants, Distributors, Retailers).
- `id` (UUID, PK)
- `reg_number` (VARCHAR(100), UNIQUE, NOT NULL) — e.g. `NOC/LPG/BP-2051/01`
- `legal_name` (VARCHAR(255), NOT NULL)
- `trade_name` (VARCHAR(255), NOT NULL)
- `org_type` (VARCHAR(50), NOT NULL) — `NOC_CENTRAL`, `NOC_DEPOT`, `BOTTLING_PLANT`, `AUTHORIZED_DISTRIBUTOR`, `LOCAL_RETAILER`
- `province_id` (INT, NOT NULL) — 1 to 7
- `district` (VARCHAR(100), NOT NULL)
- `municipality` (VARCHAR(150), NOT NULL)
- `ward_number` (INT, NOT NULL)
- `address_line` (TEXT)
- `storage_capacity_cylinders` (INT NOT NULL DEFAULT 0)
- `compliance_rating` (NUMERIC(5,2) DEFAULT 100.00)
- `filling_unit_model` (VARCHAR(255)) — for bottling plants
- `status` (VARCHAR(50), NOT NULL DEFAULT 'PENDING_APPROVAL') — `PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`, `INACTIVE`
- `license_expiry_date` (DATE)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())

#### `users`
Authenticated personnel across NOC, Plants, Distributors, Retailers, and registered citizens.
- `id` (UUID, PK)
- `email` (VARCHAR(255), UNIQUE)
- `phone_number` (VARCHAR(50), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(200), NOT NULL)
- `system_role` (VARCHAR(50), NOT NULL) — `NOC_SUPER_ADMIN`, `NOC_INSPECTOR`, `PLANT_OPERATOR`, `DISTRIBUTOR_MANAGER`, `RETAILER_OPERATOR`, `PUBLIC_CITIZEN`
- `is_active` (BOOLEAN NOT NULL DEFAULT TRUE)
- `phone_verified_at` (TIMESTAMPTZ)
- `last_login_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())

#### `organization_memberships`
Binds users to specific organizations with granular role permissions.
- `id` (UUID, PK)
- `organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `org_role` (VARCHAR(50), NOT NULL) — `MANAGING_DIRECTOR`, `DISPATCH_OFFICER`, `INVENTORY_CONTROLLER`, `RECEIVING_OFFICER`
- `is_primary_contact` (BOOLEAN DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())
- CONSTRAINT: `UNIQUE(organization_id, user_id)`

#### `organization_documents`
Statutory compliance files (OCR Incorporation, Mines & Geology, Explosive certificates).
- `id` (UUID, PK)
- `organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `document_type` (VARCHAR(100), NOT NULL) — `OCR_CERTIFICATE`, `EIA_ENVIRONMENTAL`, `EXPLOSIVE_CLEARANCE`, `BANK_GUARANTEE`, `TAX_CLEARANCE`
- `file_url` (VARCHAR(500), NOT NULL)
- `file_hash` (VARCHAR(64), NOT NULL) — SHA-256
- `is_verified` (BOOLEAN DEFAULT FALSE)
- `verified_by_user_id` (UUID, FK -> users.id)
- `verified_at` (TIMESTAMPTZ)

#### `organization_approvals`
Audit trail of Super Admin licensing decisions.
- `id` (UUID, PK)
- `organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `reviewed_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `decision` (VARCHAR(50), NOT NULL) — `APPROVED`, `REJECTED`, `SUSPENDED`, `REINSTATED`
- `formal_reason` (TEXT NOT NULL)
- `statutory_reference` (VARCHAR(150))
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

---

### 2.2 Physical Infrastructure & Products

#### `locations`
Physical geographic warehouses, tank farms, loading bays, or retail stores.
- `id` (UUID, PK)
- `organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `name` (VARCHAR(200), NOT NULL)
- `location_type` (VARCHAR(50), NOT NULL) — `CENTRAL_DEPOT`, `BOTTLING_BAY`, `WHOLESALE_WAREHOUSE`, `RETAIL_SHOP`
- `latitude` (NUMERIC(10,7))
- `longitude` (NUMERIC(10,7))
- `geofence_radius_meters` (INT DEFAULT 100)
- `capacity_cylinders` (INT NOT NULL DEFAULT 0)
- `is_active` (BOOLEAN DEFAULT TRUE)

#### `cylinder_categories`
Nominal cylinder sizes and specifications.
- `id` (VARCHAR(50), PK) — e.g. `DOMESTIC_14_2`, `COMMERCIAL_19_0`, `COMPACT_5_0`
- `name_en` (VARCHAR(100), NOT NULL)
- `name_ne` (VARCHAR(100), NOT NULL)
- `nominal_lpg_weight_kg` (NUMERIC(5,2), NOT NULL) — 14.20, 19.00, 5.00
- `tare_weight_min_kg` (NUMERIC(5,2), NOT NULL) — ~14.50 kg
- `tare_weight_max_kg` (NUMERIC(5,2), NOT NULL) — ~16.80 kg
- `standard_code` (VARCHAR(50) DEFAULT 'NS:533')
- `official_subsidized_price_npr` (NUMERIC(10,2), NOT NULL) — e.g. 1895.00
- `is_active` (BOOLEAN DEFAULT TRUE)

---

### 2.3 Bulk Receipts & Production

#### `bulk_receipts`
Bulk cryogenic LPG decanted at bottling plants.
- `id` (UUID, PK)
- `receipt_reference` (VARCHAR(100), UNIQUE, NOT NULL)
- `bottling_plant_id` (UUID, FK -> organizations.id, NOT NULL)
- `supplier_name` (VARCHAR(200), NOT NULL) — e.g. `Indian Oil Corp (Barauni)`
- `customs_entry_point` (VARCHAR(100), NOT NULL) — `Raxaul`, `Siliguri`, `Sunauli`
- `bullet_tanker_number` (VARCHAR(50), NOT NULL)
- `challan_number` (VARCHAR(100), NOT NULL)
- `gross_mass_mt` (NUMERIC(10,3), NOT NULL)
- `tare_mass_mt` (NUMERIC(10,3), NOT NULL)
- `net_lpg_received_mt` (NUMERIC(10,3), NOT NULL)
- `decanted_at` (TIMESTAMPTZ NOT NULL)
- `recorded_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `verification_status` (VARCHAR(50) DEFAULT 'VERIFIED')

#### `filling_batches`
Plant operational carousel filling runs.
- `id` (UUID, PK)
- `batch_number` (VARCHAR(100), UNIQUE, NOT NULL)
- `bottling_plant_id` (UUID, FK -> organizations.id, NOT NULL)
- `cylinder_category_id` (VARCHAR(50), FK -> cylinder_categories.id, NOT NULL)
- `shift_date` (DATE NOT NULL)
- `shift_type` (VARCHAR(20) NOT NULL) — `DAY`, `NIGHT`
- `cylinders_filled_count` (INT NOT NULL)
- `cylinders_defective_count` (INT NOT NULL DEFAULT 0)
- `bulk_lpg_consumed_mt` (NUMERIC(10,3), NOT NULL)
- `integrated_carousel_id` (VARCHAR(100))
- `supervisor_user_id` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `integration_imports`
Raw automated imports from plant SCADA or filling carousel exports.
- `id` (UUID, PK)
- `bottling_plant_id` (UUID, FK -> organizations.id, NOT NULL)
- `source_system` (VARCHAR(100), NOT NULL) — `KOSAN_CRISPLANT`, `SIRAGA_SCADA`, `CSV_MANUAL_FALLBACK`
- `import_reference` (VARCHAR(200), NOT NULL)
- `records_count` (INT NOT NULL)
- `successful_count` (INT NOT NULL)
- `failed_count` (INT NOT NULL DEFAULT 0)
- `raw_payload_json` (JSONB)
- `imported_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `imported_at` (TIMESTAMPTZ DEFAULT NOW())

---

### 2.4 Custody Transfers: Dispatches & Receiving

#### `dispatches`
Outbound consignments created by sending organization.
- `id` (UUID, PK)
- `dispatch_code` (VARCHAR(100), UNIQUE, NOT NULL) — e.g. `DSP-2083-09412`
- `sender_organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `receiver_organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `sender_location_id` (UUID, FK -> locations.id, NOT NULL)
- `receiver_location_id` (UUID, FK -> locations.id, NOT NULL)
- `dispatched_at` (TIMESTAMPTZ NOT NULL)
- `vehicle_registration_number` (VARCHAR(50), NOT NULL) — e.g. `BA 2 KHA 7104`
- `driver_name` (VARCHAR(150), NOT NULL)
- `driver_phone` (VARCHAR(50), NOT NULL)
- `tamper_seal_barcode` (VARCHAR(100), NOT NULL)
- `authorized_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `dispatch_status` (VARCHAR(50), NOT NULL DEFAULT 'IN_TRANSIT') — `IN_TRANSIT`, `DELIVERED_CONFIRMED`, `DELIVERED_DISCREPANCY`, `CANCELLED`
- `qr_verification_code` (VARCHAR(255), UNIQUE, NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `dispatch_items`
Quantities dispatched by cylinder category.
- `id` (UUID, PK)
- `dispatch_id` (UUID, FK -> dispatches.id, NOT NULL)
- `cylinder_category_id` (VARCHAR(50), FK -> cylinder_categories.id, NOT NULL)
- `dispatched_quantity` (INT NOT NULL)
- `scanned_cylinder_serials` (TEXT[]) — optional batch serial/RFID tags
- CONSTRAINT: `UNIQUE(dispatch_id, cylinder_category_id)`

#### `receipt_confirmations`
Receiving organization's independent confirmation.
- `id` (UUID, PK)
- `dispatch_id` (UUID, FK -> dispatches.id, NOT NULL)
- `confirmed_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `receiving_organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `received_at` (TIMESTAMPTZ NOT NULL)
- `tamper_seal_intact` (BOOLEAN NOT NULL DEFAULT TRUE)
- `total_dispatched_quantity` (INT NOT NULL)
- `total_received_quantity` (INT NOT NULL)
- `total_variance_quantity` (INT NOT NULL) — Received - Dispatched
- `receiver_remarks` (TEXT)
- `confirmation_status` (VARCHAR(50), NOT NULL) — `ACCEPTED_MATCH`, `ACCEPTED_WITH_VARIANCE`, `REJECTED_DAMAGED`
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `receipt_confirmation_items`
Per-category received quantities.
- `id` (UUID, PK)
- `receipt_confirmation_id` (UUID, FK -> receipt_confirmations.id, NOT NULL)
- `cylinder_category_id` (VARCHAR(50), FK -> cylinder_categories.id, NOT NULL)
- `dispatched_quantity` (INT NOT NULL)
- `received_quantity` (INT NOT NULL)
- `variance_quantity` (INT NOT NULL)
- `unmatched_serials` (TEXT[])

---

### 2.5 Stock Management

#### `stock_balances`
Source-of-truth current stock per location and cylinder category.
- `id` (UUID, PK)
- `location_id` (UUID, FK -> locations.id, NOT NULL)
- `cylinder_category_id` (VARCHAR(50), FK -> cylinder_categories.id, NOT NULL)
- `current_filled_quantity` (INT NOT NULL DEFAULT 0)
- `current_empty_quantity` (INT NOT NULL DEFAULT 0)
- `in_transit_inbound_quantity` (INT NOT NULL DEFAULT 0)
- `last_movement_at` (TIMESTAMPTZ DEFAULT NOW())
- CONSTRAINT: `UNIQUE(location_id, cylinder_category_id)`

#### `stock_movements`
Double-entry ledger logging every addition, subtraction, or transfer.
- `id` (UUID, PK)
- `location_id` (UUID, FK -> locations.id, NOT NULL)
- `cylinder_category_id` (VARCHAR(50), FK -> cylinder_categories.id, NOT NULL)
- `movement_type` (VARCHAR(50), NOT NULL) — `DISPATCH_OUT`, `RECEIPT_IN`, `FILLING_ADDITION`, `PHYSICAL_AUDIT_ADJUSTMENT`
- `quantity_delta` (INT NOT NULL) — signed integer (+ or -)
- `balance_after` (INT NOT NULL)
- `reference_table` (VARCHAR(50), NOT NULL) — `dispatches`, `receipt_confirmations`, `stock_adjustments`
- `reference_id` (UUID, NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `stock_adjustments`
Authorized physical count corrections.
- `id` (UUID, PK)
- `location_id` (UUID, FK -> locations.id, NOT NULL)
- `cylinder_category_id` (VARCHAR(50), FK -> cylinder_categories.id, NOT NULL)
- `previous_quantity` (INT NOT NULL)
- `adjusted_quantity` (INT NOT NULL)
- `difference_quantity` (INT NOT NULL)
- `mandatory_reason` (TEXT NOT NULL)
- `authorized_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

---

### 2.6 Reconciliation & Investigations

#### `discrepancy_cases`
Triggered automatically whenever receiving variance != 0.
- `id` (UUID, PK)
- `case_number` (VARCHAR(100), UNIQUE, NOT NULL) — e.g. `DISC-2083-00891`
- `dispatch_id` (UUID, FK -> dispatches.id, NOT NULL)
- `receipt_confirmation_id` (UUID, FK -> receipt_confirmations.id, NOT NULL)
- `source_organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `destination_organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `expected_quantity` (INT NOT NULL)
- `received_quantity` (INT NOT NULL)
- `variance_quantity` (INT NOT NULL)
- `severity` (VARCHAR(20), NOT NULL) — `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `investigation_status` (VARCHAR(50), NOT NULL DEFAULT 'OPEN') — `OPEN`, `AWAITING_EXPLANATION`, `UNDER_REVIEW`, `EVIDENCE_REQUESTED`, `TECHNICAL_VARIANCE`, `SUSPECTED_DIVERSION`, `CONFIRMED_FRAUD`, `RESOLVED`, `CLOSED_WITHOUT_FINDING`
- `assigned_officer_user_id` (UUID, FK -> users.id)
- `resolution_summary` (TEXT)
- `resolved_at` (TIMESTAMPTZ)
- `resolved_by_user_id` (UUID, FK -> users.id)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ DEFAULT NOW())

#### `discrepancy_evidence`
Waybills, weighbridge tickets, photos of damaged seals.
- `id` (UUID, PK)
- `discrepancy_case_id` (UUID, FK -> discrepancy_cases.id, NOT NULL)
- `uploaded_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `evidence_type` (VARCHAR(100), NOT NULL) — `WAYBILL_IMAGE`, `WEIGHBRIDGE_SLIP`, `DAMAGE_PHOTO`, `GPS_ROUTE_LOG`
- `file_url` (VARCHAR(500), NOT NULL)
- `description` (TEXT)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `discrepancy_comments`
Chronological discussion between Plant, Distributor, and NOC Inspector.
- `id` (UUID, PK)
- `discrepancy_case_id` (UUID, FK -> discrepancy_cases.id, NOT NULL)
- `author_user_id` (UUID, FK -> users.id, NOT NULL)
- `comment_text` (TEXT NOT NULL)
- `status_change` (VARCHAR(50))
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

---

### 2.7 Public Services & Accountability

#### `public_availability`
Published availability visible to citizens without citizen tracking.
- `id` (UUID, PK)
- `retailer_organization_id` (UUID, FK -> organizations.id, NOT NULL)
- `location_id` (UUID, FK -> locations.id, NOT NULL)
- `cylinder_category_id` (VARCHAR(50), FK -> cylinder_categories.id, NOT NULL)
- `availability_status` (VARCHAR(50), NOT NULL DEFAULT 'AVAILABLE') — `AVAILABLE`, `LIMITED_STOCK`, `OUT_OF_STOCK`, `AWAITING_DELIVERY`
- `reported_stock_range` (VARCHAR(50)) — e.g. `> 30 units`, `10-30 units`, `< 10 units`
- `verified_retail_price_npr` (NUMERIC(10,2) NOT NULL)
- `is_independently_verified` (BOOLEAN DEFAULT FALSE)
- `last_reported_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- CONSTRAINT: `UNIQUE(location_id, cylinder_category_id)`

#### `complaints`
Citizen complaints regarding overpricing or artificial hoarding.
- `id` (UUID, PK)
- `ticket_number` (VARCHAR(100), UNIQUE, NOT NULL) — e.g. `CMP-2083-9941`
- `citizen_user_id` (UUID, FK -> users.id, NOT NULL)
- `target_organization_id` (UUID, FK -> organizations.id)
- `target_business_name` (VARCHAR(200), NOT NULL)
- `complaint_type` (VARCHAR(100), NOT NULL) — `OVERPRICING`, `ARTIFICIAL_HOARDING`, `VALVE_LEAK_DEFECT`, `REFUSAL_TO_SELL`
- `incident_district` (VARCHAR(100), NOT NULL)
- `incident_municipality` (VARCHAR(100), NOT NULL)
- `incident_details` (TEXT NOT NULL)
- `status` (VARCHAR(50), NOT NULL DEFAULT 'SUBMITTED') — `SUBMITTED`, `ACKNOWLEDGED`, `UNDER_FIELD_INSPECTION`, `RESOLVED`, `DISMISSED`
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `complaint_updates`
Updates communicated back to the citizen.
- `id` (UUID, PK)
- `complaint_id` (UUID, FK -> complaints.id, NOT NULL)
- `updated_by_user_id` (UUID, FK -> users.id, NOT NULL)
- `update_text` (TEXT NOT NULL)
- `new_status` (VARCHAR(50))
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

---

### 2.8 Audit & System Governance

#### `audit_logs`
Immutable sequential administrative event log.
- `id` (UUID, PK)
- `sequence_number` (BIGSERIAL UNIQUE NOT NULL)
- `timestamp` (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- `actor_user_id` (UUID, FK -> users.id, NOT NULL)
- `actor_name` (VARCHAR(200), NOT NULL)
- `actor_role` (VARCHAR(50), NOT NULL)
- `action_type` (VARCHAR(100), NOT NULL) — `ORG_APPROVE`, `QUOTA_REALLOCATE`, `DISPATCH_CREATE`, `DISCREPANCY_RULE`, `STOCK_ADJUST`
- `target_resource` (VARCHAR(200), NOT NULL)
- `previous_state` (JSONB)
- `new_state` (JSONB)
- `ip_address` (VARCHAR(100), NOT NULL)
- `user_agent` (TEXT)
- `tamper_proof_hmac` (VARCHAR(64), NOT NULL) — SHA-256 HMAC chained to previous sequence

#### `notifications`
System alerts dispatched to users.
- `id` (UUID, PK)
- `recipient_user_id` (UUID, FK -> users.id, NOT NULL)
- `title` (VARCHAR(255), NOT NULL)
- `message` (TEXT NOT NULL)
- `type` (VARCHAR(50), NOT NULL) — `CRITICAL`, `WARNING`, `SUCCESS`, `INFO`
- `reference_url` (VARCHAR(255))
- `is_read` (BOOLEAN DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `system_settings`
Configurable operational parameters.
- `key` (VARCHAR(100), PK) — e.g. `TARE_WEIGHT_TOLERANCE_GRAMS`, `PROVINCE_QUOTAS_MT`, `PRICE_PER_CYLINDER_NPR`
- `value` (JSONB NOT NULL)
- `description` (TEXT)
- `last_modified_by` (UUID, FK -> users.id)
- `updated_at` (TIMESTAMPTZ DEFAULT NOW())
