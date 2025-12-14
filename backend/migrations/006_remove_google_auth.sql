-- ============================================
-- Migration: Suppression de l'authentification Google OAuth
-- ============================================

-- Supprimer l'index google_id
DROP INDEX IF EXISTS idx_users_google_id;

-- Supprimer la colonne google_id
ALTER TABLE users DROP COLUMN IF EXISTS google_id;

-- ============================================
-- Affichage du résumé
-- ============================================
\echo ''
\echo '✓ Migration 006_remove_google_auth.sql completed!'
\echo ''
\echo 'Changes:'
\echo '  - Dropped index idx_users_google_id'
\echo '  - Dropped column google_id from users table'
\echo ''
