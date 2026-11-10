# Integration Strategy — Existing Infrastructure Interoperability

**Document Ref:** `docs/integration-strategy.md`  
**Target:** Industrial Filling Plants, Custom Terminals & National Telecommunications  

---

## 1. Principles of Integration

1. **Preserve Existing Industrial Investments**: Never replace functioning automated carousels (e.g. Kosan Crisplant, Siraga, Cavagna) with proprietary software.
2. **Pluggable Ingestion Formats**: Support RESTful webhooks, scheduled CSV/Excel SFTP uploads, and verified manual batch entry.
3. **Traceability**: Ingested records retain the source machine ID, import timestamp, raw payload, and importing operator ID.

---

## 2. Ingestion Adapters

### 2.1 Automated Filling Carousel SCADA Adapter
- **Trigger**: Shift end or daily batch cutoff.
- **Payload**:
  ```json
  {
    "plant_id": "org-bp-nepal-gas",
    "carousel_id": "SIRAGA-24-HEAD-BAY1",
    "shift_date": "2026-11-10",
    "shift_type": "DAY",
    "nominal_category": "DOMESTIC_14_2",
    "units_filled": 4280,
    "units_quarantined_damaged": 14,
    "bulk_lpg_consumed_mt": 60.776,
    "average_tare_deviation_grams": 42.1
  }
  ```
- **Action**: Generates a verified `filling_batches` record and increments available filled stock at the plant location.

### 2.2 CSV / Excel Fallback Import
For smaller plants lacking continuous SCADA network connectivity:
- Pre-formatted Excel/CSV template matching `filling_batches` columns.
- Server validates column headers, row counts, and checksums before committing to database.

---

## 3. Customs Terminal & Weighbridge Interoperability
- Inbound bullet tankers decanting at Amlekhgunj, Birgunj, or Sunauli cross-check gross weighbridge mass against the Indian Oil Corporation (IOC) challan.
- Enables mass-balance reconciliation:
  $$\text{Decanted Bulk LPG (MT)} = \text{Filled Cylinder Mass (MT)} + \text{Boil-off / Transit Evaporation Normal (0.04\%)}$$

---

## 4. Telecom & SMS Gateway Integration
- **Gateways**: Nepal Telecom (NTC) & Ncell SMS API.
- **Functions**:
  1. Delivery dispatch notification sent to authorized distributor upon truck gate departure.
  2. One-Time Passwords (OTP) for authenticated citizen grievance submissions.
  3. Urgent shortage alerts dispatched to NOC Quick Response Team (QRT) field coordinators.

