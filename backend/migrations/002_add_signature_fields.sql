-- ============================================
-- Migration: Ajout des champs de signature
-- Date: 2025-11-09
-- Description: Ajoute les champs de signature pour les sociétés (par défaut)
--              et les CRAs (avec possibilité d'override)
-- ============================================

-- ============================================
-- Table companies: Signature par défaut
-- ============================================

-- Nom du signataire par défaut (ex: "Jean Dupont")
ALTER TABLE companies
ADD COLUMN default_signatory_name VARCHAR(255);

-- Titre/fonction du signataire par défaut (ex: "Directeur Général", "Responsable RH")
ALTER TABLE companies
ADD COLUMN default_signatory_title VARCHAR(255);

-- Chemin vers l'image de signature par défaut (ex: "/uploads/signatures/abc123.png")
ALTER TABLE companies
ADD COLUMN default_signature_image VARCHAR(500);

-- Commentaire sur les colonnes pour documentation
COMMENT ON COLUMN companies.default_signatory_name IS 'Nom du signataire par défaut pour cette société';
COMMENT ON COLUMN companies.default_signatory_title IS 'Titre/fonction du signataire par défaut';
COMMENT ON COLUMN companies.default_signature_image IS 'Chemin ou URL de l''image de signature par défaut';

-- ============================================
-- Table cras: Signatures spécifiques (override)
-- ============================================

-- Signatures du côté CLIENT
ALTER TABLE cras
ADD COLUMN client_signatory_name VARCHAR(255);

ALTER TABLE cras
ADD COLUMN client_signatory_title VARCHAR(255);

ALTER TABLE cras
ADD COLUMN client_signature_image VARCHAR(500);

-- Signatures du côté PROVIDER
ALTER TABLE cras
ADD COLUMN provider_signatory_name VARCHAR(255);

ALTER TABLE cras
ADD COLUMN provider_signatory_title VARCHAR(255);

ALTER TABLE cras
ADD COLUMN provider_signature_image VARCHAR(500);

-- Commentaires pour documentation
COMMENT ON COLUMN cras.client_signatory_name IS 'Nom du signataire client (override de la signature par défaut)';
COMMENT ON COLUMN cras.client_signatory_title IS 'Titre du signataire client (override de la signature par défaut)';
COMMENT ON COLUMN cras.client_signature_image IS 'Image de signature client (override de la signature par défaut)';

COMMENT ON COLUMN cras.provider_signatory_name IS 'Nom du signataire provider (override de la signature par défaut)';
COMMENT ON COLUMN cras.provider_signatory_title IS 'Titre du signataire provider (override de la signature par défaut)';
COMMENT ON COLUMN cras.provider_signature_image IS 'Image de signature provider (override de la signature par défaut)';

-- ============================================
-- Index pour optimisation (optionnel)
-- ============================================

-- Index pour rechercher rapidement les CRAs avec signatures personnalisées
CREATE INDEX idx_cras_client_signature ON cras(client_signature_image) WHERE client_signature_image IS NOT NULL;
CREATE INDEX idx_cras_provider_signature ON cras(provider_signature_image) WHERE provider_signature_image IS NOT NULL;

-- ============================================
-- Affichage du résumé
-- ============================================
\echo ''
\echo '✓ Migration 002: Signature fields added successfully!'
\echo ''
\echo 'Companies table:'
\echo '  + default_signatory_name VARCHAR(255)'
\echo '  + default_signatory_title VARCHAR(255)'
\echo '  + default_signature_image VARCHAR(500)'
\echo ''
\echo 'CRAs table:'
\echo '  + client_signatory_name VARCHAR(255)'
\echo '  + client_signatory_title VARCHAR(255)'
\echo '  + client_signature_image VARCHAR(500)'
\echo '  + provider_signatory_name VARCHAR(255)'
\echo '  + provider_signatory_title VARCHAR(255)'
\echo '  + provider_signature_image VARCHAR(500)'
\echo ''
\echo 'Indexes created:'
\echo '  + idx_cras_client_signature (partial index)'
\echo '  + idx_cras_provider_signature (partial index)'
\echo ''
