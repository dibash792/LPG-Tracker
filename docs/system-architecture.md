# System Architecture Specification — LPG Tracker Nepal

**Document Ref:** `docs/system-architecture.md`  
**Architecture Style:** Modular Full-Stack JavaScript (React Frontend + Node.js/Express Backend + PostgreSQL)  
**Security Standard:** OWASP Top 10 API Security & ASVS 5.0.0 Alignment  

---

## 1. High-Level Architecture Topology

```
                       [ CITIZENS / OPERATORS / OFFICERS ]
                                       │
                                       ▼
                     [ CLOUDFLARE / REVERSE PROXY NGINX ]
                                       │
                      HTTPS / TLS 1.3  │  Rate Limiting & WAF
                                       ▼
                       ┌──────────────────────────────┐
                       │     Vite + React Frontend    │
                       │   (SPA + PWA Offline Draft)  │
                       └──────────────┬───────────────┘
                                      │ REST API / JSON
                                      ▼
                       ┌──────────────────────────────┐
                       │   Node.js / Express API Core │
                       │    (Port 5000 / Stateless)   │
                       └──────────────┬───────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│    PostgreSQL 16   │     │ Cryptographic HMAC │     │ External Plant     │
│ Relational Storage │     │ SHA-256 Audit Log  │     │ SCADA Webhook Sync │
└────────────────────┘     └────────────────────┘     └────────────────────┘
```

---

## 2. Frontend Subsystems

1. **Presentation Layer**: React 18 SPA with Tailwind CSS design tokens and custom CSS variables.
2. **Context Subsystems**:
   - `LanguageContext`: English & Nepali (`नेपाली`) dynamic translation, Devanagari digits, and Bikram Sambat date conversions.
   - `NotificationContext`: Real-time toast alerts and unacknowledged event popovers.
   - `AuthContext`: Role switcher and JWT token manager.
3. **PWA & Offline Resilience**:
   - Service Worker caching shell assets.
   - Idempotency key generation for dispatches and receiving submissions to prevent duplicate execution upon network reconnection.
   - Status indicators: `DRAFT` $\rightarrow$ `PENDING_SYNC` $\rightarrow$ `SUBMITTED` $\rightarrow$ `CONFIRMED`.

---

## 3. Backend Core Subsystems

1. **Middleware Pipeline**:
   - `helmet` / secure headers.
   - CORS policy allowing designated operational domains.
   - `authenticateToken`: JWT Bearer parser.
   - `requireRole`: Role-Based Access Control (RBAC).
   - `enforceOrganizationBoundary`: Cross-organization tenant isolation.
2. **Business Engines**:
   - `ReconciliationEngine`: Automated variance assessment, severity grading, and legal transition validation.
   - `StockEngine`: Double-entry physical movement calculus ensuring zero unrecorded cylinder leaks.
3. **Audit Ledger Engine**:
   - Sequential block indexer with SHA-256 HMAC cryptographic chaining using server master secret.

