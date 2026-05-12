require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Rotas serão adicionadas aqui

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
