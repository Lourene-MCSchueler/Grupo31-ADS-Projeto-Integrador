# Frontend - Ausencia Medica

Aplicacao React/Vite para a PoC do Grupo 31. O front cobre o MVP descrito no projeto:

- Login do medico
- Dashboard basico
- Consulta de agenda por data
- Registro de ausencia medica
- Selecao de consultas afetadas para notificacao simulada pela API

## Rodando localmente

Na raiz do repositorio:

```bash
npm run dev --workspace web
```

O Vite sobe em `http://localhost:5173`.

## Integracao com a API

As chamadas usam o prefixo `/api` e passam pelo proxy do Vite para `http://localhost:3001`.
