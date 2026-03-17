#!/bin/bash
# Backup OpenClaw data for Northflank deployment

set -e

BACKUP_DIR="./openclaw-backup-$(date +%Y%m%d-%H%M%S)"
OPENCLAW_DIR="$HOME/.openclaw"

echo "Creating OpenClaw backup in $BACKUP_DIR..."

mkdir -p "$BACKUP_DIR"

# Copy OpenClaw state (excluding large cached files)
if [ -d "$OPENCLAW_DIR" ]; then
    echo "Backing up OpenClaw state..."
    rsync -av --exclude='node_modules' --exclude='.cache' --exclude='*.log' \
        "$OPENCLAW_DIR/" "$BACKUP_DIR/.openclaw/"
else
    echo "Warning: $OPENCLAW_DIR not found"
fi

# Copy workspace
echo "Backing up workspace..."
if [ -d "$OPENCLAW_DIR/workspace" ]; then
    cp -r "$OPENCLAW_DIR/workspace" "$BACKUP_DIR/"
fi

# Copy agent directories
echo "Backing up agents..."
if [ -d "$OPENCLAW_DIR/agents" ]; then
    cp -r "$OPENCLAW_DIR/agents" "$BACKUP_DIR/"
fi

# Copy memory
echo "Backing up memory..."
if [ -d "$OPENCLAW_DIR/memory" ]; then
    cp -r "$OPENCLAW_DIR/memory" "$BACKUP_DIR/"
fi

# Copy config (sanitized)
echo "Backing up config..."
if [ -f "$OPENCLAW_DIR/openclaw.json" ]; then
    cp "$OPENCLAW_DIR/openclaw.json" "$BACKUP_DIR/openclaw.json.backup"
    echo "Note: openclaw.json copied. Review and sanitize secrets before deployment."
fi

# Create tarball
echo "Creating tarball..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname $BACKUP_DIR)" "$(basename $BACKUP_DIR)"

# Clean up
rm -rf "$BACKUP_DIR"

echo ""
echo "✅ Backup created: $BACKUP_DIR.tar.gz"
echo ""
echo "Next steps:"
echo "1. Review the backup contents"
echo "2. Sanitize any secrets in openclaw.json.backup"
echo "3. Upload to Northflank volume or include in deployment"
echo ""
