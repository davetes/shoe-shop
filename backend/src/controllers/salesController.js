const { createSale, db } = require('../models/salesModel');
const { httpError } = require('../utils/errorHandler');

async function create(req, res) {
  if (req.user.role !== 'CASHIER') throw httpError('Only cashiers can register sales', 403);
  const { paymentMethod, items } = req.body;
  if (!['CASH', 'BANK_TRANSFER'].includes(paymentMethod) || !Array.isArray(items) || !items.length) throw httpError('Valid paymentMethod and items are required');
  const normalized = items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
    unitPrice: item.unitPrice === undefined || item.unitPrice === '' ? undefined : Number(item.unitPrice)
  }));
  if (normalized.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity <= 0 || (item.unitPrice !== undefined && (!Number.isFinite(item.unitPrice) || item.unitPrice <= 0)))) throw httpError('Each item needs a productId, positive integer quantity, and positive sale price');
  res.status(201).json(await createSale({ storeId: req.user.storeId, cashierId: req.user.id, paymentMethod, items: normalized }));
}

async function list(req, res) {
  const storeId = req.user.role === 'OWNER' ? (req.query.storeId || null) : req.user.storeId;
  const cashierId = req.user.role === 'CASHIER' ? req.user.id : (req.query.cashierId || null);
  const fromDate = req.query.from || null;
  const toDate = req.query.to || null;
  const result = await db.query(
    `SELECT sa.id, sa.total_amount, sa.payment_method, sa.created_at, s.name AS store_name, u.full_name AS cashier_name,
            json_agg(json_build_object('productId', si.product_id, 'name', p.name, 'size', p.size,
              'color', p.color, 'quantity', si.quantity, 'unitPrice', si.unit_price)) AS items
     FROM sales sa JOIN stores s ON s.id = sa.store_id JOIN users u ON u.id = sa.cashier_id
     JOIN sale_items si ON si.sale_id = sa.id JOIN products p ON p.id = si.product_id
     WHERE ($1::int IS NULL OR sa.store_id = $1)
       AND ($2::uuid IS NULL OR sa.cashier_id = $2)
       AND ($3::date IS NULL OR sa.created_at >= $3::date)
       AND ($4::date IS NULL OR sa.created_at < ($4::date + INTERVAL '1 day'))
     GROUP BY sa.id, s.name, u.full_name ORDER BY sa.created_at DESC LIMIT 200`,
    [storeId, cashierId, fromDate, toDate]
  );
  res.json(result.rows);
}

module.exports = { create, list };
