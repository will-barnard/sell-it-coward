const jwt = require('jsonwebtoken');

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function authRequired(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'auth required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // ignore — treat as anonymous
    }
  }
  next();
}

function adminRequired(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'admin required' });
  next();
}

module.exports = { authRequired, optionalAuth, adminRequired };
