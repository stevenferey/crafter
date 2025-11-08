# Schéma de Base de Données

Ce dossier contient le schéma de la base de données PostgreSQL.

## Fichiers

- **`schema.sql`** : Schéma complet de la base de données incluant :
  - Types ENUM (cra_status, repertoire_type, liste_type, registre_type)
  - Tables (companies, cras)
  - Contraintes et clés étrangères
  - Index pour optimiser les performances
  - Triggers pour la mise à jour automatique de `updated_at`
  - Données de test (3 entreprises et 4 CRAs d'exemple)

- **`run-all.sh`** : Script bash pour initialiser la base de données

## Initialisation de la Base de Données

Pour initialiser la base de données :

```bash
# Option 1: Via npm (recommandé)
cd backend
npm run db:migrate

# Option 2: Via le script bash directement
cd backend/migrations
./run-all.sh

# Option 3: Via psql directement
psql -h localhost -U cra_user -d cra_db -f backend/migrations/schema.sql
```

## Structure de la Base de Données

### Types ENUM

- **`cra_status`** : Statut d'un CRA
  - `draft`, `submitted`, `approved`, `rejected`

- **`repertoire_type`** : Type d'identification d'entreprise
  - `SIREN`, `SIRET`

- **`liste_type`** : Type de classification d'activité
  - `NAF`, `APE`

- **`registre_type`** : Type de registre d'immatriculation
  - `RCS`, `RM`, `RCS/RM`, `RNE`, `RBE`, `RSAC`, `RNA`, `REE`, `RS`, `RCC`, `RAC`, `RMJPM`, `RMJLE`, `ROVS`, `ORIAS`, `RAI`, `RCT`, `TRM`, `LVIC`, `STP`, `REEP`, `ROF`, `IFP`, `ROA`, `RNROM`, `RA`, `RESS`, `CNAPS`, `RPI`

### Table `companies`

Gestion des sociétés (clients et prestataires).

**Colonnes principales :**
- `id` (UUID) - Identifiant unique
- `designation` (VARCHAR) - Nom de l'entreprise
- `address`, `complement`, `city`, `postal_code`, `country` - Siège social
- `email`, `phone` - Coordonnées de contact
- `repertoire`, `repertoire_number` - Identification (SIREN/SIRET obligatoire)
- `dispense`, `registre`, `registre_number` - Immatriculation
- `liste`, `code` - Classification d'activité
- `exemption`, `tva_number` - Informations TVA
- `created_at`, `updated_at` - Horodatage

**Index :**
- `idx_companies_designation`
- `idx_companies_city`
- `idx_companies_repertoire_number`
- `idx_companies_created_at`

### Table `cras`

Comptes Rendus d'Activité à granularité **mensuelle**.

**Colonnes principales :**
- `id` (UUID) - Identifiant unique
- `month` (INTEGER) - Mois (1-12)
- `year` (INTEGER) - Année (2000-2100)
- `worked_days` (INTEGER[]) - Tableau des jours travaillés du mois (ex: `{1,2,5,6,7}`)
- `comment` (TEXT) - Commentaire optionnel
- `client_id` (UUID) - Référence vers `companies` (entreprise cliente)
- `provider_id` (UUID) - Référence vers `companies` (entreprise prestataire)
- `status` (cra_status) - Statut du CRA
- `created_at`, `updated_at` - Horodatage

**Contraintes :**
- `chk_different_client_provider` : Le client et le prestataire doivent être différents
- `unique_month_client_provider` : Un seul CRA par mois/année/client/prestataire

**Index :**
- `idx_cras_month_year` (décroissant pour trier par récence)
- `idx_cras_client_id`
- `idx_cras_provider_id`
- `idx_cras_status`
- `idx_cras_created_at`

## Données de Test

Le schéma inclut des données de test pour faciliter le développement :

1. **Entreprises** :
   - Ma Société SARL (ID: `00000000-0000-0000-0000-000000000000`) - Prestataire par défaut
   - Acme Corporation - Client exemple
   - TechStart SAS - Client exemple

2. **CRAs** :
   - 4 CRAs d'exemple couvrant différents mois et statuts

## Notes Importantes

- **Société par défaut** : L'ID `00000000-0000-0000-0000-000000000000` est réservé pour la société prestataire par défaut. Vous devez mettre à jour ses informations via l'interface ou directement en base.

- **Suppression de sociétés** : Une société ne peut pas être supprimée si elle est référencée par au moins un CRA (contrainte `ON DELETE RESTRICT`).

- **Réinitialisation** : Pour réinitialiser complètement la base de données :
  ```bash
  # Supprimer et recréer la base
  docker exec -it cra_postgres psql -U cra_user -c "DROP DATABASE IF EXISTS cra_db;"
  docker exec -it cra_postgres psql -U cra_user -c "CREATE DATABASE cra_db;"

  # Réappliquer le schéma
  docker exec -i cra_postgres psql -U cra_user -d cra_db < backend/migrations/schema.sql
  ```

## Accès à la Base de Données

- **Adminer** : http://localhost:8080
  - Système : PostgreSQL
  - Serveur : cra_postgres
  - Utilisateur : cra_user
  - Mot de passe : cra_password
  - Base : cra_db

- **Ligne de commande** :
  ```bash
  docker exec -it cra_postgres psql -U cra_user -d cra_db
  ```
