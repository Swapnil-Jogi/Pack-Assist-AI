# ==============================================================================
# Pack-Assist AI - Production Docker Container
# Multi-runtime image supporting Node.js 20 & Python 3 Machine Learning Services
# ==============================================================================

FROM node:20-bullseye-slim

# Set environment defaults
ENV NODE_ENV=production \
    PORT=8080 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install Python 3, pip, and required system build libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set application working directory
WORKDIR /app

# Copy dependency manifests first for maximum Docker layer caching
COPY package*.json ./
COPY requirements.txt ./

# Install production Node.js dependencies
RUN npm ci --omit=dev

# Install Python ML dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Pre-train the ML model artifact during container build
RUN python3 ml_service/recommend_model.py --train || true

# Set appropriate permissions for the node user
RUN chown -R node:node /app

# Switch to unprivileged user for container security
USER node

# Expose standard application port
EXPOSE 8080

# Production Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:8080/health || exit 1

# Default start command
CMD ["npm", "start"]
