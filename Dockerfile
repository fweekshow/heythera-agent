# Use Node.js 20 (matches your local version for consistency)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create data directory for persistent storage (Railway volume will mount here)
RUN mkdir -p /app/data

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Add health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application
CMD ["npm", "start"]
