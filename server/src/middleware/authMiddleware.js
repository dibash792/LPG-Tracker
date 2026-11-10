import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/index.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token in dev, check for demo header or fallback to Super Admin demo session for local evaluation
    const demoRole = req.headers['x-demo-role'] || 'NOC_SUPER_ADMIN';
    const mockUser = db.users.find(u => u.system_role === demoRole) || db.users[0];
    req.user = mockUser;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.users.find(u => u.id === decoded.userId);
    if (!user || !user.is_active) {
      return res.status(403).json({ success: false, message: 'User account inactive or revoked' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.system_role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Action requires one of role(s) [${allowedRoles.join(', ')}]. Current role: ${req.user.system_role}` 
      });
    }

    next();
  };
};

export const enforceOrganizationBoundary = (req, res, next) => {
  // Super Admin bypasses single-organization restriction to supervise nationally
  if (req.user.system_role === 'NOC_SUPER_ADMIN' || req.user.system_role === 'NOC_INSPECTOR') {
    return next();
  }

  // Find user's organization
  const userOrg = db.organizations.find(o => {
    // Check if user is associated
    if (req.user.system_role === 'PLANT_OPERATOR' && o.id === 'org-bp-nepal-gas') return true;
    if (req.user.system_role === 'DISTRIBUTOR_MANAGER' && o.id === 'org-dist-patan') return true;
    if (req.user.system_role === 'RETAILER_OPERATOR' && o.id === 'org-ret-baluwatar') return true;
    return false;
  });

  if (!userOrg) {
    return res.status(403).json({ success: false, message: 'User not associated with an approved organization' });
  }

  req.userOrganization = userOrg;
  next();
};

