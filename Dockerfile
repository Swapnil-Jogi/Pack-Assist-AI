# ==============================================================================
# Pack-Assist AI - Production Docker Container
# Multi-runtime image supporting Node.js 20 & Python 3 Machine Learning Services
# ==============================================================================

FROM node:20-bookworm-slim

# Set environment defaults
ENV NODE_ENV=production \
    PORT=8080 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    VIRTUAL_ENV=/opt/venv

# Install Python 3, pip, venv, and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up dedicated Python Virtual Environment to conform with PEP 668
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Ensure 'python' symlink is available globally
RUN ln -sf $VIRTUAL_ENV/bin/python3 /usr/local/bin/python || true

# Set application working directory
WORKDIR /app

# Copy dependency manifests first for maximum Docker layer caching
COPY package*.json ./
COPY requirements.txt ./

# Install production Node.js dependencies
RUN npm ci --omit=dev

# Install Python ML dependencies inside the virtual environment
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Pre-train the ML model artifact during container build
RUN python ml_service/recommend_model.py --train || true

# Set appropriate permissions for the node user
RUN chown -R node:node /opt/venv /app

# Switch to unprivileged user for container security
USER node

# Expose standard application port
EXPOSE 8080

# Production Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:8080/health || exit 1

# Default start command
CMD ["npm", "start"]
