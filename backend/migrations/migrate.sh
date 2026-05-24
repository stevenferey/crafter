#!/bin/bash

# Applique les migrations incrémentales (NNN_*.sql) qui n'ont pas encore été
# exécutées. Idempotent : peut être lancé à chaque déploiement / démarrage.
#
# Usage:
#   bash backend/migrations/migrate.sh          # via docker exec (défaut local)
#   USE_DOCKER=false bash migrate.sh            # via psql local
#   DB_HOST=… DB_USER=… DB_NAME=… bash migrate.sh
#
# Le tracking se fait via la table `schema_migrations` (créée automatiquement).
# `schema.sql` est intentionnellement ignoré (c'est le bootstrap initial,
# géré séparément par start-dev.sh / run-all.sh).

set -euo pipefail

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Config
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-cra_user}"
DB_NAME="${DB_NAME:-cra_db}"
USE_DOCKER="${USE_DOCKER:-true}"
DOCKER_CONTAINER="${DOCKER_CONTAINER:-cra_postgres}"
MIGRATIONS_DIR="$(cd "$(dirname "$0")" && pwd)"

# Helper psql : route via docker exec ou psql local
psql_exec() {
  if [ "$USE_DOCKER" = "true" ]; then
    docker exec -i "$DOCKER_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
  else
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
  fi
}

echo -e "${BLUE}=== Migrations incrémentales ===${NC}"
echo -e "Database: ${DB_NAME} @ ${DB_HOST} (docker=${USE_DOCKER})"
echo ""

# 1. Créer la table de tracking si elle n'existe pas
psql_exec <<'SQL' > /dev/null
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename    TEXT PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SQL

# 2. Bootstrap : si on vient juste de créer schema_migrations sur une DB qui
#    a déjà reçu d'anciennes migrations à la main, on les marque comme
#    appliquées en détectant leur empreinte dans le schéma. Idempotent.
psql_exec < "$MIGRATIONS_DIR/_bootstrap.sql"

# 3. Récupérer la liste des migrations déjà appliquées
APPLIED=$(psql_exec -tAc "SELECT filename FROM schema_migrations ORDER BY filename;")

# 3. Parcourir les fichiers NNN_*.sql triés
shopt -s nullglob
MIGRATION_FILES=("$MIGRATIONS_DIR"/[0-9][0-9][0-9]_*.sql)

if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
  echo -e "${YELLOW}Aucun fichier de migration trouvé.${NC}"
  exit 0
fi

APPLIED_COUNT=0
SKIPPED_COUNT=0

for file in "${MIGRATION_FILES[@]}"; do
  filename=$(basename "$file")

  if echo "$APPLIED" | grep -qx "$filename"; then
    echo -e "${YELLOW}↷ skip${NC}    $filename (déjà appliquée)"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  echo -e "${BLUE}→ apply${NC}   $filename"

  # Wrapper la migration dans une transaction : si quoi que ce soit échoue,
  # rien n'est commité, et schema_migrations n'est pas mis à jour.
  if {
    echo "BEGIN;"
    cat "$file"
    echo ""
    echo "INSERT INTO schema_migrations (filename) VALUES ('$filename');"
    echo "COMMIT;"
  } | psql_exec > /dev/null; then
    echo -e "${GREEN}✓ done${NC}    $filename"
    APPLIED_COUNT=$((APPLIED_COUNT + 1))
  else
    echo -e "${RED}✗ FAILED${NC}  $filename"
    echo -e "${RED}Migration interrompue. Corrige le fichier et relance.${NC}"
    exit 1
  fi
done

echo ""
echo -e "${GREEN}=== Terminé : ${APPLIED_COUNT} appliquée(s), ${SKIPPED_COUNT} ignorée(s) ===${NC}"
