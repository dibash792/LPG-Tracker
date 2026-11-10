# Current Project Audit — LPG Tracker Repository

**Date:** 2026-11-10  
**Auditor:** Senior Product Architect, Systems & Security Engineer  
**Repository Path:** `c:\Users\acer\Music\LPG Tracker`  
**Target Purpose:** National LPG Distribution Monitoring, Verification and Public Accountability Platform for Nepal Oil Corporation (NOC)

---

## 1. Executive Summary

This repository was initiated to establish a national-scale custody monitoring platform for domestic LPG distribution in Nepal. Prior work successfully created the visual foundations, design tokens, responsive layout framework, and high-fidelity simulated components for the **NOC Super Admin Console**. 

However, to evolve this prototype into a credible, production-ready full-stack software proposal suitable for government evaluation, significant architectural maturation is required:
1. **Transitioning from client-side in-memory mock state to a real Node.js / Express backend with transactional database integrity.**
2. **Implementing a PostgreSQL relational schema with migrations and seed scripts for all 26 core domain entities.**
3. **Establishing real REST API endpoints, JWT / session authentication, role-based authorization, and tamper-resistant audit logging.**
4. **Providing dedicated multi-role interfaces for Bottling Plants, Wholesale Distributors, Local Retailers, and Public Citizens.**
5. **Ensuring offline-first resilience, PWA capability, and network latency tolerance for high-altitude Terai/Himalayan transit corridors.**

---

## 2. What Already Works (Preserve & Build Upon)

| Component / Subsystem | Status | Technical Details | Value to Preserve |
|---|---|---|---|
| **Design System & Visual Tokens** | Working | Balanced GovTech palette: Navy (`#102B3A`), Fresh Teal (`#20B894`), Warm Amber (`#F2A94A`), Canvas (`#F1F4F7`). Clean typography via Inter and JetBrains Mono. | Retain as the visual baseline. Perfectly balances gravitas and readability. |
| **Bilingual Localization System** | Working | English and Nepali (`नेपाली`) translation context with Bikram Sambat date conversion (*२०८३ कार्तिक २५*) and Devanagari numerals. | Preserve and expand to cover backend validation messages and PDF/print outputs. |
| **4-Tier Distribution Visualizer** | Working | Interactive custody pipeline: NOC Bulk $\rightarrow$ Bottling Plants $\rightarrow$ Distributors $\rightarrow$ Retailers. Explicitly excludes household retail tracking. | Preserve as the core conceptual anchor for executive demonstrations. |
| **Discrepancy Investigation Workflow** | Working (UI) | Distinguishes technical tare variance from suspected diversion and confirmed fraud. Includes chronological case notes and decision justification. | Preserve UI workflow; back it with PostgreSQL transactional tables and audit triggers. |
| **Organization Approval Workflow** | Working (UI) | Super Admin review of legal OCR certificates, Explosives clearances, and EIA documentation. | Preserve UI workflow; wire to real backend multi-stage onboarding endpoints. |
| **Build & Tooling Infrastructure** | Working | Vite 6 + React 18 + Tailwind CSS. Compiles cleanly to production bundle (`dist/index.html` ~1.14 kB, `dist/assets` ~345 kB). | Preserve Vite development and build pipeline. |

---

## 3. What Is Incomplete or Missing

1. **No Backend API Server**:
   - Currently, all state mutations (approvals, discrepancy status shifts, quota updates) are held in React component state. Refreshing the browser resets the session.
   - **Remedy**: Create a standalone Node.js / Express backend under `server/` with structured routes, controllers, services, database models, and validation middleware.

2. **No Persistent Relational Database**:
   - PostgreSQL schema for the 26 required entities (users, organizations, bulk_receipts, dispatches, receipt_confirmations, discrepancy_cases, audit_logs, etc.) has not yet been instantiated.
   - **Remedy**: Build comprehensive PostgreSQL migrations, SQL schema definitions, foreign keys, unique constraints, and robust database clients.

3. **Missing Role-Specific Interfaces**:
   - While the Super Admin view is comprehensive, operational interfaces for:
     - **Bottling Plant Operators** (bulk receipt logging, filling carousel telemetry, dispatch gate pass generation)
     - **Wholesale Distributors** (consignment intake, receipt confirmation, onward retailer delivery)
     - **Local Retailers** (mobile stock buffer confirmation, public availability broadcasting)
     - **General Public** (district/municipality stock finder, verified retail price check, authenticated shortage reporting)
   - are currently only partially represented.
   - **Remedy**: Implement dedicated, responsive, mobile-first dashboards for each of these 4 roles.

4. **Missing Offline & PWA Capabilities**:
   - Nepal's distribution corridors traverse mountainous and rural terrain where mobile networks drop frequently.
   - **Remedy**: Implement Service Worker caching, IndexedDB offline draft storage, idempotency keys, and explicit status states (`DRAFT` $\rightarrow$ `PENDING_SYNC` $\rightarrow$ `SUBMITTED` $\rightarrow$ `CONFIRMED`).

---

## 4. What Is Broken or Needs Correction

1. **Strict TypeScript Dependency**:
   - Certain modules enforced strict TypeScript types which can complicate rapid iteration and contradicts the master prompt requirement: *"Use JavaScript as the primary programming language. Do not force TypeScript into every component."*
   - **Action**: Bridge TypeScript and modern ES6+ JavaScript cleanly; allow `.jsx` and `.js` alongside existing typed definitions.

2. **Client-Side Fake Hashing**:
   - In the mock audit trail, hashes were generated via `Math.random().toString(16)` on the frontend.
   - **Action**: Replace with cryptographically sound SHA-256 HMAC generation on the backend Node.js server using `node:crypto`.

---

## 5. Architectural Changes Required

```
lpg-tracker/
├── docs/                             # Comprehensive Government Presentation Documentation
│   ├── current-project-audit.md      # (This document)
│   ├── research-and-system-gap-analysis.md
│   ├── product-requirements.md
│   ├── system-architecture.md
│   ├── database-design.md
│   ├── entity-relationships.md
│   ├── api-documentation.md
│   ├── security-and-privacy.md
│   ├── integration-strategy.md
│   ├── testing-strategy.md
│   └── pilot-deployment-proposal.md
├── server/                           # Production-Ready Node.js / Express API Backend
│   ├── src/
│   │   ├── config/                   # Database, environment, security settings
│   │   ├── controllers/              # Route controllers (Auth, Dispatches, Discrepancies, etc.)
│   │   ├── middleware/               # Auth, RBAC, Rate Limiting, Validation, Audit Logger
│   │   ├── models/ or db/            # Database schema, queries, migration runner, seeds
│   │   ├── routes/                   # Clean REST API endpoints
│   │   ├── services/                 # Business logic: Reconciliation engine, Stock calculus
│   │   └── server.js                 # Express application entrypoint
│   └── migrations/                   # SQL migration scripts for 26 domain tables
├── src/                              # Frontend React Application
│   ├── components/                   # Reusable UI & role portals
│   ├── context/                      # Auth, Language, Notification contexts
│   ├── api/                          # Connected API client service
│   └── App.jsx / App.tsx             # Connected single-page application with role switcher
└── package.json                      # Full-stack dependencies & scripts
```

---

## 6. Audit Verdict

The existing frontend visual foundation is sound, elegant, and directly addresses the product's national scope. It provides a solid UI baseline. We will **preserve all existing visual work**, introduce the **Node.js/Express backend API**, design the **complete PostgreSQL database architecture with 26 entities**, build the **reconciliation engine**, complete the **role-specific portals**, and author the **10 mandatory government-grade documentation dossiers**.
