-- Bootstrap intelligent du tracking des migrations.
--
-- Quand on bascule sur une nouvelle branche, la table `schema_migrations`
-- peut être vide alors que la DB a déjà reçu d'anciennes migrations à la main
-- (ou via run-all.sh). Si on essayait juste de tout rejouer, ça échouerait
-- (colonnes déjà existantes, etc.).
--
-- Ce script détecte les migrations dont l'empreinte est déjà présente dans
-- le schéma actuel et les marque comme appliquées, sans toucher au schéma.
-- Les migrations vraiment nouvelles seront appliquées normalement par
-- migrate.sh ensuite.
--
-- Idempotent : ne fait rien si schema_migrations contient déjà des entrées.

DO $$
BEGIN
  -- Ne bootstrap que la première fois (tracking vide)
  IF EXISTS (SELECT 1 FROM schema_migrations LIMIT 1) THEN
    RETURN;
  END IF;

  -- 002 : ajout des champs signature (default_signatory_name sur companies)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'default_signatory_name'
  ) THEN
    INSERT INTO schema_migrations (filename) VALUES ('002_add_signature_fields.sql');
  END IF;

  -- 003 : ajout signature_location/use_current_date (client_signature_location sur cras)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cras' AND column_name = 'client_signature_location'
  ) THEN
    INSERT INTO schema_migrations (filename) VALUES ('003_add_signature_location_date.sql');
  END IF;

  -- 004 : création de la table users
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
  ) THEN
    INSERT INTO schema_migrations (filename) VALUES ('004_add_users.sql');
  END IF;

  -- 005 : ajout user_id sur cras
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cras' AND column_name = 'user_id'
  ) THEN
    INSERT INTO schema_migrations (filename) VALUES ('005_add_user_ownership.sql');
  END IF;

  -- 006 : suppression de google_id sur users (table users existe ET colonne absente)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'google_id'
  ) THEN
    INSERT INTO schema_migrations (filename) VALUES ('006_remove_google_auth.sql');
  END IF;

  -- 007 : signatures en base64 (client_signature_image passe de VARCHAR à TEXT)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cras'
      AND column_name = 'client_signature_image'
      AND data_type = 'text'
  ) THEN
    INSERT INTO schema_migrations (filename) VALUES ('007_signatures_base64.sql');
  END IF;

  -- 008 : date fixe de signature (client_signature_date sur cras)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cras' AND column_name = 'client_signature_date'
  ) THEN
    INSERT INTO schema_migrations (filename) VALUES ('008_add_signature_date.sql');
  END IF;

  -- Log si au moins une migration a été backfillée
  IF EXISTS (SELECT 1 FROM schema_migrations LIMIT 1) THEN
    RAISE NOTICE 'Bootstrap : % migration(s) détectée(s) comme déjà appliquée(s) dans le schéma',
      (SELECT COUNT(*) FROM schema_migrations);
  END IF;
END $$;
