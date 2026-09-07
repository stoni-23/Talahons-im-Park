#!/usr/bin/env bash
set -e

TARGET_DIR="/storage/emulated/0/Bankgeheimnis im Park/game"
mkdir -p "$TARGET_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="spiel_backup_${TIMESTAMP}.zip"
DEST_PATH="${TARGET_DIR}/${ARCHIVE_NAME}"

if ! command -v zip &> /dev/null; then
  pkg install -y zip
fi

cd ~/spiel
zip -r "$DEST_PATH" . -x "node_modules/*" ".next/*" ".git/*" "dist/*" ".cache/*"

echo "Backup erfolgreich: $DEST_PATH ($(du -h "$DEST_PATH" | cut -f1))"
