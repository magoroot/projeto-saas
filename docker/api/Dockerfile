# docker/api/Dockerfile
# Build context: raiz do repo (.)
# API: NestJS + Prisma (Postgres externo)

FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copia manifests do workspace
COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

# Instala dependências do monorepo (sem lockfile => npm install)
RUN npm install

FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# Prisma generate + build da API
RUN npm run -w apps/api prisma:generate
RUN npm run -w apps/api build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copia tudo que a API precisa em runtime
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma

EXPOSE 3001

# A API já escuta 3001 no main.ts
CMD ["node", "apps/api/dist/main.js"]
