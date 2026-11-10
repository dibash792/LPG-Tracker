import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/index.js';

export const login = (req, res) => {
  const { phone_number, password, role } = req.body;

  // Search by phone or role for quick testing
  const user = db.users.find(u => 
    (phone_number && u.phone_number === phone_number) ||
    (role && u.system_role === role)
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or phone number not registered' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.system_role, name: user.full_name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  // Audit login
  db.appendAuditLog({
    actorId: user.id,
    actorName: user.full_name,
    actorRole: user.system_role,
    actionType: 'USER_AUTHENTICATION_SUCCESS',
    targetResource: `SESSION_${user.id}`,
    ipAddress: req.ip || '103.10.232.14'
  });

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      phoneNumber: user.phone_number,
      email: user.email,
      role: user.system_role,
    }
  });
};

export const getMe = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

export const registerOrganization = (req, res) => {
  const { legal_name, trade_name, org_type, province_id, district, municipality, ward_number, phone_number, contact_name } = req.body;

  if (!legal_name || !org_type || !province_id || !district) {
    return res.status(400).json({ success: false, message: 'Required registration fields missing' });
  }

  const newOrg = {
    id: `org-app-${Date.now().toString().slice(-4)}`,
    reg_number: `APP-REG-2083-${Math.floor(100 + Math.random() * 900)}`,
    legal_name,
    trade_name: trade_name || legal_name,
    org_type,
    province_id: Number(province_id),
    district,
    municipality: municipality || 'Municipal Ward',
    ward_number: Number(ward_number) || 1,
    address_line: `${district}, Ward ${ward_number}`,
    storage_capacity_cylinders: req.body.storage_capacity_cylinders || 1000,
    compliance_rating: 90.00,
    status: 'PENDING_APPROVAL',
    created_at: new Date().toISOString()
  };

  db.organizations.unshift(newOrg);

  db.appendAuditLog({
    actorId: req.user?.id || 'GUEST_REGISTRAR',
    actorName: contact_name || 'Organization Applicant',
    actorRole: 'APPLICANT',
    actionType: 'ORGANIZATION_REGISTRATION_SUBMITTED',
    targetResource: `${newOrg.id} (${newOrg.trade_name})`,
    newState: { regNumber: newOrg.reg_number, status: 'PENDING_APPROVAL' }
  });

  return res.status(201).json({
    success: true,
    message: 'Organization registration received in PENDING status. Awaiting NOC Board review.',
    organization: newOrg
  });
};
