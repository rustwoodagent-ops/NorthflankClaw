FROM node:22-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install OpenClaw
RUN npm install -g openclaw@latest

# Create app directory
WORKDIR /app

# Copy wrapper server
COPY wrapper/ ./wrapper/
RUN cd wrapper && npm install

# Create data directories
RUN mkdir -p /data/.openclaw /data/workspace

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV OPENCLAW_STATE_DIR=/data/.openclaw
ENV OPENCLAW_WORKSPACE_DIR=/data/workspace

# Start the wrapper server
CMD ["node", "/app/wrapper/server.js"]
