-- ============================================
-- Migration: Conversion des clients texte en sociétés
-- ============================================

\echo ''
\echo 'Starting migration of existing clients to companies...'
\echo ''

-- ============================================
-- 1. Créer une société "Prestataire par défaut" pour les anciens CRA
-- ============================================
INSERT INTO companies (
  id,
  designation,
  address,
  city,
  postal_code,
  country,
  email,
  repertoire,
  repertoire_number,
  liste
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Mon Entreprise',
  'Adresse à compléter',
  'Ville à compléter',
  '00000',
  'France',
  'contact@monentreprise.fr',
  'SIREN'::repertoire_type,
  '000000000',
  'NAF'::liste_type
) ON CONFLICT (id) DO NOTHING;

\echo '✓ Default provider company created'

-- ============================================
-- 2. Créer des sociétés à partir des noms de clients uniques
-- ============================================

-- Créer une société pour chaque client unique dans les CRA
INSERT INTO companies (
  designation,
  address,
  city,
  postal_code,
  country,
  email,
  repertoire,
  repertoire_number,
  liste
)
SELECT DISTINCT
  cras.client as designation,
  'Adresse à compléter' as address,
  'Ville à compléter' as city,
  '00000' as postal_code,
  'France' as country,
  LOWER(REPLACE(cras.client, ' ', '')) || '@example.com' as email,
  'SIREN'::repertoire_type as repertoire,
  LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0') as repertoire_number,
  'NAF'::liste_type as liste
FROM cras
WHERE NOT EXISTS (
  SELECT 1 FROM companies WHERE companies.designation = cras.client
);

\echo '✓ Companies created from unique client names'

-- ============================================
-- 3. Associer les CRA existants aux sociétés créées
-- ============================================

-- Mettre à jour client_id pour tous les CRA
UPDATE cras
SET client_id = companies.id
FROM companies
WHERE cras.client = companies.designation
  AND cras.client_id IS NULL;

\echo '✓ CRAs linked to client companies'

-- Mettre à jour provider_id avec la société par défaut
UPDATE cras
SET provider_id = '00000000-0000-0000-0000-000000000000'
WHERE provider_id IS NULL;

\echo '✓ CRAs linked to default provider company'

-- ============================================
-- 4. Vérification de la migration
-- ============================================

\echo ''
\echo 'Migration verification:'
SELECT
  COUNT(*) as total_companies,
  (SELECT COUNT(*) FROM cras WHERE client_id IS NOT NULL) as cras_with_client,
  (SELECT COUNT(*) FROM cras WHERE provider_id IS NOT NULL) as cras_with_provider
FROM companies;

-- Vérifier qu'il n'y a pas de CRA sans client_id ou provider_id
DO $$
DECLARE
  missing_client INTEGER;
  missing_provider INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_client FROM cras WHERE client_id IS NULL;
  SELECT COUNT(*) INTO missing_provider FROM cras WHERE provider_id IS NULL;

  IF missing_client > 0 THEN
    RAISE EXCEPTION 'Migration failed: % CRAs without client_id', missing_client;
  END IF;

  IF missing_provider > 0 THEN
    RAISE EXCEPTION 'Migration failed: % CRAs without provider_id', missing_provider;
  END IF;

  RAISE NOTICE 'All CRAs successfully migrated!';
END $$;

\echo ''
\echo '✓ Migration completed successfully!'
\echo ''
\echo 'IMPORTANT: Please update the default provider company information'
\echo '           (ID: 00000000-0000-0000-0000-000000000000)'
\echo ''
