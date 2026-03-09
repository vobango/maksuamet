# Build stage
FROM node:18-slim AS builder

# Create app directory
WORKDIR /app

# Set environment defaults
ARG BUILD_TIME_ARGUMENT
ENV MY_ENV="The tag is ${BUILD_TIME_ARGUMENT}"

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for build
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8001

# Start app
CMD ["node", "dist/server.js"]

