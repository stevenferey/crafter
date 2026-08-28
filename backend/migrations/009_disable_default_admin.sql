-- ============================================
-- Migration: Neutralisation du compte admin par défaut
-- ============================================
-- La migration 004 créait un compte 'admin@crafter.app' dont le mot de passe
-- ('admin123') était publié en clair dans ce dépôt. Le rôle 'admin' désactivant
-- le filtrage par propriétaire côté API, ce compte donnait lecture et écriture
-- sur les données de tous les utilisateurs.
--
-- 004 ne crée plus ce compte, mais toute base déjà migrée le contient encore :
-- cette migration le neutralise.
--
-- Le compte n'est volontairement PAS supprimé : companies.user_id et
-- cras.user_id référencent users(id) ON DELETE CASCADE, et la migration 005 a
-- attribué à ce compte toutes les données antérieures à l'authentification.
-- Un DELETE détruirait donc ces données. On rend le compte inutilisable en
-- laissant à l'exploitant le soin d'en disposer.
--
-- Le WHERE ne cible que le hash par défaut connu : si le mot de passe a déjà
-- été changé, le compte est laissé intact.

DO $$
DECLARE
  affected INT;
BEGIN
  UPDATE users
  SET password_hash          = '!disabled-by-migration-009',
      refresh_token_hash     = NULL,
      password_reset_token   = NULL,
      password_reset_expires = NULL,
      updated_at             = CURRENT_TIMESTAMP
  WHERE email = 'admin@crafter.app'
    AND password_hash = '$2b$12$I4GOY9X5k1tqeGAsZ4YcFeJM0btSodSjyFUWx.NHXuV7E.aX9xDkG';

  GET DIAGNOSTICS affected = ROW_COUNT;

  IF affected > 0 THEN
    RAISE NOTICE 'Compte admin par defaut neutralise (mot de passe et sessions revoques).';
    RAISE NOTICE 'Ce compte possede peut-etre des donnees (cf. migration 005).';
    RAISE NOTICE 'Reattribuez-les puis supprimez le compte, ou changez son email et definissez un mot de passe via /api/auth/forgot-password.';
  ELSE
    RAISE NOTICE 'Aucun compte admin par defaut a neutraliser.';
  END IF;
END $$;

-- La valeur '!disabled-by-migration-009' n'est pas un hash bcrypt valide :
-- bcrypt.compare() renvoie false pour tout mot de passe, et la chaine etant
-- non vide, le controleur de login la traite comme des identifiants invalides
-- (401) et non comme un compte sans mot de passe.

\echo ''
\echo '✓ Migration 009_disable_default_admin.sql completed!'
\echo ''
