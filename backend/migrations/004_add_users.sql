-- ============================================
-- Migration: Ajout de la table users
-- ============================================

-- Type ENUM pour les rôles utilisateur
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- ============================================
-- Table des utilisateurs
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiants
  email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  password_hash VARCHAR(255) NOT NULL, -- Mot de passe hashé (bcrypt)

  -- Rôle
  role user_role NOT NULL DEFAULT 'user',

  -- Profil
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),

  -- Vérification email
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP WITH TIME ZONE,

  -- Réinitialisation mot de passe
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP WITH TIME ZONE,

  -- Refresh token (hashé pour la révocation)
  refresh_token_hash VARCHAR(255),

  -- Timestamps
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour la table users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Pas d'utilisateur admin par défaut
-- ============================================
-- Cette migration créait auparavant un compte 'admin@crafter.app' dont le mot
-- de passe ('admin123') était publié en clair dans ce dépôt : n'importe qui
-- pouvait s'y connecter et, le rôle 'admin' désactivant le filtrage par
-- propriétaire, lire et modifier les données de tous les utilisateurs.
--
-- Le compte se crée désormais hors du dépôt : inscrire un utilisateur via
-- POST /api/auth/register, puis le promouvoir explicitement :
--   UPDATE users SET role = 'admin' WHERE email = '<votre-email>';
--
-- Les bases déjà migrées conservent l'ancien compte : la migration
-- 009_disable_default_admin.sql le neutralise.

-- ============================================
-- Affichage du résumé
-- ============================================
\echo ''
\echo '✓ Migration 004_add_users.sql completed!'
\echo ''
\echo 'Table created:'
\echo '  - users (with 4 indexes and trigger)'
\echo ''
\echo 'No default admin user is created (see comment in this file).'
\echo ''
