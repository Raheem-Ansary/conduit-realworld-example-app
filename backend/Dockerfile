FROM node:18-alpine AS deps

WORKDIR /usr/src/app/backend

# Install only production dependencies for the backend (includes sequelize-cli)
COPY backend/package*.json ./
RUN npm install --only=production

FROM node:18-alpine AS runtime

WORKDIR /usr/src/app/backend

ENV NODE_ENV=production
ENV PORT=3001

# Install utilities for healthchecks and database wait
RUN apk add --no-cache curl netcat-openbsd

# Create a non-root user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Copy dependencies and source code
COPY --from=deps /usr/src/app/backend/node_modules ./node_modules
COPY backend/ ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

USER nodeuser

ENTRYPOINT ["./docker-entrypoint.sh"]
