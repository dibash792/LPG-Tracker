import crypto from 'node:crypto';
import { db } from '../db/index.js';

export const createDispatch = (req, res) => {
  const {
    receiver_organization_id,
    sender_location_id,
    receiver_location_id,
    vehicle_registration_number,
    driver_name,
    driver_phone,
    tamper_seal_barcode,
    items // array of { cylinder_category_id, quantity, serials }
  } = req.body;

  if (!receiver_organization_id || !vehicle_registration_number || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Mandatory dispatch parameters missing.' });
  }

  // Verify receiver exists
  const receiverOrg = db.organizations.find(o => o.id === receiver_organization_id);
  if (!receiverOrg) {
    return res.status(404).json({ success: false, message: 'Receiver organization not found in NOC registry.' });
  }

  // Determine sender org
  const senderOrgId = req.userOrganization?.id || req.body.sender_organization_id || 'org-bp-nepal-gas';
  const senderOrg = db.organizations.find(o => o.id === senderOrgId);

  const dispatchCode = `DSP-2083-${Math.floor(10000 + Math.random() * 90000)}`;
  const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const qrCode = `QR-NOC-${dispatchCode}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const newDispatch = {
    id: crypto.randomUUID(),
    dispatch_code: dispatchCode,
    sender_organization_id: senderOrgId,
    receiver_organization_id,
    sender_name: senderOrg?.trade_name || 'Sending Facility',
    receiver_name: receiverOrg.trade_name,
    sender_location_id: sender_location_id || 'loc-plant-balaju',
    receiver_location_id: receiver_location_id || 'loc-dist-patan',
    dispatched_at: new Date().toISOString(),
    vehicle_registration_number,
    driver_name: driver_name || 'Designated Carrier Driver',
    driver_phone: driver_phone || '98XXXXXXXX',
    tamper_seal_barcode: tamper_seal_barcode || `SEAL-NP-${Math.floor(10000 + Math.random() * 90000)}`,
    authorized_by_user_id: req.user.id,
    dispatch_status: 'IN_TRANSIT',
    qr_verification_code: qrCode,
    total_quantity: totalQty,
    items
  };

  db.dispatches.unshift(newDispatch);

  // Update Stock Balances (Double-Entry: decrement sender stock, add to in-transit)
  const senderStock = db.stockBalances.find(s => s.location_id === newDispatch.sender_location_id);
  if (senderStock) {
    senderStock.current_filled_quantity = Math.max(0, senderStock.current_filled_quantity - totalQty);
  }

  const receiverStock = db.stockBalances.find(s => s.location_id === newDispatch.receiver_location_id);
  if (receiverStock) {
    receiverStock.in_transit_inbound_quantity = (receiverStock.in_transit_inbound_quantity || 0) + totalQty;
  }

  // Audit
  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: 'DISPATCH_CONSIGNMENT_CREATED',
    targetResource: `${dispatchCode} (${totalQty} units)`,
    newState: {
      from: senderOrg?.trade_name,
      to: receiverOrg.trade_name,
      vehicle: vehicle_registration_number,
      seal: newDispatch.tamper_seal_barcode
    }
  });

  return res.status(201).json({
    success: true,
    message: `Consignment ${dispatchCode} dispatched and sealed.`,
    dispatch: newDispatch
  });
};

export const listDispatches = (req, res) => {
  const { status, sender_id, receiver_id } = req.query;
  let results = [...db.dispatches];

  if (status && status !== 'ALL') {
    results = results.filter(d => d.dispatch_status === status);
  }
  if (sender_id) {
    results = results.filter(d => d.sender_organization_id === sender_id);
  }
  if (receiver_id) {
    results = results.filter(d => d.receiver_organization_id === receiver_id);
  }

  return res.json({
    success: true,
    count: results.length,
    dispatches: results
  });
};

export const getDispatchByCodeOrQR = (req, res) => {
  const { identifier } = req.params;
  const dispatch = db.dispatches.find(d => 
    d.dispatch_code === identifier || d.qr_verification_code === identifier || d.id === identifier
  );

  if (!dispatch) {
    return res.status(404).json({ success: false, message: 'Consignment not found' });
  }

  return res.json({ success: true, dispatch });
};
