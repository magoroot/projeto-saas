# docker/web/Dockerfile
# Build context: raiz do repo (.)
# Web: Next.js

FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json

RUN npm install

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# Base URL padrão para produção (mesmo host via Ingress)
ARG NEXT_PUBLIC_API_BASE_URL=/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run -w apps/web build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
COPY --from=build /app/apps/web/next.config.* /app/apps/web/ 2>/dev/null || true
COPY --from=build /app/apps/web/public /app/apps/web/public
COPY --from=build /app/apps/web/.next /app/apps/web/.next

EXPOSE 3000

CMD ["npm", "run", "-w", "apps/web", "start", "--", "-p", "3000"]
