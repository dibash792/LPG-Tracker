# Pilot Deployment Proposal — LPG Tracker Nepal
## Phase-Wise National Implementation Plan for Nepal Oil Corporation (NOC)

**Document Ref:** `docs/pilot-deployment-proposal.md`  
**Target Entities:** Nepal Oil Corporation, Ministry of Industry, Commerce & Supplies (MoICS), LP Gas Industry Association  
**Pilot Duration:** 6 Months (Phase 1 Sandbox $\rightarrow$ Phase 2 Corridor Trial $\rightarrow$ Phase 3 Full Rollout)  

---

## 1. Pilot Objectives & Scope

The pilot tests the feasibility of digital custody tracking without disrupting active domestic supply or imposing unrealistic administrative burdens on truck drivers and shop owners.

### Scope Distinction
1. **Demonstrated in Current Prototype**:
   - Closed-loop custody transfer tracking between plants, distributors, and retailers.
   - Automated discrepancy reconciliation engine.
   - Super Admin regulatory governance and immutable audit logging.
   - Bilingual English/Nepali interface with public stock transparency.
2. **Requiring Stakeholder Approval**:
   - Formal mandate by NOC board requiring authorized distributors to confirm digital receipts upon truck offloading.
   - Standardization of serialized barcoded wire seals on delivery trucks.
3. **Requiring Field Operational Testing**:
   - Offline handling in mountainous high-altitude terrain with intermittent cellular connectivity.

---

## 2. 3-Phase Pilot Phasing Plan

```
[MONTH 1 - 2] PHASE 1: CONTROLLED KATHMANDU CORRIDOR SANDBOX
- Participants: 2 Bottling Plants (Nepal Gas Balaju & Everest Gas Amlekhgunj)
- 40 Authorized Wholesale Distributors in Kathmandu Valley & Kavre
- 200 Verified Retail Outlets
- Focus: Gate pass QR scanning, driver reception, scale tare calibration baseline.

[MONTH 3 - 4] PHASE 2: HIGHWAY TRANSIT CORRIDOR EXPANSION
- Corridor: Birgunj/Amlekhgunj -> Naubise -> Valley Corridor
- Testing transit duration variance, checkpost weighbridge telemetry, and multi-drop dropoffs.
- Ingestion of automated carousel exports from Kosan Crisplant and Siraga lines.

[MONTH 5 - 6] PHASE 3: REMOTE REGIONAL EQUITY DEPLOYMENT
- Provinces: Karnali (Surkhet / Jumla) and Sudurpashchim (Dhangadhi / Baitadi)
- Focus: Winter reserve quota equity, offline synchronization resilience, consumer overpricing complaint redressal via NOC QRT.
```

---

## 3. Key Success Indicators (KPIs)

1. **Reconciliation Speed**: Reduction of transit quantity audit lag from 30+ days (paper records) to under 2 hours.
2. **False-Positive Fraud Reduction**: Zero false criminal accusations for legitimate technical scale drift (NS:533 standard).
3. **Price Compliance**: 99.5%+ adherence to gazetted domestic LPG rate (NPR 1,895) across pilot retail stores.
4. **User Adoption**: 90%+ distributor compliance with electronic receiving confirmation.

---

## 4. Hardware & Infrastructure Prerequisites

- **Bottling Plants**: Existing PC with web browser + standard USB/Bluetooth handheld barcode scanner at dispatch gate.
- **Distributors**: Smartphone (Android / iOS) with camera for QR/barcode scanning.
- **Retailers**: Any standard mobile phone running web browser; minimal data usage (< 2 MB / day).
- **NOC Central Command**: Secure Cloud / Government Data Center (GIDC) running Node.js and PostgreSQL.
