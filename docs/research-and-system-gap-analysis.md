# Research & Existing System Gap Analysis
## Nepal Oil Corporation (NOC) LPG Distribution Framework

**Date:** 2026-11-10  
**Domain:** Domestic Liquefied Petroleum Gas (LPG) Custody & Distribution Monitoring  
**Jurisdiction:** Nepal Oil Corporation (NOC), Ministry of Industry, Commerce and Supplies (MoICS), Government of Nepal  
**Document Ref:** `docs/research-and-system-gap-analysis.md`

---

## 1. Existing System Overview

Nepal Oil Corporation (NOC) is the state-owned enterprise responsible for importing, storing, and supervising petroleum products and LPG throughout the Federal Democratic Republic of Nepal.

According to NOC's published regulatory framework and public portal (`noc.org.np`):
1. **Import Allocation**: Bulk LPG is imported from Indian Oil Corporation Ltd. (IOC) refineries (primarily Barauni, Haldia, and Mathura) by certified bullet tankers and received at entry depots or delivered directly to private licensed bottling plants.
2. **Bottling Plant Operations**: Approximately 28 licensed gas bottling companies (e.g., Nepal Gas, Everest Gas, Grihalaxmi Gas, Sugam Gas, Maruti Gas, Trishul Gas) operate mechanical/electronic carousels and tare check-weighing lines.
3. **Existing Published Information**: NOC maintains an **"LPG Tracking / Dealer Details"** section on its portal, categorized across Nepal's 7 provinces:
   - Koshi Province
   - Madhesh Province
   - Bagmati Province
   - Gandaki Province
   - Lumbini Province
   - Karnali Province
   - Sudurpashchim Province
4. **Current Reporting Modality**: Bottling plants are mandated to submit daily dealer distribution lists and monthly dispatch summaries to NOC regional offices and central monitoring directorates.
5. **Grievance Redressal**: NOC operates a Quick Response Team (QRT) with hotline numbers to manage consumer shortage emergencies and joint field inspections alongside the Department of Commerce, Supplies and Consumer Protection and the Chief District Officer (CDO).

---

## 2. Available Public Data vs. Reality

| Data Domain | Currently Published by NOC | Granularity & Freshness | Limitations & Gaps |
|---|---|---|---|
| **Licensed Bottling Plants** | Official list, location, contact, authorized brand name. | Static / Annually updated | Operational capacity, active daily filling volume, and tank storage levels are not published in real time. |
| **Authorized Dealers / Distributors** | Provincial lists of authorized dealers mapped to specific gas companies. | Batch PDF / Excel uploads periodically | Does not reflect real-time live stock or active dispatches in highway transit. |
| **Retailer Stores** | Partial registration via municipal wards and local dealer networks. | Highly fragmented across districts | Often unmapped digitally; rely on physical handwritten paper logbooks. |
| **Gazetted Domestic Price** | Official gazetted domestic cylinder rate (e.g., NPR 1,895 per 14.2 kg domestic cylinder). | Gazetted revisions published upon price adjustment | Price compliance at remote retail stores is enforced only reactively through physical inspection raids. |
| **Public Availability** | Not currently available on web/mobile. Citizens rely on word-of-mouth or visiting physical shops. | None | Citizens cannot verify whether a nearby shop has stock without physical presence, leading to artificial queuing. |

---

## 3. Critical System Gaps Identified by Evidence

1. **Custody Blind Spot Between Bottling Plant and Distributor**:
   - When a bottling plant dispatches a truck loaded with 800 cylinders, NOC records the plant's outbound report.
   - However, there is no standardized, two-party digital confirmation where the receiving distributor electronically inspects the truck, counts accepted units, flags variances, and signs for receipt.
   - This creates an evidentiary vacuum: if cylinders are diverted along transit highways (e.g. Mugling-Kathmandu or Naubise corridor), neither party is held accountable because timestamps and electronic handovers do not exist.

2. **Physical Logbooks and Data Lag**:
   - Mandated dealer logbooks are currently recorded on paper and physically collected or emailed periodically.
   - Reconciling paper reports takes weeks or months, meaning artificial shortages or regional hoarding can only be detected long after the event.

3. **Conflation of Discrepancies with Crime**:
   - In existing manual audits, any quantity shortfall is frequently sensationalized as black-marketing or theft.
   - In physical industrial gas distribution, legitimate non-fraudulent variances occur regularly:
     - Tare scale mechanical calibration drifts (allowable ±100g margin under NBSM NS:533).
     - Damaged valve O-rings or collar dents rejected during offloading.
     - Mandated safety decanting of expired hydraulic-test cylinders.
   - The lack of a structured discrepancy categorization workflow damages trust between regulatory bodies and licensed private gas enterprises.

4. **Exclusion of Household Data vs. Privacy Rights**:
   - Some past ad-hoc proposals suggested tracking consumer citizenship cards or household meter connections for every cylinder purchase.
   - This was rejected as intrusive, legally complex, and practically unmanageable for Nepal's rural and migrant population.
   - The gap is: How to maintain full institutional supply accountability without infringing on citizen privacy.

---

## 4. Proposed Improvements Through LPG Tracker

1. **Closed-Loop 4-Stage Custody Transfer**:
   - Track strictly between verified legal entities:
     $$\text{NOC Bulk Import} \longrightarrow \text{Bottling Plant} \longrightarrow \text{Authorized Distributor} \longrightarrow \text{Local Retailer}$$
   - Independent dispatch creation by sender + independent receipt confirmation by receiver.
   - Unmatched quantities immediately trigger an automated variance ledger entry.

2. **Reconciliation Engine with Due Process**:
   - Automatic classification into 6 legal statuses:
     - `PENDING_REVIEW`
     - `UNDER_INVESTIGATION`
     - `TECHNICAL_VARIANCE` (tare scale / safety decant)
     - `SUSPECTED_DIVERSION`
     - `CONFIRMED_FRAUD`
     - `RESOLVED`
   - Mandatory written justification, inspector assignment, and evidence upload before status transition.

3. **Public Transparency Portal Without Citizen Tracking**:
   - Citizens can search neighborhood stock availability and verify official gazetted prices without registering their personal household consumption.
   - Consumer complaint desk requires phone/account verification to prevent malicious competitor sabotage while ensuring genuine complaints reach the NOC Quick Response Team.

4. **Tamper-Evident Immutable Audit Ledger**:
   - Every quota reallocation, license approval, and discrepancy closure is signed into an append-only ledger secured by SHA-256 cryptographic chaining.

---

## 5. Feasible Integration Methods with Existing Infrastructure

| Existing NOC Infrastructure | Proposed Integration Architecture | Implementation Strategy |
|---|---|---|
| **Plant Filling Carousels (Kosan Crisplant, Siraga, etc.)** | Integration Import Module supporting structured CSV/Excel uploads and authenticated REST webhooks. | Do not rebuild carousel hardware; accept automated tare batch exports generated at end of shift. |
| **NOC Web Portal (`noc.org.np`)** | RESTful Public API microservice or embeddable widget for dealer availability lookup. | Expose read-only, cached endpoints for citizen queries (`GET /api/v1/public/availability`). |
| **SMS / Mobile Network Telephony (NTC / Ncell)** | SMS gateway integration for delivery dispatch OTPs and Quick Response complaint confirmations. | Standard SMPP / HTTP SMS API for field operators in low-bandwidth areas. |
| **Vehicle Weighbridges & Border Terminals** | Gross vehicle weight telemetry integration at customs checkposts (Birgunj, Belahiya, Kakarbhitta). | Mass-balance verification comparing tanker inbound gross weight to plant decanted bulk mass. |

---

## 6. Questions Requiring Clarification from Stakeholders

1. **NBSM Calibration Tolerances**: What is the exact allowable tare weight variance percentage codified by the Nepal Bureau of Standards & Metrology (NBSM NS:533 standard) before a cylinder must be rejected?
2. **Partial Consignment Offloading**: Are multi-drop dispatches (one truck offloading at two distinct distributors along a highway corridor) currently permitted under NOC transport contracts?
3. **Cylinder Category Standardization**: Beyond the standard 14.2 kg domestic cylinder, how should 19.0 kg commercial cylinders and 5.0 kg rural/mountain cylinders be segregated in the provincial quota balance?
4. **Offline Transit Buffer**: What is the acceptable offline synchronization window for distributors operating in remote mountain districts (e.g., Jumla, Dolpa, Mustang) where internet connectivity may be absent for 24–48 hours?

