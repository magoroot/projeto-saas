# docker/web/Dockerfile
# Build context: raiz do repo (.)

FROM node:20-bookworm-slim AS build
WORKDIR /app

# Certificados (útil para installs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copia manifests do workspace
COPY package.json ./
COPY apps/web/package.json apps/web/package.json

RUN npm install

# Copia código do WEB
COPY apps/web apps/web

# Build do Next
WORKDIR /app/apps/web
RUN npm run build

# Remove dev deps
WORKDIR /app
RUN npm prune --omit=dev


FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web /app/apps/web

EXPOSE 3000

CMD ["sh", "-c", "cd /app/apps/web && npm run start"]
