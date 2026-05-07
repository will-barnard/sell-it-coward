const express = require('express');
const { migrate } = require('./db');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/consignors', require('./routes/consignors'));
app.use('/api/items', require('./routes/items'));
app.use('/api/stats', require('./routes/stats'));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

const port = Number(process.env.PORT) || 3001;

migrate()
  .then(() => app.listen(port, () => console.log(`backend listening on ${port}`)))
  .catch((e) => {
    console.error('migration failed', e);
    process.exit(1);
  });
