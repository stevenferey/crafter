-- Migration 004: Suppression de la colonne obsolète 'client'
-- Date: 2025-02-11
-- Description: Supprime la colonne 'client' (VARCHAR) devenue obsolète après migration vers client_id
-- et rend les colonnes client_id et provider_id obligatoires

BEGIN;

-- Afficher le statut avant migration
SELECT
  COUNT(*) as total_cras,
  COUNT(client_id) as with_client_id,
  COUNT(provider_id) as with_provider_id
FROM cras;

-- Vérifier que tous les CRA ont bien client_id et provider_id
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM cras
  WHERE client_id IS NULL OR provider_id IS NULL;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: % CRA(s) have NULL client_id or provider_id', missing_count;
  END IF;
END $$;

-- Supprimer l'index sur la colonne client
DROP INDEX IF EXISTS idx_cras_client;

-- Supprimer la colonne client (obsolète)
ALTER TABLE cras DROP COLUMN IF EXISTS client;

-- Rendre client_id obligatoire
ALTER TABLE cras ALTER COLUMN client_id SET NOT NULL;

-- Rendre provider_id obligatoire
ALTER TABLE cras ALTER COLUMN provider_id SET NOT NULL;

-- Afficher le résultat
SELECT
  'Migration 004 completed successfully' as status,
  COUNT(*) as total_cras,
  COUNT(DISTINCT client_id) as unique_clients,
  COUNT(DISTINCT provider_id) as unique_providers
FROM cras;

COMMIT;
