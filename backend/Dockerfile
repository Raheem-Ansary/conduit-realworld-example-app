FROM node:18-alpine AS deps

WORKDIR /usr/src/app/backend

# Copy package.json (relative to build context ./backend) and install production deps
COPY package*.json ./
RUN npm install --only=production

FROM node:18-alpine AS runtime

WORKDIR /usr/src/app/backend

ENV NODE_ENV=production
ENV PORT=3001

# Install utilities for healthchecks and waiting for DB
RUN apk add --no-cache curl netcat-openbsd

# Create a non-root user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Copy dependencies from build stage
COPY --from=deps /usr/src/app/backend/node_modules ./node_modules

# Copy application source code (relative to build context ./backend)
COPY . ./

# Ensure entrypoint exists and is executable
# (backend/docker-entrypoint.sh must exist in repo)
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3001

USER nodeuser

ENTRYPOINT ["./docker-entrypoint.sh"]

