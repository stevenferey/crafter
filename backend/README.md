# Crafter Backend API

Backend API REST pour l'application Crafter CRA (Compte Rendu d'Activité).

## 🛠️ Stack Technique

- **Runtime**: Node.js 24+
- **Framework**: Express 5.x
- **Language**: TypeScript 5.x
- **Base de données**: PostgreSQL 16
- **ORM**: pg (node-postgres) - Client PostgreSQL natif
- **Dev Tools**: tsx, nodemon

## 📦 Installation

### Prérequis

- Node.js 24+ et npm
- Docker et Docker Compose (pour PostgreSQL)
- PostgreSQL 16+ (si pas d'utilisation de Docker)

### Installation des dépendances

```bash
cd backend
npm install
```

### Configuration

1. Copier `.env.example` vers `.env` :
```bash
cp .env.example .env
```

2. Modifier les variables d'environnement si nécessaire :
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=cra_db
DB_USER=cra_user
DB_PASSWORD=cra_password

CORS_ORIGIN=http://localhost:5173
```

## 🚀 Démarrage

### Méthode 1 : Script automatisé (recommandé)

Depuis la racine du projet, utiliser le script de démarrage qui lance tout :

```bash
./start-dev.sh
```

Ce script :
- Démarre Docker (PostgreSQL + Adminer)
- Attend que PostgreSQL soit prêt
- Initialise le schéma de base de données si nécessaire
- Démarre le backend sur le port 3001
- Démarre le frontend sur le port 5173

### Méthode 2 : Démarrage manuel

#### 1. Démarrer Docker (PostgreSQL + Adminer)

```bash
# Depuis la racine du projet
docker-compose up -d
```

#### 2. Initialiser la base de données

Attendre que PostgreSQL soit prêt (environ 5-10 secondes), puis :

```bash
# Méthode 1 : Via npm script (recommandé)
npm run db:migrate

# Méthode 2 : Via Docker exec
docker exec -i cra_postgres psql -U cra_user -d cra_db < migrations/schema.sql
```

#### 3. Démarrer le serveur backend

```bash
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarre sur **http://localhost:3001**

## 🗄️ Base de données

### Structure

#### Table `companies`
```sql
- id (UUID, primary key)
- designation (VARCHAR, required) - Nom de la société
- address (VARCHAR, required) - Adresse
- complement (VARCHAR, optional) - Complément d'adresse
- city (VARCHAR, required) - Ville
- postal_code (VARCHAR(5), required) - Code postal
- country (VARCHAR, required) - Pays
- email (VARCHAR, required) - Email
- phone (VARCHAR(10), optional) - Téléphone
- repertoire (ENUM: SIREN, SIRET) - Type de répertoire
- repertoire_number (VARCHAR, required) - Numéro SIREN/SIRET
- dispense (BOOLEAN) - Dispense d'immatriculation
- registre (ENUM: RCS, RM, RSA, optional) - Type de registre
- registre_number (VARCHAR, optional) - Numéro de registre
- liste (ENUM: NAF, NACE) - Type de liste d'activité
- code (VARCHAR, optional) - Code d'activité
- exemption (BOOLEAN) - Exemption TVA (Art.293 B du CGI)
- tva_number (VARCHAR, optional) - Numéro TVA intracommunautaire
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Table `cras` (Compte Rendu d'Activité Mensuel)
```sql
- id (UUID, primary key)
- month (INTEGER) - Mois (1-12)
- year (INTEGER) - Année
- worked_days (INTEGER[]) - Tableau des jours travaillés dans le mois
- comment (TEXT, optional) - Commentaire optionnel
- client_id (UUID, foreign key → companies.id) - Société cliente
- provider_id (UUID, foreign key → companies.id) - Société prestataire
- status (ENUM: draft, submitted, approved, rejected)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- CONSTRAINT: client_id <> provider_id (une société ne peut pas être à la fois client et prestataire)
```

**Note:** La table `activities` a été supprimée. Les CRA sont maintenant mensuels avec un simple tableau de jours travaillés.

### Gestion de la base de données

#### Accéder à Adminer (interface web)

URL: **http://localhost:8080**

Identifiants :
- Système : PostgreSQL
- Serveur : postgres
- Utilisateur : cra_user
- Mot de passe : cra_password
- Base de données : cra_db

#### Accéder via psql (ligne de commande)

```bash
# Via Docker
docker exec -it cra_postgres psql -U cra_user -d cra_db

# Via psql local
psql -h localhost -U cra_user -d cra_db
```

#### Réinitialiser la base de données

```bash
# Arrêter Docker
docker-compose down

# Supprimer le volume (ATTENTION : perte de données !)
docker volume rm crafter_postgres_data

# Redémarrer et réinitialiser
docker-compose up -d
sleep 5
npm run db:migrate
```

## 📡 API Endpoints

Base URL : `http://localhost:3001/api`

### Health Check

```
GET /api/health
```

Retourne l'état de santé du serveur et de la connexion à la base de données.

### CRA Endpoints

#### Liste des CRA

```
GET /api/cras?status={status}&client={client}&provider={provider}&year={year}&month={month}&limit={n}&offset={n}
```

**Query Parameters:**
- `status` (optional) : Filtrer par statut (draft, submitted, approved, rejected)
- `client` (optional) : Filtrer par ID de société cliente
- `provider` (optional) : Filtrer par ID de société prestataire
- `year` (optional) : Filtrer par année (ex: 2025)
- `month` (optional) : Filtrer par mois (1-12)
- `limit` (optional) : Nombre de résultats (défaut: 50)
- `offset` (optional) : Décalage pour pagination (défaut: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "month": 1,
      "year": 2025,
      "worked_days": [2, 3, 4, 5, 8, 9, 10, 11, 12],
      "comment": "Mois complet de développement",
      "client_id": "uuid",
      "provider_id": "uuid",
      "status": "draft",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Récupérer un CRA

```
GET /api/cras/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "month": 1,
    "year": 2025,
    "worked_days": [2, 3, 4, 5, 8, 9, 10, 11, 12],
    "comment": "Mois complet de développement",
    "client_id": "uuid",
    "provider_id": "uuid",
    "status": "draft",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

#### Créer un CRA

```
POST /api/cras
```

**Body:**
```json
{
  "month": 1,
  "year": 2025,
  "worked_days": [2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19],
  "comment": "Mois complet de développement",
  "client_id": "uuid",
  "provider_id": "uuid",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "CRA created successfully"
}
```

#### Mettre à jour un CRA

```
PUT /api/cras/:id
```

**Body:** (tous les champs sont optionnels)
```json
{
  "month": 2,
  "year": 2025,
  "worked_days": [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
  "comment": "Mise à jour du commentaire",
  "client_id": "uuid",
  "provider_id": "uuid",
  "status": "submitted"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "CRA updated successfully"
}
```

#### Supprimer un CRA

```
DELETE /api/cras/:id
```

**Response:**
```json
{
  "success": true,
  "message": "CRA deleted successfully"
}
```

### Company Endpoints

#### Liste des sociétés

```
GET /api/companies
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "designation": "Acme Corp",
      "address": "123 Rue de la Paix",
      "city": "Paris",
      "postal_code": "75001",
      "country": "France",
      "email": "contact@acme.com",
      "phone": "0123456789",
      "repertoire": "SIREN",
      "repertoire_number": "123456789",
      "dispense": false,
      "registre": "RCS",
      "registre_number": "Paris B 123 456 789",
      "liste": "NAF",
      "code": "6201Z",
      "exemption": false,
      "tva_number": "FR12345678901",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Récupérer une société

```
GET /api/companies/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "designation": "Acme Corp",
    ...
  }
}
```

#### Créer une société

```
POST /api/companies
```

**Body:**
```json
{
  "designation": "Acme Corp",
  "address": "123 Rue de la Paix",
  "complement": "Bâtiment A",
  "city": "Paris",
  "postal_code": "75001",
  "country": "France",
  "email": "contact@acme.com",
  "phone": "0123456789",
  "repertoire": "SIREN",
  "repertoire_number": "123456789",
  "dispense": false,
  "registre": "RCS",
  "registre_number": "Paris B 123 456 789",
  "liste": "NAF",
  "code": "6201Z",
  "exemption": false,
  "tva_number": "FR12345678901"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Company created successfully"
}
```

#### Mettre à jour une société

```
PUT /api/companies/:id
```

**Body:** (tous les champs sont optionnels)
```json
{
  "designation": "New Company Name",
  "email": "newemail@acme.com",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Company updated successfully"
}
```

#### Supprimer une société

```
DELETE /api/companies/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Note:** La suppression d'une société échouera si elle est référencée par des CRA existants (contrainte de clé étrangère).

### Auth Endpoints

#### Inscription

```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Connexion

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", ... },
    "accessToken": "jwt-token"
  }
}
```

#### Utilisateur courant

```
GET /api/auth/me
Authorization: Bearer {accessToken}
```

#### Changer le mot de passe

```
PATCH /api/auth/change-password
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

**Notes:**
- Requiert une authentification (token JWT valide)
- Le mot de passe actuel doit être correct
- Le nouveau mot de passe doit contenir au moins 8 caractères
- Après changement, tous les refresh tokens sont invalidés (force re-login sur tous les appareils)

#### Mot de passe oublié

```
POST /api/auth/forgot-password
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

#### Réinitialiser le mot de passe

```
POST /api/auth/reset-password
```

**Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword456"
}
```

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # Configuration PostgreSQL
│   │   ├── jwt.config.ts         # Configuration JWT (tokens)
│   │   └── email.config.ts       # Configuration emails (templates)
│   ├── controllers/
│   │   ├── auth.controller.ts    # Logique métier authentification
│   │   ├── cra.controller.ts     # Logique métier des CRA
│   │   └── company.controller.ts # Logique métier des sociétés
│   ├── middleware/
│   │   ├── auth.middleware.ts    # Middleware JWT (authenticate)
│   │   └── role.middleware.ts    # Middleware rôles (admin, user)
│   ├── models/
│   │   ├── user.model.ts         # Modèle de données User
│   │   ├── cra.model.ts          # Modèle de données CRA
│   │   └── company.model.ts      # Modèle de données Company
│   ├── routes/
│   │   ├── auth.routes.ts        # Routes Express pour Auth
│   │   ├── cra.routes.ts         # Routes Express pour CRA
│   │   └── company.routes.ts     # Routes Express pour Companies
│   ├── services/
│   │   ├── token.service.ts      # Service JWT (génération, validation)
│   │   └── email.service.ts      # Service emails (envoi via Resend)
│   ├── types/
│   │   ├── auth.types.ts         # Types TypeScript Auth
│   │   ├── cra.types.ts          # Types TypeScript CRA
│   │   └── company.types.ts      # Types TypeScript Company
│   └── server.ts                 # Point d'entrée Express
├── migrations/
│   ├── schema.sql                # Schéma de la DB
│   ├── 004_add_users.sql         # Migration utilisateurs
│   ├── run-all.sh                # Script d'initialisation
│   └── README.md                 # Documentation du schéma
├── .env                          # Variables d'environnement (non versionné)
├── .env.example                  # Template des variables d'environnement
├── package.json
└── tsconfig.json
```

## 🧪 Développement

### Scripts disponibles

```bash
# Développement avec hot-reload
npm run dev

# Compiler TypeScript
npm run build

# Démarrer en production
npm start

# Migrer la base de données
npm run db:migrate

# Linter
npm run lint

# Formater le code
npm run format
```

### Logging

Le serveur log automatiquement :
- Toutes les requêtes HTTP (méthode, path, timestamp)
- Les erreurs avec stack trace en développement
- Les requêtes SQL avec durée d'exécution

### Gestion des erreurs

Toutes les réponses suivent ce format :

**Succès:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erreur:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 🐛 Troubleshooting

### Erreur de connexion PostgreSQL

```
✗ Failed to connect to database
```

**Solutions:**
1. Vérifier que Docker est démarré : `docker ps`
2. Vérifier que PostgreSQL est prêt : `docker logs cra_postgres`
3. Attendre quelques secondes après `docker-compose up`
4. Vérifier les credentials dans `.env`

### Port déjà utilisé

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**
1. Changer le port dans `.env`
2. Tuer le processus qui utilise le port :
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Erreur d'initialisation de la base de données

```
ERROR: relation "cras" already exists
```

**Solution:** Le schéma est déjà appliqué. Si vous voulez réinitialiser complètement :
```bash
docker-compose down
docker volume rm crafter_postgres_data
docker-compose up -d
sleep 5  # Attendre que PostgreSQL soit prêt
npm run db:migrate
```

## 📝 Notes

- Les UUID sont générés automatiquement par PostgreSQL (`gen_random_uuid()`)
- Les timestamps utilisent `CURRENT_TIMESTAMP` avec timezone
- Les transactions sont gérées pour les opérations complexes (create, update)
- Un trigger met à jour automatiquement `updated_at` sur les CRA et les Companies
- La suppression d'un CRA supprime en cascade ses activités
- La suppression d'une Company est protégée si elle est référencée par des CRA (contrainte FK)
- Une société ne peut pas être à la fois client et prestataire sur un même CRA (contrainte CHECK)
- Les champs `client_id` et `provider_id` sont requis pour tous les CRA

## 🔐 Sécurité

- CORS configuré pour accepter uniquement l'origine du frontend
- Validation des entrées dans les controllers
- Requêtes SQL paramétrées (protection contre SQL injection)
- Variables sensibles dans `.env` (non versionné)

## 📚 Documentation supplémentaire

- [Express.js](https://expressjs.com/)
- [node-postgres](https://node-postgres.com/)
- [PostgreSQL 16](https://www.postgresql.org/docs/16/)
- [TypeScript](https://www.typescriptlang.org/)
