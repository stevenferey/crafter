# Historique des Migrations

Ce document décrit l'historique des migrations de la base de données.

## Migrations Appliquées

### 001 - init.sql (Initial)
**Date:** 2025-01-02
**Description:** Création initiale de la base de données

- Création de la table `cras`
- Création de la table `activities`
- Définition des types ENUM pour les statuts de CRA
- Mise en place des triggers pour `updated_at`
- Contraintes de clés étrangères et cascade

### 002 - add_companies.sql
**Date:** 2025-02-11
**Description:** Ajout du système de gestion des sociétés

- Création des types ENUM : `repertoire_type`, `liste_type`, `registre_type`
- Création de la table `companies` avec validation complète
- Ajout des colonnes `client_id` et `provider_id` à la table `cras`
- Contraintes de clés étrangères vers `companies`
- Contrainte CHECK : `client_id <> provider_id`
- Trigger `updated_at` pour la table `companies`

### 003 - migrate_clients_to_companies.sql
**Date:** 2025-02-11
**Description:** Migration des données existantes

- Création d'une société par défaut "Mon Entreprise" (ID: `00000000-0000-0000-0000-000000000000`)
- Migration automatique des noms de clients existants vers la table `companies`
- Association de tous les CRA aux nouvelles sociétés via `client_id` et `provider_id`

### 004 - remove_client_column.sql
**Date:** 2025-02-11
**Description:** Nettoyage de la colonne obsolète

- Suppression de la colonne `client` (VARCHAR) devenue obsolète
- Suppression de l'index `idx_cras_client`
- Passage de `client_id` et `provider_id` en NOT NULL

### 005 - fix_check_constraint.sql
**Date:** 2025-02-11
**Description:** Optimisation de la contrainte CHECK

- Simplification de la contrainte `chk_client_provider_different`
- Suppression des vérifications NULL devenues inutiles (colonnes désormais NOT NULL)

### 006 - monthly_cra_refactor.sql
**Date:** 2025-11-02
**Description:** Refactorisation CRA quotidien → mensuel

- Suppression de la table `activities`
- Remplacement de la colonne `date` (DATE) par `month` (INTEGER) et `year` (INTEGER)
- Ajout de la colonne `worked_days` (INTEGER[]) pour stocker les jours travaillés du mois
- Ajout de la colonne `comment` (TEXT) pour commentaires optionnels
- Mise à jour des index et contraintes

### 007 - remove_total_hours.sql
**Date:** 2025-11-02
**Description:** Suppression du champ total_hours

- Suppression de la colonne `total_hours` devenue inutile
- Suppression de la contrainte CHECK associée

## Initialisation d'une Nouvelle Base de Données

Pour initialiser une nouvelle base de données avec toutes les migrations :

```bash
# Depuis le dossier backend
npm run db:migrate
```

Ce script exécute automatiquement toutes les migrations dans l'ordre.

## Notes Importantes

- **⚠️ init.sql est obsolète**: Ce fichier contient l'ancienne structure (avec `activities` et `total_hours`). Il est conservé pour compatibilité avec le script `run-all.sh`, mais la structure finale est définie par l'ensemble des migrations 001-007.
- La société par défaut (ID `00000000-0000-0000-0000-000000000000`) doit être mise à jour avec les vraies informations de votre entreprise
- Les sociétés ne peuvent pas être supprimées si elles sont référencées par des CRA
- Une société ne peut pas être à la fois client et prestataire sur un même CRA

## Structure Actuelle de la Base de Données

Après application de toutes les migrations (001-007), voici la structure finale :

### Table `companies`
- Gestion complète des sociétés (clients et prestataires)
- Identifiant SIREN/SIRET obligatoire
- Informations TVA et immatriculation

### Table `cras` (Compte Rendu d'Activité Mensuel)
- `id` (UUID)
- `month` (INTEGER) - Mois (1-12)
- `year` (INTEGER) - Année
- `worked_days` (INTEGER[]) - Jours travaillés dans le mois
- `comment` (TEXT) - Commentaire optionnel
- `client_id` (UUID) → companies.id
- `provider_id` (UUID) → companies.id
- `status` (ENUM: draft, submitted, approved, rejected)
- `created_at`, `updated_at` (TIMESTAMP)

**Tables supprimées**: `activities` (fusion dans `cras` avec système mensuel)
