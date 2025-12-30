# docker/api/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Copia manifests do workspace
COPY package.json ./
COPY apps/api/package.json apps/api/package.json

# Instala deps (monorepo workspace)
RUN npm install

# Copia código
COPY apps/api apps/api

# Prisma generate + build
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Remove dev deps (pra runtime ficar menor)
WORKDIR /app
RUN npm prune --omit=dev

# Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma

EXPOSE 3001

# Sobe e "empurra" schema (como não há migrations no repo)
CMD sh -c "cd /app/apps/api && npx prisma db push && node dist/main.js"
