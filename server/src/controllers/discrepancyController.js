import { db } from '../db/index.js';
import { ReconciliationEngine } from '../services/reconciliationService.js';

export const listDiscrepancies = (req, res) => {
  const { status, severity, search } = req.query;

  let results = [...db.discrepancyCases];

  if (status && status !== 'ALL') {
    results = results.filter(d => d.investigation_status === status);
  }
  if (severity && severity !== 'ALL') {
    results = results.filter(d => d.severity === severity);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(d => 
      d.case_number.toLowerCase().includes(q) ||
      (d.dispatch_code && d.dispatch_code.toLowerCase().includes(q)) ||
      (d.source_name && d.source_name.toLowerCase().includes(q)) ||
      (d.destination_name && d.destination_name.toLowerCase().includes(q))
    );
  }

  return res.json({
    success: true,
    count: results.length,
    discrepancies: results
  });
};

export const getDiscrepancy = (req, res) => {
  const item = db.discrepancyCases.find(d => d.id === req.params.id || d.case_number === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Discrepancy case not found' });
  }
  return res.json({ success: true, discrepancy: item });
};

export const addInvestigationNote = (req, res) => {
  const item = db.discrepancyCases.find(d => d.id === req.params.id || d.case_number === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Discrepancy case not found' });
  }

  const { note_text } = req.body;
  if (!note_text || note_text.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Note text required' });
  }

  const noteEntry = {
    id: `NOTE-${Date.now()}`,
    timestamp: new Date().toISOString(),
    author: req.user.full_name,
    role: req.user.system_role,
    note: note_text.trim()
  };

  if (!item.investigation_notes) item.investigation_notes = [];
  item.investigation_notes.unshift(noteEntry);
  item.updated_at = new Date().toISOString();

  // Audit
  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: 'DISCREPANCY_NOTE_APPENDED',
    targetResource: item.case_number,
    newState: { noteId: noteEntry.id, author: noteEntry.author }
  });

  return res.json({
    success: true,
    message: 'Investigation note added to case file.',
    discrepancy: item
  });
};

export const transitionStatus = (req, res) => {
  const item = db.discrepancyCases.find(d => d.id === req.params.id || d.case_number === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Discrepancy case not found' });
  }

  const { target_status, administrative_reason } = req.body;

  // Validate status transition against regulatory due process
  const validation = ReconciliationEngine.validateStatusTransition(
    item.investigation_status,
    target_status,
    administrative_reason,
    req.user.system_role
  );

  if (!validation.allowed) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  const previousStatus = item.investigation_status;
  item.investigation_status = target_status;
  item.updated_at = new Date().toISOString();

  if (target_status === 'RESOLVED') {
    item.resolved_at = new Date().toISOString();
    item.resolved_by_user_id = req.user.id;
    item.resolution_summary = administrative_reason;
  }

  const noteEntry = {
    id: `RULING-${Date.now()}`,
    timestamp: new Date().toISOString(),
    author: req.user.full_name,
    role: req.user.system_role,
    note: `STATUS RULING: ${previousStatus} → ${target_status}. Reason: ${administrative_reason}`,
    statusChange: target_status
  };

  if (!item.investigation_notes) item.investigation_notes = [];
  item.investigation_notes.unshift(noteEntry);

  // Immutable Audit
  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: `DISCREPANCY_RULING_${target_status}`,
    targetResource: `${item.case_number} (${item.variance_quantity} units)`,
    previousState: { status: previousStatus },
    newState: { status: target_status, reason: administrative_reason }
  });

  return res.json({
    success: true,
    message: `Case ${item.case_number} updated to ${target_status}. Regulatory ruling signed and audited.`,
    discrepancy: item
  });
};

