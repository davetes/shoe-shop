const db = require('../config/db');

async function dashboard(date) {
  const totals = await db.query(
    `SELECT payment_method, COALESCE(SUM(total_amount), 0) AS total
     FROM sales WHERE created_at >= $1::date AND created_at < ($1::date + INTERVAL '1 day')
     GROUP BY payment_method`,
    [date]
  );
  const cashiers = await db.query(
    `SELECT u.full_name, s.name AS store_name, COUNT(sa.id)::int AS sale_count,
            COALESCE(SUM(sa.total_amount), 0) AS total,
            COALESCE(SUM(CASE WHEN sa.payment_method = 'CASH' THEN sa.total_amount ELSE 0 END), 0) AS cash_total,
            COALESCE(SUM(CASE WHEN sa.payment_method = 'BANK_TRANSFER' THEN sa.total_amount ELSE 0 END), 0) AS bank_total
     FROM users u JOIN stores s ON s.id = u.store_id LEFT JOIN sales sa
       ON sa.cashier_id = u.id AND sa.created_at >= $1::date AND sa.created_at < ($1::date + INTERVAL '1 day')
     WHERE u.role = 'CASHIER' GROUP BY u.id, u.full_name, s.name ORDER BY u.full_name`,
    [date]
  );
  const alerts = await db.query(
    `SELECT i.store_id, s.name AS store_name, i.product_id, p.name, p.size, p.color,
            i.quantity, s.low_stock_threshold
     FROM inventory i JOIN stores s ON s.id = i.store_id JOIN products p ON p.id = i.product_id
     WHERE i.quantity < s.low_stock_threshold ORDER BY i.quantity ASC`
  );
  return { totals: totals.rows, cashiers: cashiers.rows, alerts: alerts.rows };
}

module.exports = { dashboard };
