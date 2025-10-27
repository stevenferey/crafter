# Crafter Backend API

Backend API REST pour l'application Crafter CRA (Compte Rendu d'Activité).

## 🛠️ Stack Technique

- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Language**: TypeScript 5.x
- **Base de données**: PostgreSQL 16
- **ORM**: pg (node-postgres) - Client PostgreSQL natif
- **Dev Tools**: tsx, nodemon

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
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
- Exécute les migrations si nécessaire
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
# Méthode 1 : Via npm script
npm run db:migrate

# Méthode 2 : Via Docker exec
docker exec -i cra_postgres psql -U cra_user -d cra_db < migrations/init.sql
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

#### Table `cras`
```sql
- id (UUID, primary key)
- date (DATE)
- client (VARCHAR)
- total_hours (DECIMAL)
- status (ENUM: draft, submitted, approved, rejected)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Table `activities`
```sql
- id (UUID, primary key)
- cra_id (UUID, foreign key → cras.id)
- description (TEXT)
- hours (DECIMAL)
- category (VARCHAR)
- created_at (TIMESTAMP)
```

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
GET /api/cras?status={status}&client={client}&startDate={date}&endDate={date}&limit={n}&offset={n}
```

**Query Parameters:**
- `status` (optional) : Filtrer par statut (draft, submitted, approved, rejected)
- `client` (optional) : Rechercher par nom de client
- `startDate` (optional) : Date de début (YYYY-MM-DD)
- `endDate` (optional) : Date de fin (YYYY-MM-DD)
- `limit` (optional) : Nombre de résultats (défaut: 50)
- `offset` (optional) : Décalage pour pagination (défaut: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2025-01-15",
      "client": "Acme Corp",
      "total_hours": 8.0,
      "status": "draft",
      "activities": [
        {
          "id": "uuid",
          "description": "Développement",
          "hours": 4.0,
          "category": "Dev"
        }
      ],
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
    "date": "2025-01-15",
    "client": "Acme Corp",
    "total_hours": 8.0,
    "status": "draft",
    "activities": [...],
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
  "date": "2025-01-15",
  "client": "Acme Corp",
  "status": "draft",
  "activities": [
    {
      "description": "Développement de fonctionnalité",
      "hours": 4.0,
      "category": "Développement"
    },
    {
      "description": "Réunion client",
      "hours": 1.0,
      "category": "Réunion"
    }
  ]
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
  "date": "2025-01-16",
  "client": "New Client",
  "status": "submitted",
  "activities": [...]
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

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Configuration PostgreSQL
│   ├── controllers/
│   │   └── cra.controller.ts # Logique métier des CRA
│   ├── models/
│   │   └── cra.model.ts      # Modèle de données et requêtes SQL
│   ├── routes/
│   │   └── cra.routes.ts     # Définition des routes Express
│   ├── types/
│   │   └── cra.types.ts      # Types TypeScript
│   └── server.ts             # Point d'entrée Express
├── migrations/
│   └── init.sql              # Script d'initialisation de la DB
├── .env                      # Variables d'environnement (non versionné)
├── .env.example              # Template des variables d'environnement
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

### Erreur de migration

```
ERROR: relation "cras" already exists
```

**Solution:** La base de données est déjà initialisée. Si vous voulez réinitialiser :
```bash
docker-compose down
docker volume rm crafter_postgres_data
docker-compose up -d
npm run db:migrate
```

## 📝 Notes

- Les UUID sont générés automatiquement par PostgreSQL (`gen_random_uuid()`)
- Les timestamps utilisent `CURRENT_TIMESTAMP` avec timezone
- Les transactions sont gérées pour les opérations complexes (create, update)
- Un trigger met à jour automatiquement `updated_at` sur les CRA
- La suppression d'un CRA supprime en cascade ses activités

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
