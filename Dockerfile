FROM node:22-slim

# Install ffmpeg, python3, curl, ca-certificates for video processing and keyless neural translation
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend for production
RUN npm run build

# Cloud platforms inject PORT environment variable (default 3000)
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Start server with production build
CMD ["npm", "run", "start"]
