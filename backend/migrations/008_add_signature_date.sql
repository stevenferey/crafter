-- Migration: Add fixed signature date fields
-- Date: 2026-05-24
-- Description: Adds an optional fixed signature date per CRA (client + provider).
--              Combined with use_current_date, this gives three modes:
--              - Auto:  use_current_date=true,  signature_date=NULL  -> today at PDF export
--              - Fixed: use_current_date=false, signature_date=<DATE> -> that date
--              - Empty: use_current_date=false, signature_date=NULL  -> blank line to fill by hand

ALTER TABLE cras
ADD COLUMN client_signature_date DATE;

ALTER TABLE cras
ADD COLUMN provider_signature_date DATE;

COMMENT ON COLUMN cras.client_signature_date IS 'Date fixe de signature client (NULL si Auto ou Vide)';
COMMENT ON COLUMN cras.provider_signature_date IS 'Date fixe de signature prestataire (NULL si Auto ou Vide)';
