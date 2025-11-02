#!/bin/bash

# Script de migration complète de la base de données
# Exécute toutes les migrations dans l'ordre

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration (peut être overridée par des variables d'environnement)
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-cra_user}"
DB_NAME="${DB_NAME:-cra_db}"
MIGRATIONS_DIR="$(dirname "$0")"

echo -e "${BLUE}=== Migration de la base de données ===${NC}"
echo -e "Host: ${DB_HOST}"
echo -e "Database: ${DB_NAME}"
echo -e "User: ${DB_USER}"
echo ""

# Fonction pour exécuter une migration
run_migration() {
  local file=$1
  local description=$2

  echo -e "${BLUE}→ Exécution: ${file}${NC}"
  echo -e "  ${description}"

  if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/$file" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Migration réussie${NC}"
  else
    echo -e "${RED}✗ Échec de la migration${NC}"
    echo -e "${RED}Vérifiez que PostgreSQL est démarré et que les identifiants sont corrects${NC}"
    exit 1
  fi
  echo ""
}

# Exécution des migrations dans l'ordre
run_migration "init.sql" "Création des tables CRA et Activities"
run_migration "002_add_companies.sql" "Ajout de la table Companies"
run_migration "003_migrate_clients_to_companies.sql" "Migration des données clients existantes"
run_migration "004_remove_client_column.sql" "Suppression de la colonne client obsolète"
run_migration "005_fix_check_constraint.sql" "Correction de la contrainte CHECK"
run_migration "006_monthly_cra_refactor.sql" "Refactorisation CRA quotidien → mensuel"
run_migration "007_remove_total_hours.sql" "Suppression du champ total_hours"

echo -e "${GREEN}=== Toutes les migrations ont été appliquées avec succès ===${NC}"
echo ""
echo -e "${BLUE}Prochaines étapes:${NC}"
echo -e "1. Mettre à jour la société par défaut (ID: 00000000-0000-0000-0000-000000000000)"
echo -e "2. Vérifier les données migrées dans Adminer (http://localhost:8080)"
