#!/bin/bash

# Script d'initialisation de la base de données
# Applique le schéma de la base de données

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

echo -e "${BLUE}=== Initialisation de la base de données ===${NC}"
echo -e "Host: ${DB_HOST}"
echo -e "Database: ${DB_NAME}"
echo -e "User: ${DB_USER}"
echo ""

echo -e "${BLUE}→ Application du schéma: schema.sql${NC}"
echo -e "  Création des ENUM, tables, index, contraintes et données de test"
echo ""

if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/schema.sql"; then
  echo ""
  echo -e "${GREEN}=== Schéma de base de données appliqué avec succès ===${NC}"
  echo ""
  echo -e "${BLUE}Prochaines étapes:${NC}"
  echo -e "1. Mettre à jour la société par défaut si nécessaire (ID: 00000000-0000-0000-0000-000000000000)"
  echo -e "2. Vérifier les données dans Adminer (http://localhost:8080)"
else
  echo ""
  echo -e "${RED}✗ Échec de l'initialisation${NC}"
  echo -e "${RED}Vérifiez que PostgreSQL est démarré et que les identifiants sont corrects${NC}"
  exit 1
fi
