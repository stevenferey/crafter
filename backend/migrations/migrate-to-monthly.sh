#!/bin/bash

# Script de migration vers CRA mensuels
# ATTENTION: Ce script supprime TOUTES les données CRA existantes!

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-cra_user}"
DB_NAME="${DB_NAME:-cra_db}"
MIGRATIONS_DIR="$(dirname "$0")"

clear
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║   MIGRATION VERS CRA MENSUELS - SUPPRESSION DES DONNÉES   ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  ATTENTION: Cette migration va SUPPRIMER toutes les données CRA existantes!${NC}"
echo ""
echo -e "Host: ${DB_HOST}"
echo -e "Database: ${DB_NAME}"
echo -e "User: ${DB_USER}"
echo ""
echo -e "${YELLOW}Cette migration va:${NC}"
echo -e "  - Supprimer la table 'activities'"
echo -e "  - Supprimer la table 'cras' et toutes ses données"
echo -e "  - Recréer 'cras' avec la nouvelle structure mensuelle"
echo ""
echo -e "${YELLOW}Changements du modèle:${NC}"
echo -e "  ✓ Un CRA = un mois (au lieu d'un jour)"
echo -e "  ✓ Sélection des jours travaillés du mois"
echo -e "  ✓ Saisie manuelle des heures totales"
echo -e "  ✓ Commentaire global (optionnel)"
echo -e "  ✗ Plus de table activities"
echo -e "  ✗ Plus de catégories"
echo ""

# Demander confirmation
read -p "Voulez-vous vraiment continuer? (tapez 'OUI' en majuscules): " confirmation

if [ "$confirmation" != "OUI" ]; then
  echo -e "${RED}Migration annulée.${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}=== Exécution de la migration 006 ===${NC}"

# Exécuter la migration
if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/006_monthly_cra_refactor.sql"; then
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   Migration réussie!                           ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}✓ Nouvelle structure CRA mensuelle en place${NC}"
  echo -e "${GREEN}✓ Base de données prête pour les nouveaux CRA${NC}"
  echo ""
  echo -e "${BLUE}Prochaines étapes:${NC}"
  echo -e "  1. Redémarrer le backend"
  echo -e "  2. Redémarrer le frontend"
  echo -e "  3. Créer un nouveau CRA mensuel depuis l'interface"
else
  echo ""
  echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║   Échec de la migration!                       ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${RED}Vérifiez:${NC}"
  echo -e "  - Que PostgreSQL est démarré"
  echo -e "  - Que les identifiants sont corrects"
  echo -e "  - Les logs PostgreSQL pour plus de détails"
  exit 1
fi
