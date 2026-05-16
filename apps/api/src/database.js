const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'banco.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS medicos (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nome    TEXT NOT NULL,
    email   TEXT UNIQUE NOT NULL,
    senha   TEXT NOT NULL,
    crm     TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pacientes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT NOT NULL,
    email     TEXT UNIQUE,
    telefone  TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);

  CREATE TABLE IF NOT EXISTS consultas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    medico_id   INTEGER NOT NULL REFERENCES medicos(id),
    data_hora   TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'agendada'
                CHECK(status IN ('agendada', 'realizada', 'ausente'))
  );

  CREATE TABLE IF NOT EXISTS ausencias (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    consulta_id INTEGER NOT NULL REFERENCES consultas(id),
    criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_consultas_unica
    ON consultas(paciente_id, medico_id, data_hora);
`);

module.exports = db;
