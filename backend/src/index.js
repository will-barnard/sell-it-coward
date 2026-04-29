const express = require('express');
const { migrate } = require('./db');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/consignors', require('./routes/consignors'));
app.use('/api/items', require('./routes/items'));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

const port = Number(process.env.PORT) || 3001;

async function startWithRetry(maxAttempts = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await migrate();
      app.listen(port, () => console.log(`backend listening on ${port}`));
      return;
    } catch (e) {
      console.error(`migration failed (attempt ${attempt}/${maxAttempts})`, e.message);
      if (attempt === maxAttempts) {
        console.error('giving up after max attempts');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

startWithRetry();
