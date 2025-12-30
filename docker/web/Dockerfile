# docker/web/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm install

COPY apps/web apps/web

WORKDIR /app/apps/web
RUN npm run build

WORKDIR /app
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web /app/apps/web

EXPOSE 3000
CMD sh -c "cd /app/apps/web && npm run start"
