# Build a partir da RAIZ do monorepo (é workspace npm — precisa ver os
# package.json dos dois workspaces pra resolver certo):
#   docker build -f backend/Dockerfile -t plano-b-backend .

FROM node:22-slim AS deps
WORKDIR /repo
# python3/make/g++: toolchain de build do binding nativo do argon2.
RUN apt-get update -y && apt-get install -y --no-install-recommends python3 make g++ openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY app/package.json ./app/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci
COPY backend/prisma ./backend/prisma
RUN npm run prisma:generate --workspace=backend

FROM deps AS build
COPY backend ./backend
RUN npm run build --workspace=backend

FROM node:22-slim AS runtime
WORKDIR /repo
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/backend/dist ./backend/dist
COPY --from=build /repo/backend/prisma ./backend/prisma
COPY --from=build /repo/backend/package.json ./backend/package.json
COPY --from=build /repo/package.json ./package.json

EXPOSE 3000
CMD ["node", "backend/dist/server.js"]
