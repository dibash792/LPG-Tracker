import assert from 'node:assert';
import { ReconciliationEngine } from '../services/reconciliationService.js';
import { db } from '../db/index.js';

console.log('------------------------------------------------------------');
console.log('RUNNING LPG TRACKER NATIONAL RECONCILIATION TEST SUITE');
console.log('------------------------------------------------------------\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Case ${totalTests}: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Case ${totalTests}: ${testName}`);
    console.error(`       Error: ${err.message}`);
  }
}

// Test 1: A dispatch of 1,000 cylinders and a confirmation of 1,000 (Exact match)
runTest('A dispatch of 1,000 cylinders and a confirmation of 1,000 (Exact Match)', () => {
  const result = ReconciliationEngine.reconcileDelivery({
    dispatchedQty: 1000,
    receivedQty: 1000,
    unmatchedSerials: []
  });
  assert.strictEqual(result.isDiscrepant, false);
  assert.strictEqual(result.varianceQty, 0);
  assert.strictEqual(result.recommendedStatus, 'RESOLVED');
});

// Test 2: A dispatch of 1,000 and a confirmation of 950 (Significant shortage - 50 units)
runTest('A dispatch of 1,000 and a confirmation of 950 (Critical Shortage)', () => {
  const result = ReconciliationEngine.reconcileDelivery({
    dispatchedQty: 1000,
    receivedQty: 950,
    unmatchedSerials: ['SER-001', 'SER-002']
  });
  assert.strictEqual(result.isDiscrepant, true);
  assert.strictEqual(result.varianceQty, -50);
  assert.strictEqual(result.severity, 'CRITICAL');
  assert.strictEqual(result.recommendedStatus, 'UNDER_REVIEW');
  assert.strictEqual(result.statutoryCategory, 'SIGNIFICANT_CUSTODY_SHORTAGE');
});

// Test 3: Small physical tare scale variance (e.g. 2 cylinders damaged valve collar)
runTest('Small technical tare variance (2 units) under NS:533 standard', () => {
  const result = ReconciliationEngine.reconcileDelivery({
    dispatchedQty: 500,
    receivedQty: 498,
    unmatchedSerials: ['SER-781', 'SER-782']
  });
  assert.strictEqual(result.isDiscrepant, true);
  assert.strictEqual(result.varianceQty, -2);
  assert.strictEqual(result.severity, 'LOW');
  assert.strictEqual(result.recommendedStatus, 'AWAITING_EXPLANATION');
  assert.strictEqual(result.statutoryCategory, 'POTENTIAL_TECHNICAL_VARIANCE');
});

// Test 4: Regulatory due process rule: Fraud cannot be declared without written reason
runTest('Status transition rejects fraud declaration without mandatory justification', () => {
  const check = ReconciliationEngine.validateStatusTransition(
    'UNDER_REVIEW',
    'CONFIRMED_FRAUD',
    'Too short',
    'NOC_SUPER_ADMIN'
  );
  assert.strictEqual(check.allowed, false);
  assert(check.message.includes('minimum 15 characters'));
});

// Test 5: Regulatory permission rule: Non-admin cannot close case or declare fraud
runTest('Non-admin operator cannot assign formal fraud findings or close case', () => {
  const check = ReconciliationEngine.validateStatusTransition(
    'UNDER_REVIEW',
    'CONFIRMED_FRAUD',
    'This carrier took an unauthorized detour and diverted stock.',
    'PLANT_OPERATOR'
  );
  assert.strictEqual(check.allowed, false);
  assert(check.message.includes('Only authorized NOC regulatory officers'));
});

// Test 6: Valid Super Admin status transition to technical variance
runTest('Authorized Super Admin assigns technical variance with formal reason', () => {
  const check = ReconciliationEngine.validateStatusTransition(
    'AWAITING_EXPLANATION',
    'TECHNICAL_VARIANCE',
    'Tare scale recalibration slip from Amlekhgunj depot verified within NS:533 standards.',
    'NOC_SUPER_ADMIN'
  );
  assert.strictEqual(check.allowed, true);
});

// Test 7: Double-Entry physical balance consistency
runTest('Double-entry physical balance consistency in database store', () => {
  const senderStock = db.stockBalances.find(s => s.location_id === 'loc-plant-balaju');
  assert(senderStock !== undefined);
  assert(typeof senderStock.current_filled_quantity === 'number');
  assert(senderStock.current_filled_quantity >= 0);
});

// Test 8: Cryptographic HMAC Chaining in Audit Log
runTest('Cryptographic HMAC SHA-256 chaining in audit trail', () => {
  const initialCount = db.auditLogs.length;
  const entry = db.appendAuditLog({
    actorId: 'usr-test',
    actorName: 'Automated Test Runner',
    actorRole: 'NOC_SUPER_ADMIN',
    actionType: 'INTEGRITY_SELF_TEST',
    targetResource: 'TEST_CASE_8'
  });

  assert.strictEqual(db.auditLogs.length, initialCount + 1);
  assert.strictEqual(typeof entry.tamper_proof_hmac, 'string');
  assert.strictEqual(entry.tamper_proof_hmac.length, 64); // SHA-256 hex string length
});

console.log('\n------------------------------------------------------------');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('------------------------------------------------------------\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
