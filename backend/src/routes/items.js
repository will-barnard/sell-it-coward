const express = require('express');
const { pool } = require('../db');
const { authRequired, optionalAuth } = require('../middleware');

const router = express.Router();

// Public list hides consignor PII; authed list includes full consignor details.
router.get('/', optionalAuth, async (req, res) => {
  const search = (req.query.search || '').trim();
  if (req.user) {
    const params = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = 'WHERE i.description ILIKE $1 OR c.name ILIKE $1';
    }
    const { rows } = await pool.query(
      `SELECT i.id, i.description, i.list_price, i.low_price, i.sold_price, i.picked_up, i.fee,
              i.consignor_id, c.name AS consignor_name, c.email AS consignor_email,
              c.mobile_phone AS consignor_phone, c.street_address, c.city, c.state, c.zip
       FROM items i JOIN consignors c ON c.id = i.consignor_id
       ${where} ORDER BY i.id DESC`,
      params
    );
    return res.json(rows);
  }
  const params = [];
  let where = '';
  if (search) {
    params.push(`%${search}%`);
    where = 'WHERE description ILIKE $1';
  }
  const { rows } = await pool.query(
    `SELECT id, description, list_price, sold_price IS NOT NULL AS sold
     FROM items ${where} ORDER BY id DESC`,
    params
  );
  res.json(rows);
});

router.get('/:id', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT i.*, c.name AS consignor_name
     FROM items i JOIN consignors c ON c.id = i.consignor_id
     WHERE i.id = $1`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.post('/', authRequired, async (req, res) => {
  const { consignor_id, description, list_price, low_price, sold_price, picked_up, fee } = req.body || {};
  if (!consignor_id || !description) {
    return res.status(400).json({ error: 'consignor_id and description required' });
  }
  const ins = await pool.query(
    `INSERT INTO items (consignor_id, description, list_price, low_price, sold_price, picked_up, fee)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [consignor_id, description, list_price ?? null, low_price ?? null, sold_price ?? null, !!picked_up, fee ?? 5]
  );
  res.json(ins.rows[0]);
});

router.put('/:id', authRequired, async (req, res) => {
  const { description, list_price, low_price, sold_price, picked_up, fee } = req.body || {};
  if (!description) return res.status(400).json({ error: 'description required' });
  const upd = await pool.query(
    `UPDATE items SET description=$1, list_price=$2, low_price=$3, sold_price=$4, picked_up=$5, fee=$6
     WHERE id=$7 RETURNING *`,
    [description, list_price ?? null, low_price ?? null, sold_price ?? null, !!picked_up, fee ?? 5, req.params.id]
  );
  if (upd.rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(upd.rows[0]);
});

router.delete('/:id', authRequired, async (req, res) => {
  await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
