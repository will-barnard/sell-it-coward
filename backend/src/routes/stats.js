const express = require('express');
const { pool } = require('../db');
const { authRequired } = require('../middleware');

const router = express.Router();

router.get('/', authRequired, async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                          AS total_items,
      COALESCE(SUM(list_price), 0)                          AS total_consigned_value,
      COUNT(*) FILTER (WHERE sold_price IS NOT NULL)::int   AS total_sold,
      COALESCE(SUM(sold_price) FILTER (WHERE sold_price IS NOT NULL), 0) AS total_sold_value,
      COALESCE(SUM(fee), 0)                                 AS total_fees_collected
    FROM items
  `);
  res.json(rows[0]);
});

module.exports = router;
