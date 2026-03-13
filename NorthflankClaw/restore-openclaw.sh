#!/bin/bash
# Restore OpenClaw backup on Northflank

set -e

BACKUP_FILE="$1"
DATA_DIR="/data"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring OpenClaw from $BACKUP_FILE..."

# Extract backup
TMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TMP_DIR"

BACKUP_DIR=$(find "$TMP_DIR" -maxdepth 1 -type d | tail -n 1)

echo "Backup directory: $BACKUP_DIR"

# Restore .openclaw state
if [ -d "$BACKUP_DIR/.openclaw" ]; then
    echo "Restoring OpenClaw state..."
    mkdir -p "$DATA_DIR/.openclaw"
    cp -r "$BACKUP_DIR/.openclaw/"* "$DATA_DIR/.openclaw/"
fi

# Restore workspace
if [ -d "$BACKUP_DIR/workspace" ]; then
    echo "Restoring workspace..."
    cp -r "$BACKUP_DIR/workspace" "$DATA_DIR/"
fi

# Restore agents
if [ -d "$BACKUP_DIR/agents" ]; then
    echo "Restoring agents..."
    cp -r "$BACKUP_DIR/agents" "$DATA_DIR/.openclaw/"
fi

# Restore memory
if [ -d "$BACKUP_DIR/memory" ]; then
    echo "Restoring memory..."
    cp -r "$BACKUP_DIR/memory" "$DATA_DIR/.openclaw/"
fi

# Restore config if exists
if [ -f "$BACKUP_DIR/openclaw.json.backup" ]; then
    echo "Restoring config..."
    cp "$BACKUP_DIR/openclaw.json.backup" "$DATA_DIR/.openclaw/openclaw.json"
fi

# Cleanup
rm -rf "$TMP_DIR"

echo ""
echo "✅ Restore complete!"
echo ""
echo "Restart the OpenClaw service to apply changes."
