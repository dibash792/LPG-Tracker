# Testing & Quality Assurance Strategy — LPG Tracker Nepal

**Document Ref:** `docs/testing-strategy.md`  
**Execution Command:** `npm run test:reconciliation`  

---

## 1. Quality Assurance Scope

LPG Tracker employs a multi-layered verification strategy covering frontend responsiveness, API authorization boundaries, transactional consistency, and business reconciliation logic.

---

## 2. Business Logic Verification Matrix (Part 14 Implementation)

| Test Case | Scenario Evaluated | Expected Behavior | Automated Test Status |
|---|---|---|---|
| **Case 1** | Dispatch of 1,000 cylinders and confirmation of 1,000. | Zero variance. Status marked `ACCEPTED_MATCH` / `RESOLVED`. Stock credited. | **PASSED** |
| **Case 2** | Dispatch of 1,000 cylinders and confirmation of 950. | Variance = -50 units. Severity = `CRITICAL`. Case ticket auto-created under `UNDER_REVIEW`. | **PASSED** |
| **Case 3** | Small variance (498/500 units) within NBSM NS:533 scale tolerance. | Classified as `POTENTIAL_TECHNICAL_VARIANCE`. Status marked `AWAITING_EXPLANATION`. | **PASSED** |
| **Case 4** | Attempt to declare fraud without mandatory written justification. | Rejected with HTTP 400. Minimum 15 characters formal reason enforced. | **PASSED** |
| **Case 5** | Non-admin operator attempting to assign fraud findings. | Rejected with HTTP 403. Only authorized NOC regulatory officers permitted. | **PASSED** |
| **Case 6** | Super Admin assigning technical variance with verified test slip. | Status updated to `TECHNICAL_VARIANCE` with immutable audit entry created. | **PASSED** |
| **Case 7** | Double-entry physical balance consistency. | In-transit stock decremented and warehouse stock credited transactionally. | **PASSED** |
| **Case 8** | Cryptographic HMAC SHA-256 chaining in audit trail. | Sequential block signature calculated and verified with zero tampering. | **PASSED** |

---

## 3. Frontend Cross-Device & Accessibility Testing

- **Responsive Viewport Coverage**:
  - Small Mobile (360px - 414px): Single-column simplified stock adjustment, clear touch targets.
  - Tablets (768px - 1024px): Two-column layout, drawer popups.
  - Desktop Monitors (1280px - 1920px): Full executive console with collapsible navigation.
- **Accessibility (WCAG 2.2 AA)**:
  - Contrast ratios $\ge 4.5:1$ on text and UI indicators.
  - Color is never used alone to convey status (paired with text and distinct iconography).
  - High-visibility focus states and accessible button hit targets.

