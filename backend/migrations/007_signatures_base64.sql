-- ============================================
-- Migration: Signatures en Base64
-- Date: 2025-12-21
-- Description: Convertit le stockage des signatures de chemins fichier vers base64
--              Les colonnes passent de VARCHAR(500) à TEXT pour stocker les data URLs
--              Format: "data:image/png;base64,iVBORw0KGgo..."
-- ============================================

-- ============================================
-- Supprimer les index incompatibles avec les grandes valeurs base64
-- (PostgreSQL limite les index à 8191 bytes, les images base64 font ~100KB)
-- ============================================

DROP INDEX IF EXISTS idx_cras_client_signature;
DROP INDEX IF EXISTS idx_cras_provider_signature;

-- ============================================
-- Table companies: Signature par défaut
-- ============================================

ALTER TABLE companies
ALTER COLUMN default_signature_image TYPE TEXT;

COMMENT ON COLUMN companies.default_signature_image IS 'Image de signature par défaut en base64 (data URL)';

-- ============================================
-- Table cras: Signatures spécifiques
-- ============================================

ALTER TABLE cras
ALTER COLUMN client_signature_image TYPE TEXT;

ALTER TABLE cras
ALTER COLUMN provider_signature_image TYPE TEXT;

COMMENT ON COLUMN cras.client_signature_image IS 'Image de signature client en base64 (data URL)';
COMMENT ON COLUMN cras.provider_signature_image IS 'Image de signature provider en base64 (data URL)';

-- ============================================
-- Note importante
-- ============================================
-- Les anciennes valeurs (chemins comme "/uploads/signatures/uuid.png")
-- seront remplacées par les nouvelles données base64 lors du prochain upload.
-- Les signatures existantes devront être ré-uploadées.

-- ============================================
-- Affichage du résumé
-- ============================================
\echo ''
\echo '✓ Migration 007: Signatures base64 migration complete!'
\echo ''
\echo 'Changed columns to TEXT:'
\echo '  • companies.default_signature_image'
\echo '  • cras.client_signature_image'
\echo '  • cras.provider_signature_image'
\echo ''
\echo 'Note: Existing signatures (file paths) will need to be re-uploaded.'
\echo ''
