-- ============================================
-- Migration: Ajout de user_id aux tables existantes
-- ============================================

-- Ajouter user_id à la table companies
ALTER TABLE companies ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- Ajouter user_id à la table cras
ALTER TABLE cras ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_cras_user_id ON cras(user_id);

-- ============================================
-- Assigner les données existantes à l'admin
-- ============================================
UPDATE companies
SET user_id = (SELECT id FROM users WHERE email = 'admin@crafter.app')
WHERE user_id IS NULL;

UPDATE cras
SET user_id = (SELECT id FROM users WHERE email = 'admin@crafter.app')
WHERE user_id IS NULL;

-- ============================================
-- Affichage du résumé
-- ============================================
\echo ''
\echo '✓ Migration 005_add_user_ownership.sql completed!'
\echo ''
\echo 'Added user_id column to:'
\echo '  - companies table'
\echo '  - cras table'
\echo ''
\echo 'Existing data assigned to admin user.'
\echo ''
