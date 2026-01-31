# --- Stage 1: Build ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first (optimizes cache)
COPY package*.json ./

# Install ONLY production dependencies
# (We don't need dev tools like nodemon in the container)
RUN npm ci --only=production

# Copy the rest of the app code
COPY . .

# --- Stage 2: Runtime (Final Image) ---
FROM node:18-alpine
WORKDIR /app

# Copy built node_modules and app from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Security: Run as a non-root user (Standard practice)
USER node

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]