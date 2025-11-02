-- ============================================
-- Migration: Ajout du système de gestion des sociétés
-- ============================================

-- Supprimer les types ENUM si ils existent
DROP TYPE IF EXISTS repertoire_type CASCADE;
DROP TYPE IF EXISTS liste_type CASCADE;
DROP TYPE IF EXISTS registre_type CASCADE;

-- ============================================
-- Création des types ENUM
-- ============================================

-- Type de répertoire d'identification
CREATE TYPE repertoire_type AS ENUM ('SIREN', 'SIRET');

-- Type de liste d'activité
CREATE TYPE liste_type AS ENUM ('NAF', 'APE');

-- Type de registre d'immatriculation
CREATE TYPE registre_type AS ENUM (
  'RCS', 'RM', 'RCS/RM', 'RNE', 'RBE', 'RSAC', 'RNA', 'REE', 'RS',
  'RCC', 'RAC', 'RMJPM', 'RMJLE', 'ROVS', 'ORIAS', 'RAI', 'RCT',
  'TRM', 'LVIC', 'STP', 'REEP', 'ROF', 'IFP', 'ROA', 'RNROM',
  'RA', 'RESS', 'CNAPS', 'RPI'
);

-- ============================================
-- Table des sociétés (companies)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Désignation (obligatoire)
  designation VARCHAR(255) NOT NULL,

  -- Siège social (obligatoire sauf complement)
  address VARCHAR(255) NOT NULL,
  complement VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  postal_code VARCHAR(5) NOT NULL CHECK (postal_code ~ '^\d{5}$'),
  country VARCHAR(100) NOT NULL DEFAULT 'France',

  -- Contact (email obligatoire, téléphone optionnel)
  email VARCHAR(255) NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(10) CHECK (phone IS NULL OR phone ~ '^\d{10}$'),

  -- Identification (répertoire + numéro optionnel)
  repertoire repertoire_type NOT NULL DEFAULT 'SIREN',
  repertoire_number VARCHAR(14) CHECK (
    repertoire_number IS NULL OR
    (repertoire = 'SIREN' AND repertoire_number ~ '^\d{9}$') OR
    (repertoire = 'SIRET' AND repertoire_number ~ '^\d{14}$')
  ),

  -- Immatriculation (dispense, registre + numéro optionnels)
  dispense BOOLEAN NOT NULL DEFAULT false,
  registre registre_type,
  registre_number VARCHAR(255),

  -- Activité (liste + code optionnel)
  liste liste_type NOT NULL DEFAULT 'NAF',
  code VARCHAR(10),

  -- TVA (exemption + numéro TVA optionnel)
  exemption BOOLEAN NOT NULL DEFAULT false,
  tva_number VARCHAR(13) CHECK (tva_number IS NULL OR tva_number ~ '^FR\d{11}$'),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Contrainte: le numéro de répertoire est requis si le répertoire est défini
  CONSTRAINT repertoire_number_required CHECK (
    repertoire_number IS NOT NULL
  )
);

-- Index pour améliorer les performances
CREATE INDEX idx_companies_designation ON companies(designation);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_repertoire_number ON companies(repertoire_number);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Modification de la table CRAs
-- ============================================

-- Ajouter les colonnes pour les relations avec companies
ALTER TABLE cras ADD COLUMN client_id UUID;
ALTER TABLE cras ADD COLUMN provider_id UUID;

-- Ajouter les contraintes de clés étrangères
ALTER TABLE cras ADD CONSTRAINT fk_cras_client
  FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE RESTRICT;

ALTER TABLE cras ADD CONSTRAINT fk_cras_provider
  FOREIGN KEY (provider_id) REFERENCES companies(id) ON DELETE RESTRICT;

-- Contrainte: le client et le prestataire doivent être différents
ALTER TABLE cras ADD CONSTRAINT chk_client_provider_different
  CHECK (client_id IS NULL OR provider_id IS NULL OR client_id <> provider_id);

-- Index pour améliorer les performances
CREATE INDEX idx_cras_client_id ON cras(client_id);
CREATE INDEX idx_cras_provider_id ON cras(provider_id);

-- ============================================
-- Affichage du résultat
-- ============================================
\echo ''
\echo '✓ Companies table created successfully!'
\echo '✓ CRAs table updated with client_id and provider_id!'
\echo ''
