#!/bin/bash
set -e

DEST_DIR="/storage/emulated/0/Bankgeheimnis im Park/game"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_FILE="$DEST_DIR/spiel_backup_${TIMESTAMP}.zip"

mkdir -p "$DEST_DIR"

if ! command -v zip &> /dev/null; then
  pkg install -y zip
fi

zip -r "$ZIP_FILE" . -x "node_modules/*" ".git/*" "dist/*" ".next/*"

echo "✅ Backup gespeichert: $ZIP_FILE"

git add .
git commit -m "Fix: Verhindere Verdopplung von totalHits und Trefferschnitt bei Profil-Sync" || echo "Keine neuen Änderungen vorhanden"
git push

echo "🚀 Backup erstellt und Commit erfolgreich gepusht!"
