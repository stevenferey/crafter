-- Migration 005: Correction de la contrainte CHECK
-- Date: 2025-02-11
-- Description: Simplifie la contrainte CHECK maintenant que client_id et provider_id sont NOT NULL

BEGIN;

-- Supprimer l'ancienne contrainte
ALTER TABLE cras DROP CONSTRAINT IF EXISTS chk_client_provider_different;

-- Recréer la contrainte sans les vérifications NULL (devenues inutiles)
ALTER TABLE cras ADD CONSTRAINT chk_client_provider_different
  CHECK (client_id <> provider_id);

-- Vérifier la contrainte
SELECT
  'Migration 005 completed successfully' as status,
  'Constraint simplified: client_id <> provider_id (NULL checks removed)' as details;

COMMIT;
