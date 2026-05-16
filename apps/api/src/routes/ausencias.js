const db = require('../database');
const auth = require('../middleware/auth');

module.exports = (router) => {
  router.post('/ausencias', auth, (req, res) => {
    const { consulta_ids } = req.body;

    if (!Array.isArray(consulta_ids) || consulta_ids.length === 0) {
      return res.status(400).json({ erro: 'consulta_ids deve ser um array não vazio.' });
    }

    const placeholders = consulta_ids.map(() => '?').join(', ');

    const consultas = db.prepare(`
      SELECT c.id, c.status, p.nome AS paciente_nome, p.telefone AS paciente_telefone
      FROM consultas c
      JOIN pacientes p ON p.id = c.paciente_id
      WHERE c.id IN (${placeholders}) AND c.medico_id = ?
    `).all(...consulta_ids, req.session.medicoId);

    const naoEncontradas = consulta_ids.filter(id => !consultas.find(c => c.id === id));
    if (naoEncontradas.length > 0) {
      return res.status(404).json({ erro: 'Consultas não encontradas ou sem permissão.', ids: naoEncontradas });
    }

    const jaProcessadas = consultas.filter(c => c.status !== 'agendada');
    if (jaProcessadas.length > 0) {
      return res.status(409).json({
        erro: 'Algumas consultas já possuem status diferente de agendada.',
        consultas: jaProcessadas.map(c => ({ id: c.id, status: c.status })),
      });
    }

    const marcarTodas = db.transaction(() => {
      for (const consulta of consultas) {
        db.prepare("UPDATE consultas SET status = 'ausente' WHERE id = ?").run(consulta.id);
        db.prepare('INSERT INTO ausencias (consulta_id) VALUES (?)').run(consulta.id);

        console.log(
          `[WhatsApp] Aviso ao paciente ${consulta.paciente_nome} (${consulta.paciente_telefone}): ` +
          `sua consulta (id ${consulta.id}) foi cancelada por ausência do médico.`
        );
      }
    });

    marcarTodas();

    res.json({ mensagem: `Médico marcado como ausente. ${consultas.length} paciente(s) notificado(s).`, consulta_ids });
  });
};
