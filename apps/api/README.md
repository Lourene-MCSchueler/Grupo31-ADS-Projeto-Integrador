# API — Projeto Integrador

Backend REST em Node.js com Express, autenticação via sessão e banco SQLite.

## Tecnologias

- **Express** — servidor HTTP
- **express-session + connect-sqlite3** — sessões persistidas em banco
- **better-sqlite3** — banco de dados SQLite
- **bcryptjs** — hash de senhas

## Estrutura

```
apps/api/
├── scripts/
│   └── seed.js          # Popula o banco com dados de teste
├── src/
│   ├── database.js      # Conexão e criação das tabelas
│   ├── index.js         # Entry point — Express, sessão, rotas
│   ├── middleware/
│   │   └── auth.js      # Middleware de autenticação por sessão
│   └── routes/
│       ├── index.js     # Agrega todas as rotas
│       ├── auth.js      # Rotas de autenticação
│       └── consultas.js # Rotas de consultas
├── banco.db             # Banco principal (gerado automaticamente)
├── sessoes.db           # Sessões (gerado automaticamente)
└── package.json
```

## Tabelas do banco

| Tabela | Descrição |
|--------|-----------|
| `medicos` | Médicos com login no sistema |
| `pacientes` | Pacientes cadastrados |
| `consultas` | Agendamentos vinculando médico e paciente |
| `ausencias` | Registro de ausências de pacientes |

## Como inicializar

**1. Instalar dependências (da raiz do monorepo):**
```bash
npm install
```

**2. Rodar o seed para criar um médico de teste:**
```bash
npm run seed --workspace=apps/api
```

O seed insere o seguinte médico no banco com senha hasheada:

| Campo | Valor |
|-------|-------|
| Email | ana@clinica.com |
| Senha | 123456 |
| CRM | CRM-SP-12345 |

> O seed usa `INSERT OR IGNORE`, então pode ser executado mais de uma vez sem duplicar dados.

**3. Subir o servidor:**
```bash
npm run dev --workspace=apps/api
```

API disponível em `http://localhost:3001`.

## Rotas disponíveis

### Auth

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/api/auth/login` | Login com email e senha | Não |
| `POST` | `/api/auth/logout` | Encerra a sessão | Sim |
| `GET` | `/api/auth/me` | Retorna médico da sessão atual | Sim |

**Body do login:**
```json
{
  "email": "ana@clinica.com",
  "senha": "123456"
}
```

### Consultas

Exige sessão ativa (login realizado).

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/consultas?data=YYYY-MM-DD` | Lista consultas do médico logado na data informada |

**Exemplo de resposta:**
```json
[
  {
    "id": 1,
    "data_hora": "2026-05-16T09:00",
    "status": "agendada",
    "paciente_id": 1,
    "paciente_nome": "João Silva",
    "paciente_telefone": "11991110001"
  }
]
```
