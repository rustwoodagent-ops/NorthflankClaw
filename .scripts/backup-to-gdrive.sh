#!/bin/bash
# OpenClaw Backup Script to Google Drive
# Usage: ./backup-to-gdrive.sh

set -e

WORKSPACE="/home/rustwood/.openclaw/workspace"
BACKUP_DIR="/tmp/openclaw-backups"
RCLONE="/home/rustwood/.local/bin/rclone"
DATE=$(date +%Y%m%d-%H%M)
HOSTNAME=$(hostname)
BACKUP_NAME="openclaw-backup-${HOSTNAME}-${DATE}.tar.gz"
GDRIVE_FOLDER="OpenClaw Backups"

echo "=========================================="
echo "OpenClaw Backup to Google Drive"
echo "Date: $(date)"
echo "Backup: $BACKUP_NAME"
echo "=========================================="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create archive (excluding large temp files and caches)
echo ""
echo "Creating archive..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
  --exclude='node_modules' \
  --exclude='.git/objects' \
  --exclude='*.tar.gz' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.venv' \
  --exclude='*.log' \
  --exclude='tmp/*' \
  -C "$(dirname "$WORKSPACE")" \
  "$(basename "$WORKSPACE")" \
  2>/dev/null || true

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
echo "Archive created: $BACKUP_SIZE"

# Upload to Google Drive
echo ""
echo "Uploading to Google Drive..."
$RCLONE copy "$BACKUP_DIR/$BACKUP_NAME" "gdrive:$GDRIVE_FOLDER/"

# Verify upload
if $RCLONE ls "gdrive:$GDRIVE_FOLDER/$BACKUP_NAME" > /dev/null 2>&1; then
    echo "✓ Backup successful!"
    echo "Location: Google Drive > $GDRIVE_FOLDER/$BACKUP_NAME"
    
    # Clean up local backup after successful upload
    rm -f "$BACKUP_DIR/$BACKUP_NAME"
    echo "✓ Local temp file cleaned up"
else
    echo "✗ Backup verification failed"
    exit 1
fi

# Show recent backups
echo ""
echo "Recent backups in Google Drive:"
$RCLONE ls "gdrive:$GDRIVE_FOLDER/" | sort -k2,3 | tail -5

echo ""
echo "=========================================="
echo "Backup complete: $(date)"
echo "=========================================="
