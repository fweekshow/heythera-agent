# Use Node.js 20 (stable LTS version)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy source code first
COPY . .

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Create data directory for persistent storage (Railway volume will mount here)
RUN mkdir -p /app/data

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
