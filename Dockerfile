# MCP MultiDB Server - Docker Image
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create data directory for templates and history
RUN mkdir -p /app/data

# Expose port (if needed for future web interface)
EXPOSE 3000

# Set the default command
CMD ["node", "dist/index.js", "start"]

# Metadata
LABEL maintainer="PineMCP Team"
LABEL description="Professional MCP server supporting multiple database types"
LABEL version="1.0.0"
