# Multi-stage Dockerfile for GymMaster PRO
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copy source and build
COPY . .
# We need the Prisma Client generated for the build if any server code uses it
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
# Copy .env if available, though Easypanel will provide these via Env Vars
COPY --from=builder /app/.env* ./

# Install only production dependencies (optional if copied from builder)
# RUN npm prune --production

EXPOSE 3001
EXPOSE 5173

# Script to run both frontend preview and backend
# In a real production environment with Easypanel, you might want to serve 
# the static files via the Express server or a separate Nginx container.
# For now, we'll use a simple start script.

CMD ["sh", "-c", "node server/index.js & npm run preview -- --host 0.0.0.0 --port 5173"]
