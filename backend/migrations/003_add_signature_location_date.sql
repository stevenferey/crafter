-- Migration: Add signature location and date fields
-- Date: 2025-12-07
-- Description: Adds signature location (city) and use_current_date fields
--              for "Fait à <VILLE>, le <DATE>" in PDF exports

-- Companies: default signature location and date settings
ALTER TABLE companies
ADD COLUMN default_signature_location VARCHAR(255);

ALTER TABLE companies
ADD COLUMN default_use_current_date BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN companies.default_signature_location IS 'Ville par défaut pour la mention "Fait à..."';
COMMENT ON COLUMN companies.default_use_current_date IS 'Utiliser la date du jour lors de la génération PDF';

-- CRAs: per-CRA signature location and date overrides (client side)
ALTER TABLE cras
ADD COLUMN client_signature_location VARCHAR(255);

ALTER TABLE cras
ADD COLUMN client_use_current_date BOOLEAN;

-- CRAs: per-CRA signature location and date overrides (provider side)
ALTER TABLE cras
ADD COLUMN provider_signature_location VARCHAR(255);

ALTER TABLE cras
ADD COLUMN provider_use_current_date BOOLEAN;

COMMENT ON COLUMN cras.client_signature_location IS 'Lieu de signature client (surcharge)';
COMMENT ON COLUMN cras.client_use_current_date IS 'Utiliser date courante pour signature client';
COMMENT ON COLUMN cras.provider_signature_location IS 'Lieu de signature prestataire (surcharge)';
COMMENT ON COLUMN cras.provider_use_current_date IS 'Utiliser date courante pour signature prestataire';
