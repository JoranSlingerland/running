# Base stage: Sets up the base image with Node.js and creates a working directory
FROM node:18-alpine AS base
WORKDIR /app
ARG APP_NAME

# Turbo stage: Updates the package list, installs Turbo, copies the application files, and prunes dependencies
FROM base AS turbo

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=${APP_NAME} --docker

# Installer stage: Copies the pruned dependencies and installs them
FROM base AS installer
RUN apk update
COPY --from=turbo /app/out/json/ .
COPY --from=turbo /app/out/yarn.lock ./yarn.lock
COPY --from=turbo /app/turbo.json ./turbo.json
RUN yarn install

# Sourcer stage: Copies the installed dependencies and application files, and builds the application
FROM base AS sourcer
COPY --from=installer /app/ .
COPY --from=turbo /app/out/full/ .
RUN yarn turbo run build

# Runner stage: Copies the built application and sets the command to run the application
FROM base as runner
COPY --from=sourcer /app/ .
WORKDIR /app/apps/${APP_NAME}
CMD [ "node", "dist/main.js" ]