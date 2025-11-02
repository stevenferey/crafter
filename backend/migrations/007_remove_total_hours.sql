-- Migration 007: Suppression du champ total_hours
-- Date: 2025-11-02
-- Description: Le champ total_hours n'est plus nécessaire

BEGIN;

-- Supprimer la colonne total_hours et sa contrainte
ALTER TABLE cras DROP COLUMN IF EXISTS total_hours;

-- Vérification
SELECT
  'Migration 007 completed successfully' as status,
  'total_hours column removed' as details;

COMMIT;
