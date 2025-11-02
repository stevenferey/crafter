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

## Initialisation d'une Nouvelle Base de Données

Pour initialiser une nouvelle base de données avec toutes les migrations :

```bash
# Depuis le dossier backend
npm run db:migrate
```

Ce script exécute automatiquement toutes les migrations dans l'ordre.

## Notes Importantes

- La société par défaut (ID `00000000-0000-0000-0000-000000000000`) doit être mise à jour avec les vraies informations de votre entreprise
- Les sociétés ne peuvent pas être supprimées si elles sont référencées par des CRA
- Une société ne peut pas être à la fois client et prestataire sur un même CRA
