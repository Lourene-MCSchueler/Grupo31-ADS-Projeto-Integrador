# Web — Frontend

Este workspace é reservado para o frontend do projeto.

## Como usar

1. Escolha o framework (React, Vue, Next.js, etc.)
2. Inicialize o projeto aqui dentro: `apps/web/`
3. Atualize o `package.json` com os scripts corretos (`dev`, `build`)
4. O Turborepo vai orquestrar o build junto com a API automaticamente

## API

A API roda em `http://localhost:3001`.

Endpoints disponíveis:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Verifica se a API está no ar |
| POST | `/api/auth/login` | Login do médico — retorna JWT |
| GET | `/api/consultas?data=YYYY-MM-DD` | Lista consultas do médico por data |
| POST | `/api/consultas` | Cadastra nova consulta |
| POST | `/api/ausencias` | Registra ausência e dispara e-mails |

## Autenticação

Todas as rotas (exceto `/api/auth/login`) exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido no login.
