import { db } from '../db/index.js';

export const getStockBalances = (req, res) => {
  const { location_id, organization_id } = req.query;

  let balances = [...db.stockBalances];

  if (location_id) {
    balances = balances.filter(s => s.location_id === location_id);
  }

  // Enrich with location and category details
  const enriched = balances.map(b => {
    const loc = db.locations.find(l => l.id === b.location_id);
    const cat = db.cylinderCategories.find(c => c.id === b.cylinder_category_id);
    return {
      ...b,
      location_name: loc?.name || 'Warehouse',
      category_name: cat?.name_en || 'Domestic 14.2kg'
    };
  });

  return res.json({ success: true, count: enriched.length, stockBalances: enriched });
};

export const recordStockAdjustment = (req, res) => {
  const { location_id, cylinder_category_id, adjusted_quantity, mandatory_reason } = req.body;

  if (!location_id || adjusted_quantity === undefined || !mandatory_reason || mandatory_reason.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Location ID, new count, and mandatory written justification required.' });
  }

  const stock = db.stockBalances.find(s => 
    s.location_id === location_id && 
    (cylinder_category_id ? s.cylinder_category_id === cylinder_category_id : true)
  );

  if (!stock) {
    return res.status(404).json({ success: false, message: 'Stock balance record for location not found' });
  }

  const previousQty = stock.current_filled_quantity;
  const newQty = Number(adjusted_quantity);
  const delta = newQty - previousQty;

  stock.current_filled_quantity = newQty;
  stock.last_movement_at = new Date().toISOString();

  // Audit
  db.appendAuditLog({
    actorId: req.user.id,
    actorName: req.user.full_name,
    actorRole: req.user.system_role,
    actionType: 'PHYSICAL_STOCK_AUDIT_ADJUSTMENT',
    targetResource: `LOC_${location_id}_COUNT`,
    previousState: { filled: previousQty },
    newState: { filled: newQty, delta, reason: mandatory_reason }
  });

  return res.json({
    success: true,
    message: `Stock level adjusted from ${previousQty} to ${newQty} cylinders.`,
    stock
  });
};
