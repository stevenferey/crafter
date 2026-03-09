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
-- Utilisateur admin par défaut (optionnel)
-- Mot de passe: admin123 (à changer en production!)
-- ============================================
-- Note: Le hash ci-dessous correspond à 'admin123' avec bcrypt
-- En production, créer l'admin via l'API ou changer ce mot de passe
INSERT INTO users (
  email,
  password_hash,
  role,
  first_name,
  last_name,
  email_verified
) VALUES (
  'admin@crafter.app',
  '$2b$12$I4GOY9X5k1tqeGAsZ4YcFeJM0btSodSjyFUWx.NHXuV7E.aX9xDkG',
  'admin',
  'Admin',
  'Crafter',
  true
);

-- ============================================
-- Affichage du résumé
-- ============================================
\echo ''
\echo '✓ Migration 004_add_users.sql completed!'
\echo ''
\echo 'Table created:'
\echo '  - users (with 4 indexes and trigger)'
\echo ''
\echo 'Default admin user created:'
\echo '  - Email: admin@crafter.app'
\echo '  - Password: admin123 (CHANGE IN PRODUCTION!)'
\echo ''
