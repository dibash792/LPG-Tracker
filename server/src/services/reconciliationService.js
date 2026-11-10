import { config } from '../config/index.js';

export class ReconciliationEngine {
  /**
   * Reconciles an inbound delivery confirmation against the original dispatch record.
   * Calculates net variance and evaluates severity and classification according to
   * Nepal Bureau of Standards & Metrology (NBSM NS:533) tolerances.
   */
  static reconcileDelivery({ dispatchedQty, receivedQty, tareWeightsSample = [], unmatchedSerials = [] }) {
    const varianceQty = receivedQty - dispatchedQty;
    const isDiscrepant = varianceQty !== 0 || unmatchedSerials.length > 0;

    if (!isDiscrepant) {
      return {
        isDiscrepant: false,
        varianceQty: 0,
        severity: 'LOW',
        recommendedStatus: 'RESOLVED',
        statutoryCategory: 'CONFORMANT',
        reason: 'Consignment accepted with 100% quantity and tag match.'
      };
    }

    // Evaluate absolute variance percentage
    const variancePercent = Math.abs(varianceQty / (dispatchedQty || 1)) * 100;

    // Severity assessment
    let severity = 'LOW';
    if (variancePercent > 5 || Math.abs(varianceQty) > 20) {
      severity = 'CRITICAL';
    } else if (variancePercent > 2 || Math.abs(varianceQty) > 8) {
      severity = 'HIGH';
    } else if (variancePercent > 0.5 || Math.abs(varianceQty) > 2) {
      severity = 'MEDIUM';
    }

    // Assess whether variance falls within technical tare scale calibration tolerance
    // (e.g. damaged collar valve or allowable scale margin vs transit loss)
    let recommendedStatus = 'OPEN';
    let statutoryCategory = 'UNEXPLAINED_VARIANCE';

    if (Math.abs(varianceQty) <= 3 && unmatchedSerials.length <= 3) {
      // Small physical variance often related to transit ramp handling or tare calibration
      statutoryCategory = 'POTENTIAL_TECHNICAL_VARIANCE';
      recommendedStatus = 'AWAITING_EXPLANATION';
    } else if (severity === 'CRITICAL') {
      statutoryCategory = 'SIGNIFICANT_CUSTODY_SHORTAGE';
      recommendedStatus = 'UNDER_REVIEW';
    } else {
      statutoryCategory = 'STANDARD_VARIANCE_FLAG';
      recommendedStatus = 'OPEN';
    }

    return {
      isDiscrepant: true,
      varianceQty,
      variancePercent: +variancePercent.toFixed(2),
      severity,
      recommendedStatus,
      statutoryCategory,
      unmatchedCount: unmatchedSerials.length,
      policyNotice: 'Under NOC Guidelines 2081, this discrepancy represents a custody audit variance requiring inquiry, not automatic proof of illegal diversion.'
    };
  }

  /**
   * Validates legal status transitions ensuring due process before assigning findings.
   */
  static validateStatusTransition(currentStatus, targetStatus, justificationNote, userRole) {
    const validStatuses = [
      'OPEN',
      'AWAITING_EXPLANATION',
      'UNDER_REVIEW',
      'EVIDENCE_REQUESTED',
      'TECHNICAL_VARIANCE',
      'SUSPECTED_DIVERSION',
      'CONFIRMED_FRAUD',
      'RESOLVED',
      'CLOSED_WITHOUT_FINDING'
    ];

    if (!validStatuses.includes(targetStatus)) {
      return { allowed: false, message: `Invalid status code: ${targetStatus}` };
    }

    // Only NOC Super Admin or Senior Inspector can assign fraud or suspected diversion
    if (['SUSPECTED_DIVERSION', 'CONFIRMED_FRAUD', 'RESOLVED'].includes(targetStatus)) {
      if (!['NOC_SUPER_ADMIN', 'NOC_INSPECTOR'].includes(userRole)) {
        return { allowed: false, message: 'Only authorized NOC regulatory officers may assign formal statutory findings or close investigations.' };
      }
    }

    // Confirmed fraud requires previous review or investigation
    if (targetStatus === 'CONFIRMED_FRAUD' && !['UNDER_REVIEW', 'SUSPECTED_DIVERSION'].includes(currentStatus)) {
      return { allowed: false, message: 'Fraud finding requires prior formal review and evidentiary verification under administrative law.' };
    }

    // Mandatory justification
    if (!justificationNote || justificationNote.trim().length < 15) {
      return { allowed: false, message: 'A formal written administrative explanation (minimum 15 characters) is legally required for the permanent audit trail.' };
    }

    return { allowed: true };
  }
}
