#!/bin/bash
set -e

DEST_DIR="/storage/emulated/0/Bankgeheimnis im Park/game"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_FILE="$DEST_DIR/spiel_backup_${TIMESTAMP}.zip"

echo "=== 1. Erstelle ZIP-Backup (v1.3.4 BETA) ==="
mkdir -p "$DEST_DIR"
zip -r "$ZIP_FILE" . -x "node_modules/*" ".git/*" "dist/*" ".next/*" "*.log"

echo ""
echo "✅ Backup gespeichert: $ZIP_FILE"
ls -lh "$ZIP_FILE"

echo ""
echo "=== 2. Git Update ==="
git status -s
git add .

if git diff-index --quiet HEAD --; then
  echo "ℹ️ Keine neuen Dateiänderungen für Git."
else
  git commit -m "chore: bump version to v1.3.4 BETA, fix wheel rewards and pointer sync (${TIMESTAMP})"
  git push
  echo "✅ Git Push erfolgreich abgeschlossen!"
fi
