# Base stage: Sets up the base image with Node.js and creates a working directory
FROM node:18-alpine AS base
WORKDIR /app
ARG APP_NAME

# Turbo stage: Installs Turbo, copies the application files, prunes dependencies, and lists the contents of the output directory
FROM base AS turbo
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=${APP_NAME} --docker
RUN ls -la /app/out

# Builder stage: Installs build dependencies, copies the pruned dependencies and installs them, copies the application files, builds the project, switches dependencies over to production only, and prunes out not needed files
FROM base AS builder
RUN apk add --no-cache python3 make g++ libc6-compat
COPY --from=turbo /app/out/json/ .
COPY --from=turbo /app/out/yarn.lock ./yarn.lock
RUN yarn install && cp -R node_modules node_modules_production && yarn install
COPY --from=turbo /app/out/full/ .
RUN npx turbo run build
RUN rm -rf node_modules && mv node_modules_production node_modules && apk --no-cache add curl && curl -sf https://gobinaries.com/tj/node-prune | sh && node-prune

# Runner stage: Sets up a non-root user, copies the built application and static files, and sets the command to run the application
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=builder --chown=nextjs:nodejs app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder --chown=nextjs:nodejs app/apps/${APP_NAME}/publi[c] ./apps/${APP_NAME}/public

WORKDIR /app/apps/${APP_NAME}

CMD node server.js