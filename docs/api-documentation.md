# REST API Documentation — LPG Tracker Nepal (v1)

**Base URL:** `http://localhost:5000/api/v1`  
**Authentication Scheme:** Bearer Token (`Authorization: Bearer <JWT>`) or Developer Demo Header (`x-demo-role: <ROLE>`)

---

## 1. Authentication & Onboarding

### `POST /auth/login`
Authenticates user by mobile phone and password.
- **Request Body**:
  ```json
  {
    "phone_number": "9851012345",
    "password": "Password@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr-noc-admin",
      "fullName": "Dr. Chandan Adhikari",
      "role": "NOC_SUPER_ADMIN"
    }
  }
  ```

### `POST /auth/register-organization`
Allows a commercial gas entity to submit self-registration for NOC review.
- **Request Body**:
  ```json
  {
    "legal_name": "Gandaki Valley Distribution Associates",
    "trade_name": "Gandaki Valley Distributors",
    "org_type": "AUTHORIZED_DISTRIBUTOR",
    "province_id": 4,
    "district": "Tanahun",
    "municipality": "Damauli Vyas",
    "ward_number": 4,
    "phone_number": "9856012345"
  }
  ```
- **Response `201 Created`**:
  Status enters `PENDING_APPROVAL` with zero operational privileges.

---

## 2. Organization Management & Licensing

### `GET /organizations`
Lists registered organizations with optional filtering.
- **Query Params**: `type`, `status`, `province_id`, `search`
- **Requires**: `authenticateToken`

### `POST /organizations/:id/approve`
Approves an organization license with mandatory statutory reason.
- **Requires**: `requireRole(['NOC_SUPER_ADMIN'])`
- **Request Body**:
  ```json
  {
    "formal_reason": "Verified explosive containment clearances and NS:533 certification.",
    "license_expiry_date": "2028-04-13"
  }
  ```

---

## 3. Dispatches & Custody Transfer

### `POST /dispatches`
Creates an outbound consignment gate pass.
- **Request Body**:
  ```json
  {
    "receiver_organization_id": "org-dist-patan",
    "vehicle_registration_number": "BA 3 KHA 9912",
    "driver_name": "Hari Prasad Shrestha",
    "driver_phone": "9851088776",
    "tamper_seal_barcode": "SEAL-NP-2083-771",
    "items": [
      {
        "cylinder_category_id": "DOMESTIC_14_2",
        "quantity": 600
      }
    ]
  }
  ```
- **Response `201 Created`**:
  Returns generated `dispatch_code` and `qr_verification_code`.

### `GET /dispatches/:identifier`
Retrieves consignment details by dispatch code or QR verification hash.

---

## 4. Receiving & Reconciliation

### `POST /receiving/confirm`
Receiving organization confirms consignment receipt and checks for variances.
- **Request Body**:
  ```json
  {
    "dispatch_code": "DSP-2083-09412",
    "received_quantity": 588,
    "tamper_seal_intact": false,
    "receiver_remarks": "Truck arrived with wire seal loose. 12 cylinders short.",
    "unmatched_serials": ["NP-GAS-78401", "NP-GAS-78402"]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Delivery acknowledged with variance (-12 cylinders). Case DISC-2083-XXXX registered for NOC inquiry.",
    "reconciliation": {
      "isDiscrepant": true,
      "varianceQty": -12,
      "severity": "HIGH",
      "recommendedStatus": "UNDER_REVIEW"
    }
  }
  ```

---

## 5. Discrepancy Investigation

### `GET /discrepancies`
Lists discrepancy cases with filtering by `status` and `severity`.

### `POST /discrepancies/:id/notes`
Appends an official investigation note.

### `POST /discrepancies/:id/status`
Transitions legal case status (enforcing regulatory due process).
- **Request Body**:
  ```json
  {
    "target_status": "TECHNICAL_VARIANCE",
    "administrative_reason": "Tare scale recalibration verified with NBSM test slip."
  }
  ```

---

## 6. Public Services (Unauthenticated)

### `GET /public/availability`
Public stock lookup across authorized retailers.
- **Query Params**: `district`, `municipality`
- **Response**: List of retail shops, current stock availability range (`> 30 units`), and verified gazetted price (`NPR 1,895`).

### `POST /public/complaints`
Registers an authenticated citizen grievance (requires phone contact).
- **Request Body**:
  ```json
  {
    "citizen_phone": "9841889900",
    "target_business_name": "Baluwatar Gas Store",
    "complaint_type": "OVERPRICING",
    "incident_district": "Kathmandu",
    "incident_details": "Charged NPR 2,100 instead of gazetted NPR 1,895."
  }
  ```

---

## 7. Audit & Reports

### `GET /audit/logs`
Returns sequential immutable audit ledger.

### `GET /audit/verify`
Recalculates SHA-256 HMAC cryptographic chain and reports tampering validation status.

### `GET /reports/overview`
Returns 6 core national executive metrics.
