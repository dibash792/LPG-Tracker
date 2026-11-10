import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import * as authCtrl from '../controllers/authController.js';
import * as orgCtrl from '../controllers/organizationController.js';
import * as dispatchCtrl from '../controllers/dispatchController.js';
import * as receivingCtrl from '../controllers/receivingController.js';
import * as discrepancyCtrl from '../controllers/discrepancyController.js';
import * as stockCtrl from '../controllers/stockController.js';
import * as publicCtrl from '../controllers/publicController.js';
import * as auditCtrl from '../controllers/auditController.js';
import * as reportCtrl from '../controllers/reportController.js';

const router = express.Router();

// 1. Authentication & Onboarding
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticateToken, authCtrl.getMe);
router.post('/auth/register-organization', authCtrl.registerOrganization);

// 2. Organizations & Licensing
router.get('/organizations', authenticateToken, orgCtrl.listOrganizations);
router.get('/organizations/:id', authenticateToken, orgCtrl.getOrganization);
router.post('/organizations/:id/approve', authenticateToken, requireRole(['NOC_SUPER_ADMIN']), orgCtrl.approveOrganization);
router.post('/organizations/:id/reject', authenticateToken, requireRole(['NOC_SUPER_ADMIN']), orgCtrl.rejectOrganization);
router.post('/organizations/:id/toggle-suspension', authenticateToken, requireRole(['NOC_SUPER_ADMIN']), orgCtrl.toggleSuspension);

// 3. Dispatches
router.post('/dispatches', authenticateToken, dispatchCtrl.createDispatch);
router.get('/dispatches', authenticateToken, dispatchCtrl.listDispatches);
router.get('/dispatches/:identifier', authenticateToken, dispatchCtrl.getDispatchByCodeOrQR);

// 4. Receiving & Reconciliation
router.post('/receiving/confirm', authenticateToken, receivingCtrl.confirmReceiving);

// 5. Discrepancy Cases
router.get('/discrepancies', authenticateToken, discrepancyCtrl.listDiscrepancies);
router.get('/discrepancies/:id', authenticateToken, discrepancyCtrl.getDiscrepancy);
router.post('/discrepancies/:id/notes', authenticateToken, discrepancyCtrl.addInvestigationNote);
router.post('/discrepancies/:id/status', authenticateToken, discrepancyCtrl.transitionStatus);

// 6. Stock Balances
router.get('/stock/balances', authenticateToken, stockCtrl.getStockBalances);
router.post('/stock/adjust', authenticateToken, stockCtrl.recordStockAdjustment);

// 7. Public Availability & Grievance (Accessible without auth token)
router.get('/public/availability', publicCtrl.getPublicAvailability);
router.post('/public/complaints', publicCtrl.submitCitizenComplaint);

// 8. Audit Ledger
router.get('/audit/logs', authenticateToken, requireRole(['NOC_SUPER_ADMIN', 'NOC_INSPECTOR']), auditCtrl.getAuditLogs);
router.get('/audit/verify', authenticateToken, auditCtrl.verifyAuditLedgerIntegrity);

// 9. Reports & Analytics
router.get('/reports/overview', authenticateToken, reportCtrl.getNationalOverviewMetrics);
router.get('/reports/provinces', authenticateToken, reportCtrl.getProvincialQuotas);

export default router;

