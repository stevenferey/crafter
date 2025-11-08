-- ============================================
-- Schéma de la base de données CRA
-- ============================================

-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS cras CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Supprimer les types ENUM si ils existent
DROP TYPE IF EXISTS cra_status CASCADE;
DROP TYPE IF EXISTS repertoire_type CASCADE;
DROP TYPE IF EXISTS liste_type CASCADE;
DROP TYPE IF EXISTS registre_type CASCADE;

-- ============================================
-- Création des types ENUM
-- ============================================

-- Statut des CRA
CREATE TYPE cra_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

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
-- Fonction trigger pour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

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

  -- Identification (répertoire + numéro obligatoire)
  repertoire repertoire_type NOT NULL DEFAULT 'SIREN',
  repertoire_number VARCHAR(14) NOT NULL CHECK (
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour la table companies
CREATE INDEX idx_companies_designation ON companies(designation);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_repertoire_number ON companies(repertoire_number);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table des CRA (Comptes Rendus d'Activité)
-- Granularité: Mensuelle
-- ============================================
CREATE TABLE cras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Période: mois et année
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),

  -- Jours travaillés du mois (tableau d'entiers 1-31)
  worked_days INTEGER[] NOT NULL DEFAULT '{}',

  -- Commentaire global (optionnel)
  comment TEXT,

  -- Sociétés (client et prestataire)
  client_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,

  -- Statut du CRA
  status cra_status NOT NULL DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Contraintes
  CONSTRAINT chk_different_client_provider CHECK (client_id != provider_id),
  CONSTRAINT unique_month_client_provider UNIQUE (month, year, client_id, provider_id)
);

-- Index pour la table cras
CREATE INDEX idx_cras_month_year ON cras(year DESC, month DESC);
CREATE INDEX idx_cras_client_id ON cras(client_id);
CREATE INDEX idx_cras_provider_id ON cras(provider_id);
CREATE INDEX idx_cras_status ON cras(status);
CREATE INDEX idx_cras_created_at ON cras(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_cras_updated_at
  BEFORE UPDATE ON cras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Données de test
-- ============================================

-- Entreprise 1: Mon entreprise (prestataire par défaut)
INSERT INTO companies (
  id,
  designation,
  address,
  city,
  postal_code,
  country,
  email,
  phone,
  repertoire,
  repertoire_number,
  tva_number
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Ma Société SARL',
  '123 Avenue des Développeurs',
  'Paris',
  '75001',
  'France',
  'contact@masociete.fr',
  '0123456789',
  'SIREN',
  '123456789',
  'FR12345678901'
);

-- Entreprise 2: Client Acme Corp
INSERT INTO companies (
  designation,
  address,
  city,
  postal_code,
  country,
  email,
  phone,
  repertoire,
  repertoire_number,
  tva_number
) VALUES (
  'Acme Corporation',
  '456 Rue du Commerce',
  'Lyon',
  '69001',
  'France',
  'contact@acmecorp.fr',
  '0198765432',
  'SIREN',
  '987654321',
  'FR98765432109'
);

-- Entreprise 3: Client TechStart
INSERT INTO companies (
  designation,
  address,
  city,
  postal_code,
  country,
  email,
  repertoire,
  repertoire_number
) VALUES (
  'TechStart SAS',
  '789 Boulevard de l''Innovation',
  'Toulouse',
  '31000',
  'France',
  'hello@techstart.io',
  'SIREN',
  '456789123'
);

-- CRA 1: Novembre 2025 - Acme Corp (brouillon)
INSERT INTO cras (
  month,
  year,
  worked_days,
  comment,
  client_id,
  provider_id,
  status
) VALUES (
  11,
  2025,
  '{3,4,5,6,7,10,12,13,14,17,18,19,20,21,24,25,26,27,28}',
  'Mission de développement du module e-commerce. Intégration du système de paiement et mise en place des tests automatisés.',
  (SELECT id FROM companies WHERE designation = 'Acme Corporation'),
  '00000000-0000-0000-0000-000000000000',
  'draft'
);

-- CRA 2: Octobre 2025 - Acme Corp (soumis)
INSERT INTO cras (
  month,
  year,
  worked_days,
  comment,
  client_id,
  provider_id,
  status
) VALUES (
  10,
  2025,
  '{1,2,3,4,7,8,9,10,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31}',
  'Refonte complète de l''interface utilisateur. Migration vers React 18 et mise en place de Tailwind CSS.',
  (SELECT id FROM companies WHERE designation = 'Acme Corporation'),
  '00000000-0000-0000-0000-000000000000',
  'submitted'
);

-- CRA 3: Novembre 2025 - TechStart (brouillon)
INSERT INTO cras (
  month,
  year,
  worked_days,
  comment,
  client_id,
  provider_id,
  status
) VALUES (
  11,
  2025,
  '{3,4,5,6,7}',
  'Audit de sécurité et mise en place des bonnes pratiques DevSecOps.',
  (SELECT id FROM companies WHERE designation = 'TechStart SAS'),
  '00000000-0000-0000-0000-000000000000',
  'draft'
);

-- CRA 4: Septembre 2025 - TechStart (approuvé)
INSERT INTO cras (
  month,
  year,
  worked_days,
  comment,
  client_id,
  provider_id,
  status
) VALUES (
  9,
  2025,
  '{1,2,4,5,8,9,11,12,15,16,18,19,22,23,25,26,29,30}',
  'Architecture et développement de la plateforme SaaS. Mise en place de l''infrastructure AWS avec Terraform.',
  (SELECT id FROM companies WHERE designation = 'TechStart SAS'),
  '00000000-0000-0000-0000-000000000000',
  'approved'
);

-- ============================================
-- Affichage du résumé
-- ============================================
\echo ''
\echo '✓ Database schema initialized successfully!'
\echo ''
\echo 'Tables created:'
\echo '  - companies (with 4 indexes and trigger)'
\echo '  - cras (with 5 indexes and trigger)'
\echo ''
\echo 'ENUM types created:'
\echo '  - cra_status'
\echo '  - repertoire_type'
\echo '  - liste_type'
\echo '  - registre_type'
\echo ''
\echo 'Test data inserted:'
SELECT COUNT(*) || ' companies' as summary FROM companies
UNION ALL
SELECT COUNT(*) || ' CRAs' FROM cras;
\echo ''
