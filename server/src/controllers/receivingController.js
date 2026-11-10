import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { ReconciliationEngine } from '../services/reconciliationService.js';

export const confirmReceiving = (req, res) => {
  const {
    dispatch_code,
    received_quantity,
    tamper_seal_intact,
    receiver_remarks,
    unmatched_serials = []
  } = req.body;

  if (!dispatch_code || received_quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Dispatch code and verified received count are required.' });
  }

  const dispatch = db.dispatches.find(d => d.dispatch_code === dispatch_code);
  if (!dispatch) {
    return res.status(404).json({ success: false, message: `Consignment with code ${dispatch_code} not found.` });
  }

  if (dispatch.dispatch_status === 'DELIVERED_CONFIRMED') {
    return res.status(400).json({ success: false, message: 'Consignment already received and confirmed.' });
  }

  const receivedCount = Number(received_quantity);
  const dispatchedCount = Number(dispatch.total_quantity);

  // Invoke Reconciliation Engine
  const reconciliation = ReconciliationEngine.reconcileDelivery({
    dispatchedQty: dispatchedCount,
    receivedQty: receivedCount,
    unmatchedSerials
  });

  const receiptConfirmationId = crypto.randomUUID();
  const receiptRecord = {
    id: receiptConfirmationId,
    dispatch_id: dispatch.id,
    confirmed_by_user_id: req.user.id,
    receiving_organization_id: dispatch.receiver_organization_id,
    received_at: new Date().toISOString(),
    tamper_seal_intact: tamper_seal_intact !== false,
    total_dispatched_quantity: dispatchedCount,
    total_received_quantity: receivedCount,
    total_variance_quantity: reconciliation.varianceQty,
    receiver_remarks: receiver_remarks || 'Offloaded and inspected at intake bay.',
    confirmation_status: reconciliation.isDiscrepant ? 'ACCEPTED_WITH_VARIANCE' : 'ACCEPTED_MATCH'
  };

  db.receiptConfirmations.unshift(receiptRecord);

  // Update Stock: remove from in-transit, credit received quantity to receiver stock
  const receiverStock = db.stockBalances.find(s => s.location_id === dispatch.receiver_location_id);
  if (receiverStock) {
    receiverStock.in_transit_inbound_quantity = Math.max(0, (receiverStock.in_transit_inbound_quantity || 0) - dispatchedCount);
    receiverStock.current_filled_quantity += receivedCount;
    receiverStock.last_movement_at = new Date().toISOString();
  }

  // Update dispatch status
  dispatch.dispatch_status = reconciliation.isDiscrepant ? 'DELIVERED_DISCREPANCY' : 'DELIVERED_CONFIRMED';

  let discrepancyTicket = null;

  // If variance occurred, auto-create discrepancy case
  if (reconciliation.isDiscrepant) {
    const caseNumber = `DISC-2083-${Math.floor(10000 + Math.random() * 90000)}`;
    discrepancyTicket = {
      id: crypto.randomUUID(),
      case_number: caseNumber,
      dispatch_id: dispatch.id,
      dispatch_code: dispatch.dispatch_code,
      receipt_confirmation_id: receiptConfirmationId,
      source_organization_id: dispatch.sender_organization_id,
      source_name: dispatch.sender_name,
      destination_organization_id: dispatch.receiver_organization_id,
      destination_name: dispatch.receiver_name,
      expected_quantity: dispatchedCount,
      received_quantity: receivedCount,
      variance_quantity: reconciliation.varianceQty,
      severity: reconciliation.severity,
      investigation_status: reconciliation.recommendedStatus,
      assigned_officer_user_id: null,
      unmatched_serials: unmatched_serials,
      initial_remarks: receiver_remarks || `Quantity mismatch of ${reconciliation.varianceQty} units detected at receiving.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      investigation_notes: [
        {
          id: `NOTE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: req.user.full_name,
          role: req.user.system_role,
          note: `Receiving confirmation flagged ${reconciliation.varianceQty} unit variance against gate pass. Tamper seal intact: ${receiptRecord.tamper_seal_intact}.`
        }
      ]
    };

    db.discrepancyCases.unshift(discrepancyTicket);
  }

  // Immutable Audit
  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: reconciliation.isDiscrepant ? 'RECEIPT_CONFIRMED_WITH_DISCREPANCY' : 'RECEIPT_CONFIRMED_PERFECT_MATCH',
    targetResource: `${dispatch.dispatch_code} (${receivedCount}/${dispatchedCount})`,
    newState: {
      variance: reconciliation.varianceQty,
      discrepancyCase: discrepancyTicket?.case_number || 'NONE',
      status: dispatch.dispatch_status
    }
  });

  return res.json({
    success: true,
    message: reconciliation.isDiscrepant
      ? `Delivery acknowledged with variance (${reconciliation.varianceQty} cylinders). Case ${discrepancyTicket.case_number} registered for NOC inquiry.`
      : 'Consignment confirmed and reconciled with zero variance.',
    receipt: receiptRecord,
    reconciliation,
    discrepancyCase: discrepancyTicket
  });
};
