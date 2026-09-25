FROM node:22-alpine AS build
WORKDIR /app
ENV CI=true
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nest-cli.json tsconfig.json tsconfig.build.json ./
COPY apps/gateway ./apps/gateway
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm build:gateway
RUN pnpm prune --prod --ignore-scripts

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/dist/apps/gateway ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
