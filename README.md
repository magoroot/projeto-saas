# Projeto SaaS – Plataforma de Análise Técnica

MVP de uma plataforma SaaS para análise técnica de mercado financeiro, com foco em gráficos, indicadores e setups de traders.

## Visão geral
- **Frontend**: Next.js (`apps/web`)
- **Backend**: NestJS (`apps/api`)
- **Banco de dados**: PostgreSQL
- **ORM**: Prisma

## Pré-requisitos
- **Node.js** 18+ (recomendado 20+)
- **npm** 9+
- **PostgreSQL** 14+

## Estrutura do repositório
```
apps/
  api/   # NestJS + Prisma
  web/   # Next.js
```

## Configuração de ambiente
Crie um arquivo `.env` em `apps/api` com a conexão do banco e segredos:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/projeto_saas"
JWT_SECRET="troque-este-segredo"
ADMIN_EMAIL="admin@projeto.com"
ADMIN_PASSWORD="senha-forte"
WEB_ORIGIN="http://localhost:3000"
```

## Instalação
Na raiz do repositório:

```
npm install
```

> Se o ambiente bloquear acesso ao registry, instale as dependências manualmente no ambiente local.

## Prisma (migrations e client)
A partir de `apps/api`:

```
cd apps/api
npm run prisma:generate
npm run prisma:migrate:deploy
```

## Seed automático (bootstrap)
No start da API o seed roda automaticamente:
- Cria planos **Starter/Pro/Prime** se não existirem.
- Cria indicadores **MA/RSI/MACD** se não existirem.
- Cria vínculos Plan ↔ Indicators.
- Cria um usuário **ADMIN** com `ADMIN_EMAIL`/`ADMIN_PASSWORD` caso não exista.

Opcional (admin):
```
POST /api/admin/seed/reseed
```

## Subindo o backend (NestJS)
Na raiz:

```
npm run dev:api
```

O backend ficará disponível em `http://localhost:3001/api`.

## Subindo o frontend (Next.js)
Na raiz:

```
npm run dev:web
```

O frontend ficará disponível em `http://localhost:3000`.

## Endpoints principais (API)
Autenticação (cookies httpOnly):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Planos/Indicadores:
- `GET /api/plans`
- `GET /api/indicators`

Setups (protegido por JWT):
- `POST /api/setups`
- `GET /api/setups`
- `GET /api/setups/:id`
- `PATCH /api/setups/:id`
- `DELETE /api/setups/:id`

Assinaturas:
- `GET /api/subscriptions/active`
- `POST /api/subscriptions/select`

Admin (role ADMIN):
- `POST /api/plans`
- `PATCH /api/plans/:id`
- `DELETE /api/plans/:id`
- `POST /api/plans/:id/indicators`
- `POST /api/indicators`
- `PATCH /api/indicators/:id`
- `DELETE /api/indicators/:id`
- `GET /api/users`
- `PATCH /api/users/:id/status`
- `PATCH /api/users/:id/plan`
- `GET /api/admin/audit`

## Observações de escopo
- A plataforma **não executa trades**.
- Não integra com corretoras nem solicita credenciais.
- O objetivo é **análise técnica** com indicadores e setups persistidos.

## Fluxo do produto (MVP)
- Sem login → redireciona para `/login`.
- Após login → `/app` (dashboard).
- Menu Admin aparece apenas para `ADMIN`.
