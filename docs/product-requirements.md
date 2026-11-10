# Product Requirements Document (PRD) — LPG Tracker Nepal
## National LPG Distribution Monitoring, Verification and Public Accountability Platform

**Document Ref:** `docs/product-requirements.md`  
**Governing Authority:** Nepal Oil Corporation (NOC), Ministry of Industry, Commerce and Supplies (MoICS)  
**Version:** 1.0.0-PROPOSAL  
**Target Pilot Scope:** National LPG Supply Chain across all 7 Provinces of Nepal

---

## 1. Problem Statement & Strategic Objective

Nepal consumes approximately 40,000 to 45,000 Metric Tonnes of Liquefied Petroleum Gas (LPG) monthly for domestic and commercial heating and cooking. Currently:
1. **Supply Chain Blind Spot**: Custody transfer between industrial bottling plants and wholesale distributors relies on paper gate passes, leaving transit corridors vulnerable to unrecorded diversions and artificial shortages.
2. **Conflation of Technical Variance with Fraud**: Physical scale calibration drift (NS:533 allowable margin) and damaged valve collars are frequently confused with deliberate diversion, creating regulatory friction.
3. **Consumer Price Gouging**: In rural and mountain districts (e.g. Karnali, Sudurpashchim), remote consumers occasionally pay above the gazetted domestic rate (NPR 1,895 per 14.2 kg cylinder) without an accessible means to verify legitimate retailer stock or register complaints.
4. **Citizen Privacy Risk**: Previous proposals to track consumer citizenship cards for every household cylinder purchase created privacy and logistical concerns.

**Objective**: LPG Tracker establishes a closed-loop institutional custody monitoring platform that tracks LPG strictly between verified commercial entities (**NOC $\rightarrow$ Bottling Plant $\rightarrow$ Wholesale Distributor $\rightarrow$ Local Retailer**) while completely exempting household cylinder transactions.

---

## 2. User Roles & Capability Matrix

| Role | Access Level | Primary Core Capabilities |
|---|---|---|
| **NOC Super Admin** | Highest National Authority | National distribution telemetry, organization license approvals/rejections, quota reallocation across 7 provinces, discrepancy inquiry adjudication, immutable audit ledger verification. |
| **NOC Field Inspector** | Regulatory Compliance | Physical site inspection logging, weighbridge cross-checking, formal investigation evidence upload, sampling tare weight NS:533 conformity. |
| **Bottling Plant Operator** | Industrial Facility | Bulk LPG decanting entry (MT from IOC tankers), filling carousel telemetry integration, outbound consignment generation with wire-seal barcodes and QR gate passes. |
| **Authorized Distributor** | Wholesale Depots | Inbound consignment reception, RFID conveyor intake verification, discrepancy reporting, onward retail dispatch creation. |
| **Local Retailer** | Neighborhood Store | Mobile stock confirmation, physical floor count corrections with audited justification, public availability beacon broadcasting. |
| **General Public Citizen** | Unauthenticated Lookup | District/municipality stock availability finder, official gazetted price verification (NPR 1,895), authenticated consumer complaint submission. |

---

## 3. Functional Requirements

### 3.1 Bulk Import & Mass Balance
- Record mass-based receipts in Metric Tonnes (MT) from Indian Oil Corporation (IOC Barauni, Haldia, Mathura).
- Differentiate mass measurement (MT) from cylinder unit counts. Never convert one to another without an explicitly recorded conversion formula based on nominal fill weight.

### 3.2 Two-Party Digital Custody Transfer
- Dispatches are created independently by the sending organization (recording vehicle registration, driver contact, physical wire seal barcode, quantity).
- Receiving organizations independently confirm counts and flag variances upon offloading.
- Receivers cannot overwrite the sender's original record.

### 3.3 Statutory Discrepancy Reconciliation
- Any count difference automatically generates a `discrepancy_cases` ticket.
- Cases transition through 6 distinct legal statuses:
  `OPEN` $\rightarrow$ `AWAITING_EXPLANATION` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `TECHNICAL_VARIANCE` $\rightarrow$ `SUSPECTED_DIVERSION` $\rightarrow$ `CONFIRMED_FRAUD` $\rightarrow$ `RESOLVED`.
- Mandatory administrative justification (minimum 15 characters) required for every status transition.

### 3.4 Organization Onboarding & Licensing
- Self-registration with document upload (OCR Certificate, Explosives Clearance, EIA report, Bank Guarantee).
- Newly registered organizations remain in `PENDING_APPROVAL` and receive zero operational privileges until NOC Super Admin approval.

### 3.5 Immutable Audit Trail
- Sequential indexing with SHA-256 HMAC cryptographic signatures chaining previous sequence hashes.
- Tamper detection validator ensuring zero silent modifications to quota, approval, or discrepancy records.

