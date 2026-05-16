const bcrypt = require('bcryptjs');
const db = require('../database');

module.exports = (router) => {
  router.post('/auth/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const medico = db.prepare('SELECT * FROM medicos WHERE email = ?').get(email);

    if (!medico || !bcrypt.compareSync(senha, medico.senha)) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    req.session.medicoId = medico.id;
    req.session.medicoNome = medico.nome;

    res.json({ id: medico.id, nome: medico.nome, crm: medico.crm });
  });

  router.post('/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  router.get('/auth/me', (req, res) => {
    if (!req.session.medicoId) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }
    res.json({ id: req.session.medicoId, nome: req.session.medicoNome });
  });
};
