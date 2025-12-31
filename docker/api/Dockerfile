# docker/api/Dockerfile
# Objetivo: build estável com Prisma (evita treta de OpenSSL do Alpine)
# Build context: raiz do repo (.)

FROM node:20-bookworm-slim AS build
WORKDIR /app

# Dependências do sistema (openssl é importante p/ Prisma)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copia manifests do workspace
COPY package.json ./
COPY apps/api/package.json apps/api/package.json

# Instala deps do monorepo (inclui prisma/nest do workspace)
RUN npm install

# Copia código do API
COPY apps/api apps/api

# Prisma generate + build
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Remove dev deps para runtime ficar menor
WORKDIR /app
RUN npm prune --omit=dev


FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# Dependências do sistema no runtime também
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

# Copia apenas o necessário para runtime
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma

EXPOSE 3001

# Observação:
# - Em Homelab, db push é OK para levantar rápido.
# - Em produção, prefira migrations (prisma migrate deploy).
CMD ["sh", "-c", "cd /app/apps/api && npx prisma db push && node dist/main.js"]
