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
Crie um arquivo `.env` em `apps/api` com a conexão do banco:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/projeto_saas"
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
npx prisma generate
npx prisma migrate dev --name init
```

## Seeds iniciais (sugestão)
O `schema.prisma` contém sugestões para seed: criar planos **Starter/Pro/Prime**, indicadores clássicos (SMA, EMA, RSI, MACD), indicadores proprietários básicos, relacionar planos ↔ indicadores e criar usuários **ADMIN/SUPPORT** iniciais.

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
- `POST /api/plans` – criar plano (requer header `x-actor-user-id`)
- `GET /api/plans` – listar planos
- `GET /api/plans/:id` – obter plano
- `PATCH /api/plans/:id` – atualizar plano (requer header `x-actor-user-id`)
- `DELETE /api/plans/:id` – remover plano (requer header `x-actor-user-id`)

- `POST /api/setups` – criar setup (requer header `x-user-id`)
- `GET /api/setups` – listar setups do usuário (requer header `x-user-id`)
- `GET /api/setups/:id` – obter setup (requer header `x-user-id`)
- `PATCH /api/setups/:id` – atualizar setup (requer header `x-user-id`)
- `DELETE /api/setups/:id` – remover setup (requer header `x-user-id`)

## Observações de escopo
- A plataforma **não executa trades**.
- Não integra com corretoras nem solicita credenciais.
- O objetivo é **análise técnica** com indicadores e setups persistidos.
