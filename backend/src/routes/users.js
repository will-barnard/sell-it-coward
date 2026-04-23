const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { authRequired, adminRequired } = require('../middleware');

const router = express.Router();
router.use(authRequired, adminRequired);

router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, username, is_admin, created_at FROM users ORDER BY id'
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { username, password, is_admin } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const ins = await pool.query(
      `INSERT INTO users (username, password_hash, is_admin)
       VALUES ($1, $2, $3)
       RETURNING id, username, is_admin, created_at`,
      [username, hash, !!is_admin]
    );
    res.json(ins.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'username already exists' });
    throw e;
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'cannot delete yourself' });
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ ok: true });
});

module.exports = router;
