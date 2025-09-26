# Use Node.js 20 (stable LTS version)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of ci for better compatibility)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create data directory for persistent storage (Railway volume will mount here)
RUN mkdir -p /app/data

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check will be handled by Railway's built-in monitoring

# Start the application
CMD ["npm", "start"]
