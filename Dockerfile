# Multi-Stage Dockerfile for OmniPrep Suite
# Step 1: Build the React frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Install compilation tools for native SQLite bindings
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build production bundle
COPY . .
RUN npm run build

# Step 2: Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime compilation tools
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and backend server
COPY --from=builder /app/dist ./dist
COPY server ./server

# Ensure sqlite database directory exists with proper permissions
RUN mkdir -p /app/server && chmod 777 /app/server

EXPOSE 5000

CMD ["node", "server/index.js"]
