const bcrypt = require('bcryptjs');
const db = require('../src/database');

// Médicos
const insertMedico = db.prepare(
  'INSERT OR IGNORE INTO medicos (nome, email, senha, crm) VALUES (?, ?, ?, ?)'
);

const medicos = [
  { nome: 'Dra. Ana Lima', email: 'ana@clinica.com', senha: '123456', crm: 'CRM-SP-12345' },
];

for (const m of medicos) {
  const hash = bcrypt.hashSync(m.senha, 10);
  insertMedico.run(m.nome, m.email, hash, m.crm);
  console.log(`Médico: ${m.email} / senha: ${m.senha}`);
}

// Pacientes
const insertPaciente = db.prepare(
  'INSERT OR IGNORE INTO pacientes (nome, email, telefone) VALUES (?, ?, ?)'
);

const pacientes = [
  { nome: 'João Silva',    email: 'joao@email.com',   telefone: '11991110001' },
  { nome: 'Maria Souza',   email: 'maria@email.com',  telefone: '11991110002' },
  { nome: 'Carlos Pereira',email: 'carlos@email.com', telefone: '11991110003' },
  { nome: 'Fernanda Lima', email: 'fer@email.com',    telefone: '11991110004' },
];

for (const p of pacientes) {
  insertPaciente.run(p.nome, p.email, p.telefone);
  console.log(`Paciente: ${p.nome}`);
}

// Consultas
const medico = db.prepare('SELECT id FROM medicos WHERE email = ?').get('ana@clinica.com');
const getPaciente = db.prepare('SELECT id FROM pacientes WHERE email = ? LIMIT 1');

const insertConsulta = db.prepare(
  'INSERT OR IGNORE INTO consultas (paciente_id, medico_id, data_hora) VALUES (?, ?, ?)'
);

const consultas = [
  { data_hora: '2026-05-16T09:00', paciente_email: 'joao@email.com' },
  { data_hora: '2026-05-16T10:30', paciente_email: 'maria@email.com' },
  { data_hora: '2026-05-17T08:00', paciente_email: 'carlos@email.com' },
  { data_hora: '2026-05-17T14:00', paciente_email: 'fer@email.com' },
  { data_hora: '2026-05-18T09:00', paciente_email: 'joao@email.com' },
  { data_hora: '2026-05-18T11:00', paciente_email: 'maria@email.com' },
  { data_hora: '2026-05-19T10:00', paciente_email: 'carlos@email.com' },
  { data_hora: '2026-05-19T15:30', paciente_email: 'fer@email.com' },
];

for (const c of consultas) {
  const paciente = getPaciente.get(c.paciente_email);
  if (!paciente || !medico) continue;
  const { changes } = insertConsulta.run(paciente.id, medico.id, c.data_hora);
  if (changes) console.log(`Consulta: ${c.data_hora} — paciente ${c.paciente_email}`);
}

console.log('Seed concluído.');
