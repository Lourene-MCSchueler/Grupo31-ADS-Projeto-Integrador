const db = require('../database');
const auth = require('../middleware/auth');

module.exports = (router) => {
  router.get('/consultas', auth, (req, res) => {
    const { data } = req.query;

    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return res.status(400).json({ erro: 'Parâmetro data é obrigatório (formato: YYYY-MM-DD).' });
    }

    const rows = db.prepare(`
      SELECT c.id, c.data_hora, c.status,
             p.id AS paciente_id, p.nome AS paciente_nome, p.telefone AS paciente_telefone
      FROM consultas c
      JOIN pacientes p ON p.id = c.paciente_id
      WHERE c.medico_id = ? AND c.data_hora LIKE ?
      ORDER BY c.data_hora
    `).all(req.session.medicoId, `${data}%`);

    res.json(rows);
  });

};
