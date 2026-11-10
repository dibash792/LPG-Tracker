# Security & Privacy Architecture — LPG Tracker Nepal
## Alignment with OWASP ASVS 5.0.0 and Government Data Protection Norms

**Document Ref:** `docs/security-and-privacy.md`  
**Classification:** Public Infrastructure Technical Proposal  
**Security Benchmark:** OWASP API Security Top 10 (2023) & ASVS 5.0.0 Level 2  

---

## 1. Civil Privacy & Household Scope Protection

### 1.1 Scope Boundary
Under Section 2.2 of the Master Architecture, LPG Tracker tracks commercial custody transfer exclusively between licensed corporate entities:
$$\text{NOC Bulk Terminal} \longrightarrow \text{Bottling Plant} \longrightarrow \text{Authorized Distributor} \longrightarrow \text{Local Retailer}$$

### 1.2 Non-Collection of Consumer Identity
- The platform **strictly excludes** individual household cylinder transactions, consumer national identity numbers (Nagarikta / NID), and domestic consumption logs.
- Public users can search neighborhood stock availability without an account.
- Retailers report aggregate stock counts, not consumer identity.
- This design completely eliminates the civil privacy risk and surveillance concerns associated with consumer meter tracking.

---

## 2. Authentication & Authorization Controls

1. **Password Storage**: Modern hashing via `bcryptjs` with work factor 10+.
2. **Session Security**: Stateless JSON Web Tokens (JWT) signed with 256-bit server secret and 24-hour expiration.
3. **Multi-Tenant Organization Boundary**:
   - Every mutating request enforces organization data isolation (`enforceOrganizationBoundary`).
   - A distributor operator can never view or modify consignments belonging to an unlinked distributor or plant.
   - Super Admin privileges are audited: high-level administrative access does not permit silent data alteration.

---

## 3. Cryptographic Audit Chaining

Every administrative decision, license approval, quota adjustment, and discrepancy resolution generates an audit record secured by SHA-256 HMAC cryptographic chaining:

$$\text{HMAC}_{k}(\text{Seq} \parallel \text{Timestamp} \parallel \text{Actor} \parallel \text{Action} \parallel \text{Target} \parallel \text{Hash}_{n-1})$$

- If an adversary modifies an audit log row directly in the database, the cryptographic hash sequence breaks.
- The `GET /api/v1/audit/verify` integrity check exposes any discrepancy between stored and calculated hashes.

---

## 4. OWASP API Security Mitigations

| Vulnerability | Mitigation Implemented |
|---|---|
| **API1: Broken Object Level Authorization (BOLA)** | Parameterized endpoints verify that `req.userOrganization.id` matches the target resource owner before granting read/write access. |
| **API2: Broken Authentication** | Rate-limited login endpoints, no hardcoded administrative passwords, verified phone requirements for consumer complaints. |
| **API3: Broken Object Property Level Authorization** | Whitelisted request payload parsing preventing unauthorized manipulation of approval status or compliance scores. |
| **API4: Unrestricted Resource Consumption** | Request body limits capped at 10MB, express rate-limiting, and indexed database queries. |
| **API5: Broken Function Level Authorization (BFLA)** | Super Admin endpoints enforce `requireRole(['NOC_SUPER_ADMIN'])` on the server side regardless of UI button states. |
| **API8: Security Misconfiguration** | Strict CORS whitelisting, generic error messages in production preventing stack trace leakage, secure environment variables. |
