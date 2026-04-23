const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authRequired } = require('../middleware');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, is_admin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.get('/status', async (_req, res) => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  res.json({ registrationOpen: rows[0].n === 0 });
});

// First-ever registration creates the admin. Afterwards an admin must create users.
router.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  if (rows[0].n > 0) return res.status(403).json({ error: 'registration closed' });
  const hash = await bcrypt.hash(password, 10);
  const ins = await pool.query(
    'INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, true) RETURNING id, username, is_admin',
    [username, hash]
  );
  const user = ins.rows[0];
  res.json({ token: signToken(user), user });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const { rows } = await pool.query(
    'SELECT id, username, password_hash, is_admin FROM users WHERE username = $1',
    [username]
  );
  if (rows.length === 0) return res.status(401).json({ error: 'invalid credentials' });
  const row = rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const user = { id: row.id, username: row.username, is_admin: row.is_admin };
  res.json({ token: signToken(user), user });
});

router.get('/me', authRequired, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, is_admin: req.user.is_admin });
});

router.post('/password', authRequired, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword required' });
  }
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'user not found' });
  const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid current password' });
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
