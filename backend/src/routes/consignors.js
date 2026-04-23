const express = require('express');
const { pool } = require('../db');
const { authRequired } = require('../middleware');

const router = express.Router();
router.use(authRequired);

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM consignors ORDER BY name');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, street_address, city, state, zip, mobile_phone, email } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const ins = await pool.query(
    `INSERT INTO consignors (name, street_address, city, state, zip, mobile_phone, email)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, street_address, city, state, zip, mobile_phone, email]
  );
  res.json(ins.rows[0]);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM consignors WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, street_address, city, state, zip, mobile_phone, email } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const upd = await pool.query(
    `UPDATE consignors
     SET name=$1, street_address=$2, city=$3, state=$4, zip=$5, mobile_phone=$6, email=$7
     WHERE id=$8 RETURNING *`,
    [name, street_address, city, state, zip, mobile_phone, email, req.params.id]
  );
  if (upd.rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(upd.rows[0]);
});

module.exports = router;
