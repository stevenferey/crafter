-- ============================================
-- Script d'initialisation de la base de données CRA
-- ============================================

-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS cras CASCADE;

-- Supprimer les types ENUM si ils existent
DROP TYPE IF EXISTS cra_status CASCADE;

-- ============================================
-- Création du type ENUM pour le statut des CRA
-- ============================================
CREATE TYPE cra_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- ============================================
-- Table des CRA (Comptes Rendus d'Activité)
-- ============================================
CREATE TABLE cras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  client VARCHAR(255) NOT NULL,
  total_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
  status cra_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_cras_date ON cras(date DESC);
CREATE INDEX idx_cras_client ON cras(client);
CREATE INDEX idx_cras_status ON cras(status);
CREATE INDEX idx_cras_created_at ON cras(created_at DESC);

-- ============================================
-- Table des activités
-- ============================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cra_id UUID NOT NULL REFERENCES cras(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hours DECIMAL(4, 2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_activities_cra_id ON activities(cra_id);
CREATE INDEX idx_activities_category ON activities(category);

-- ============================================
-- Trigger pour mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cras_updated_at BEFORE UPDATE ON cras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Données de test
-- ============================================

-- CRA 1 : Client Acme Corp - Aujourd'hui
INSERT INTO cras (id, date, client, total_hours, status) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'Acme Corp', 8.0, 'draft');

INSERT INTO activities (cra_id, description, hours, category) VALUES
('11111111-1111-1111-1111-111111111111', 'Développement de la page de connexion', 4.0, 'Développement'),
('11111111-1111-1111-1111-111111111111', 'Revue de code avec l''équipe', 2.0, 'Code Review'),
('11111111-1111-1111-1111-111111111111', 'Documentation de l''API', 2.0, 'Documentation');

-- CRA 2 : Client TechStart - Hier
INSERT INTO cras (id, date, client, total_hours, status) VALUES
('22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 day', 'TechStart', 7.5, 'submitted');

INSERT INTO activities (cra_id, description, hours, category) VALUES
('22222222-2222-2222-2222-222222222222', 'Mise en place de l''infrastructure Docker', 3.0, 'DevOps'),
('22222222-2222-2222-2222-222222222222', 'Configuration de la CI/CD', 2.5, 'DevOps'),
('22222222-2222-2222-2222-222222222222', 'Réunion client de suivi', 1.0, 'Réunion'),
('22222222-2222-2222-2222-222222222222', 'Préparation de la démo', 1.0, 'Préparation');

-- CRA 3 : Client GlobalSoft - Il y a 2 jours
INSERT INTO cras (id, date, client, total_hours, status) VALUES
('33333333-3333-3333-3333-333333333333', CURRENT_DATE - INTERVAL '2 days', 'GlobalSoft', 8.0, 'approved');

INSERT INTO activities (cra_id, description, hours, category) VALUES
('33333333-3333-3333-3333-333333333333', 'Analyse des besoins du nouveau module', 2.0, 'Analyse'),
('33333333-3333-3333-3333-333333333333', 'Conception de l''architecture', 3.0, 'Conception'),
('33333333-3333-3333-3333-333333333333', 'Rédaction des spécifications techniques', 2.0, 'Documentation'),
('33333333-3333-3333-3333-333333333333', 'Réunion d''équipe', 1.0, 'Réunion');

-- CRA 4 : Client InnovateLab - Il y a 3 jours
INSERT INTO cras (id, date, client, total_hours, status) VALUES
('44444444-4444-4444-4444-444444444444', CURRENT_DATE - INTERVAL '3 days', 'InnovateLab', 6.5, 'draft');

INSERT INTO activities (cra_id, description, hours, category) VALUES
('44444444-4444-4444-4444-444444444444', 'Correction de bugs critiques', 3.0, 'Bugfix'),
('44444444-4444-4444-4444-444444444444', 'Tests unitaires et d''intégration', 2.5, 'Tests'),
('44444444-4444-4444-4444-444444444444', 'Support client', 1.0, 'Support');

-- CRA 5 : Client DataFlow - Il y a 5 jours
INSERT INTO cras (id, date, client, total_hours, status) VALUES
('55555555-5555-5555-5555-555555555555', CURRENT_DATE - INTERVAL '5 days', 'DataFlow', 8.0, 'approved');

INSERT INTO activities (cra_id, description, hours, category) VALUES
('55555555-5555-5555-5555-555555555555', 'Optimisation des requêtes SQL', 4.0, 'Développement'),
('55555555-5555-5555-5555-555555555555', 'Mise en place du cache Redis', 3.0, 'Développement'),
('55555555-5555-5555-5555-555555555555', 'Tests de performance', 1.0, 'Tests');

-- ============================================
-- Affichage des données insérées
-- ============================================
\echo ''
\echo '✓ Database initialized successfully!'
\echo ''
\echo 'Tables created:'
\echo '  - cras (with indexes)'
\echo '  - activities (with indexes)'
\echo ''
\echo 'Test data inserted:'
SELECT COUNT(*) || ' CRAs' as summary FROM cras
UNION ALL
SELECT COUNT(*) || ' activities' FROM activities;
\echo ''
