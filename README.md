# LPG Tracker Nepal — National Distribution Monitoring Platform

A production-quality frontend for **LPG Tracker**, a national LPG distribution monitoring and accountability platform built for **Nepal Oil Corporation (NOC)**.

---

## 1. Key Capabilities & Scope

### Tracked Chain of Custody
1. **NOC Bulk Import & Depots** (IOC Barauni, Haldia, Mathura to Nepal border terminals)
2. **Bottling & Refilling Plants** (28 licensed industrial facilities with automated filling carousels)
3. **Authorized Wholesale Distributors** (842 regional distributors with highway transit logs)
4. **Local Retail Outlets** (4,210 neighborhood consumer stores)

> **Important Boundary Rule:** Household-level cylinder retail sales are outside the tracking scope under consumer privacy and national mandate guidelines.

---

## 2. Visual Identity & Design System

The interface adheres to the prescribed national design palette:

- **Deep Navy (`#102B3A`)**: Used for navigation, headers, and core regulatory hierarchy.
- **Fresh Teal (`#20B894`)**: Used for verified states, digital signatures, and optimal flow.
- **Warm Amber (`#F2A94A`)**: Used for pending review, warnings, and transit states.
- **Alert Red (`#EF4444`)**: Used for critical discrepancies and license suspensions.
- **Soft Background (`#F1F4F7`)**: Used for canvas, keeping the view soft on the eyes.
- **Card White (`#FFFFFF`)**: High contrast, readable cards with refined typography.

---

## 3. Core Modules Implemented

### 1. NOC Super Admin Dashboard (`OverviewView`)
- **6 National Overview Metrics**:
  1. Bulk LPG Received (MT)
  2. Cylinders Filled
  3. Cylinders Dispatched
  4. Cylinders Confirmed Received
  5. Retailer Buffer Stock
  6. Discrepancies Requiring Investigation
- **Distribution Chain Flow Visualizer**: Interactive 4-stage pipeline with throughput, tanker counts, and tare compliance.
- **Active Discrepancies Mini-Desk**: Instant drill-down to priority custody variances.
- **Live Activity Stream**: Real-time dispatch, receiving, and audit feeds.
- **7-Province Supply Matrix**: Live stock breakdown across Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, and Sudurpashchim.

### 2. Discrepancy & Variance Management (`DiscrepancyManagementView`)
- Discrepancy Ledger with status filters (`Pending Review`, `Under Investigation`, `Technical Variance`, `Suspected Diversion`, `Confirmed Fraud`, `Resolved`).
- **Accountability Guarantee**: Discrepancies are categorized as custody audit variances and never automatically presumed to be fraud without formal inquiry.
- **Deep Investigation Drawer**:
  - Expected vs. Dispatched vs. Received breakdown with net variance.
  - Unmatched cylinder RFID / serial tag barcodes.
  - Full investigation timeline with inspector roles and timestamps.
  - Official NOC Decision controls with mandatory justification recording.

### 3. Organization Management & Account Approvals (`OrganizationManagementView`)
- Authorized Directory of Bottling Plants, Distributors, and Retailers.
- **NOC Super Admin Approval Workflow**: Review statutory documents (OCR company registration, Mines & Geology approval, EIA clearances, bank guarantees) before granting operating licenses.
- License suspension and reinstatement controls with audit logging.

### 4. Provincial Quota & Strategic Reserves (`ProvinceStockMap`)
- Allocation management across all 7 provinces of Nepal.
- Quota reallocation tool with simulated seasonal / winter adjustments.

### 5. Immutable Audit Trail (`AuditLogView`)
- Tamper-evident ledger with sequential block indexing, timestamps, authorized officer ID, IP address, and SHA-256 cryptographic hashes.
- On-demand cryptographic seal validator (`Verify Cryptographic Seal`).
- Export to CSV action.

### 6. Bilingual Localization (English & Nepali)
- Instant toggle between English and Nepali (`नेपाली`).
- Bikram Sambat (BS) date display (e.g. *२०८३ कार्तिक २५*).
- Conversion of numeric values to Devanagari numerals in Nepali mode.

---

## 4. Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```
All assets are compiled into `dist/`.
