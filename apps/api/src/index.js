require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SqliteStore = require('connect-sqlite3')(session);

require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  store: new SqliteStore({ db: 'sessoes.db', dir: path.join(__dirname, '..') }),
  secret: process.env.SESSION_SECRET || 'segredo-local',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 },
}));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', require('./routes'));

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
