import { db } from '../db/index.js';

export const listOrganizations = (req, res) => {
  const { type, status, province_id, search } = req.query;

  let results = [...db.organizations];

  if (type && type !== 'ALL') {
    results = results.filter(o => o.org_type === type);
  }
  if (status && status !== 'ALL') {
    results = results.filter(o => o.status === status);
  }
  if (province_id) {
    results = results.filter(o => o.province_id === Number(province_id));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(o => 
      o.trade_name.toLowerCase().includes(q) ||
      o.legal_name.toLowerCase().includes(q) ||
      o.reg_number.toLowerCase().includes(q) ||
      o.district.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    count: results.length,
    organizations: results
  });
};

export const getOrganization = (req, res) => {
  const org = db.organizations.find(o => o.id === req.params.id);
  if (!org) {
    return res.status(404).json({ success: false, message: 'Organization not found' });
  }
  return res.json({ success: true, organization: org });
};

export const approveOrganization = (req, res) => {
  const org = db.organizations.find(o => o.id === req.params.id);
  if (!org) {
    return res.status(404).json({ success: false, message: 'Organization not found' });
  }

  const { formal_reason, statutory_reference } = req.body;
  if (!formal_reason || formal_reason.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Mandatory statutory approval reasoning required.' });
  }

  const previousState = { status: org.status };
  org.status = 'ACTIVE';
  org.license_expiry_date = req.body.license_expiry_date || '2028-04-13';

  // Audit
  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: 'ORG_LICENSE_APPROVED_BY_NOC',
    targetResource: `${org.id} (${org.trade_name})`,
    previousState,
    newState: { status: 'ACTIVE', reason: formal_reason, ref: statutory_reference }
  });

  return res.json({
    success: true,
    message: `Operating license granted to ${org.trade_name}.`,
    organization: org
  });
};

export const rejectOrganization = (req, res) => {
  const org = db.organizations.find(o => o.id === req.params.id);
  if (!org) {
    return res.status(404).json({ success: false, message: 'Organization not found' });
  }

  const { formal_reason } = req.body;
  if (!formal_reason || formal_reason.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Written rejection grounds required.' });
  }

  const previousState = { status: org.status };
  org.status = 'INACTIVE';

  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: 'ORG_REGISTRATION_REJECTED',
    targetResource: `${org.id} (${org.trade_name})`,
    previousState,
    newState: { status: 'INACTIVE', reason: formal_reason }
  });

  return res.json({
    success: true,
    message: `Registration application for ${org.trade_name} rejected.`,
    organization: org
  });
};

export const toggleSuspension = (req, res) => {
  const org = db.organizations.find(o => o.id === req.params.id);
  if (!org) {
    return res.status(404).json({ success: false, message: 'Organization not found' });
  }

  const { formal_reason } = req.body;
  const newStatus = org.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
  const previousState = { status: org.status };
  org.status = newStatus;

  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: newStatus === 'SUSPENDED' ? 'ORG_LICENSE_SUSPENDED' : 'ORG_LICENSE_REINSTATED',
    targetResource: `${org.id} (${org.trade_name})`,
    previousState,
    newState: { status: newStatus, reason: formal_reason || 'NOC Administrative Order' }
  });

  return res.json({
    success: true,
    message: `Organization ${org.trade_name} status updated to ${newStatus}.`,
    organization: org
  });
};
