-- Migration 006: Refonte CRA - Granularité mensuelle au lieu de journalière
-- Date: 2025-11-02
-- Description: Transformation complète du modèle CRA
--   - Un CRA = un mois (au lieu d'un jour)
--   - Sélection des jours travaillés dans le mois
--   - Saisie manuelle des heures totales
--   - Commentaire global
--   - Suppression de la table activities
--   - Suppression des catégories

-- ATTENTION: Cette migration supprime TOUTES les données existantes (clean slate)

BEGIN;

-- Étape 1: Supprimer la table activities
DROP TABLE IF EXISTS activities CASCADE;

-- Étape 2: Supprimer l'ancienne table cras
DROP TABLE IF EXISTS cras CASCADE;

-- Étape 3: Recréer la table cras avec la nouvelle structure
CREATE TABLE cras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Période: mois et année
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),

  -- Jours travaillés du mois (tableau d'entiers)
  worked_days INTEGER[] NOT NULL DEFAULT '{}',

  -- Heures totales (saisie manuelle)
  total_hours DECIMAL(6, 2) NOT NULL CHECK (total_hours >= 0),

  -- Commentaire global (optionnel)
  comment TEXT,

  -- Sociétés (client et prestataire)
  client_id UUID NOT NULL,
  provider_id UUID NOT NULL,

  -- Statut du CRA
  status cra_status NOT NULL DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Contraintes
  CONSTRAINT chk_different_client_provider CHECK (client_id != provider_id),
  CONSTRAINT unique_month_client_provider UNIQUE (month, year, client_id, provider_id)
);

-- Étape 4: Ajouter les contraintes de clés étrangères vers companies
ALTER TABLE cras
  ADD CONSTRAINT fk_cras_client FOREIGN KEY (client_id)
    REFERENCES companies(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_cras_provider FOREIGN KEY (provider_id)
    REFERENCES companies(id) ON DELETE RESTRICT;

-- Étape 5: Créer les index pour optimiser les requêtes
CREATE INDEX idx_cras_month_year ON cras(year DESC, month DESC);
CREATE INDEX idx_cras_client_id ON cras(client_id);
CREATE INDEX idx_cras_provider_id ON cras(provider_id);
CREATE INDEX idx_cras_status ON cras(status);
CREATE INDEX idx_cras_created_at ON cras(created_at DESC);

-- Étape 6: Recréer le trigger pour updated_at
CREATE TRIGGER update_cras_updated_at
  BEFORE UPDATE ON cras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT
  'Migration 006 completed successfully' as status,
  0 as total_cras,
  'New monthly CRA structure in place' as details;

COMMIT;
