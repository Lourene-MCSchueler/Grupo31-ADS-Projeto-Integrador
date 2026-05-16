const bcrypt = require('bcryptjs');
const db = require('../src/database');

const medicos = [
  { nome: 'Dra. Ana Lima', email: 'ana@clinica.com', senha: '123456', crm: 'CRM-SP-12345' },
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO medicos (nome, email, senha, crm) VALUES (?, ?, ?, ?)'
);

for (const m of medicos) {
  const hash = bcrypt.hashSync(m.senha, 10);
  insert.run(m.nome, m.email, hash, m.crm);
  console.log(`Médico inserido: ${m.email} / senha: ${m.senha}`);
}

console.log('Seed concluído.');
