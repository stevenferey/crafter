# Crafter

Application full-stack de gestion de CRA (Comptes Rendus d'Activité) construite avec React, TypeScript, Express et PostgreSQL.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Docker et Docker Compose
- npm ou yarn

### Installation & Démarrage Automatique

**Méthode recommandée** - Lance automatiquement tout l'environnement (Docker, Backend, Frontend) :

```bash
# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd backend && npm install && cd ..

# Copier les fichiers d'environnement
cp .env.example .env.local
cp backend/.env.example backend/.env

# Démarrer tout l'environnement (Docker + Backend + Frontend)
./start-dev.sh
```

Le script démarre automatiquement :
- 🐘 PostgreSQL sur le port 5432
- 🗄️ Adminer (interface DB) sur http://localhost:8080
- 🔧 Backend API sur http://localhost:3001
- ⚛️ Frontend React sur http://localhost:5173

### Démarrage Manuel

#### 1. Démarrer Docker

```bash
# Démarrer PostgreSQL et Adminer
docker-compose up -d

# Attendre que PostgreSQL soit prêt (5-10 secondes)
```

#### 2. Initialiser la base de données

```bash
cd backend
npm run db:migrate
cd ..
```

#### 3. Démarrer le backend

```bash
cd backend
npm run dev
# Backend démarre sur http://localhost:3001
```

#### 4. Démarrer le frontend

```bash
# Dans un nouveau terminal, à la racine du projet
npm run dev
# Frontend démarre sur http://localhost:5173
```

### Qualité du Code

```bash
# Vérifier les erreurs ESLint
npm run lint

# Corriger automatiquement les erreurs ESLint
npm run lint:fix

# Formater le code avec Prettier
npm run format

# Vérifier les types TypeScript
npm run type-check
```

## 📦 Stack Technique

### Frontend
- **Framework**: React 18.3 avec TypeScript 5.6
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 avec PostCSS
- **Router**: React Router DOM v7
- **Linting**: ESLint 9 + Prettier
- **API Client**: Fetch API avec hooks personnalisés

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Language**: TypeScript 5.x
- **Base de données**: PostgreSQL 16
- **Client DB**: node-postgres (pg)
- **Dev Tools**: tsx, nodemon

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database UI**: Adminer
- **Orchestration**: Bash scripts pour automatisation

## 🏗️ Architecture

Le projet suit une architecture full-stack avec séparation frontend/backend :

```
crafter/
├── frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/     # Composants React réutilisables
│   │   │   ├── ui/        # Composants UI de base
│   │   │   ├── layout/    # Composants de mise en page
│   │   │   └── features/  # Composants spécifiques
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Fonctions utilitaires
│   │   ├── pages/         # Composants de pages/routes
│   │   ├── services/      # Services API (craService, api)
│   │   ├── stores/        # State management
│   │   └── types/         # Types TypeScript partagés
│   ├── .env.local         # Variables d'environnement frontend
│   └── package.json
│
├── backend/ (Express + TypeScript + PostgreSQL)
│   ├── src/
│   │   ├── config/        # Configuration (database.ts)
│   │   ├── controllers/   # Logique métier (cra.controller.ts)
│   │   ├── models/        # Modèles et requêtes SQL (cra.model.ts)
│   │   ├── routes/        # Routes Express (cra.routes.ts)
│   │   ├── types/         # Types TypeScript backend
│   │   └── server.ts      # Point d'entrée Express
│   ├── migrations/        # Scripts SQL (init.sql)
│   ├── .env               # Variables d'environnement backend
│   └── package.json
│
├── docker-compose.yml     # Configuration Docker (PostgreSQL + Adminer)
├── start-dev.sh           # Script de démarrage automatique
└── README.md
```

### Architecture Backend - REST API

```
┌─────────────┐      HTTP      ┌──────────────┐
│   Frontend  │────────────────→│   Express    │
│   (React)   │←────────────────│   Server     │
└─────────────┘      JSON       └──────┬───────┘
                                       │
                                       │ SQL
                                       ↓
                                ┌──────────────┐
                                │  PostgreSQL  │
                                │   Database   │
                                └──────────────┘
```

### Flow de données

1. **Frontend** (React) envoie des requêtes HTTP au Backend via `craService`
2. **Routes** (Express) reçoivent les requêtes et les dirigent vers les Controllers
3. **Controllers** gèrent la logique métier, valident les données
4. **Models** exécutent les requêtes SQL sur PostgreSQL
5. **Backend** renvoie une réponse JSON standardisée au Frontend

Format de réponse API :
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

## 🔧 Configuration

### Variables d'Environnement

#### Frontend (`.env.local`)

```bash
VITE_API_URL=http://localhost:3001/api
VITE_AI_API_KEY=
VITE_APP_NAME=Crafter
```

#### Backend (`backend/.env`)

```bash
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=cra_db
DB_USER=cra_user
DB_PASSWORD=cra_password

CORS_ORIGIN=http://localhost:5173
```

Voir `.env.example` et `backend/.env.example` pour les templates complets.

## 🗄️ Base de Données

### Accès à Adminer (Interface Web)

URL : http://localhost:8080

Identifiants :
- Système : PostgreSQL
- Serveur : postgres
- Utilisateur : cra_user
- Mot de passe : cra_password
- Base de données : cra_db

### Structure des Tables

**Table `cras`**
- `id` (UUID) - Clé primaire
- `date` (DATE) - Date du CRA
- `client` (VARCHAR) - Nom du client
- `total_hours` (DECIMAL) - Total d'heures
- `status` (ENUM) - Statut : draft, submitted, approved, rejected
- `created_at`, `updated_at` (TIMESTAMP)

**Table `activities`**
- `id` (UUID) - Clé primaire
- `cra_id` (UUID) - Clé étrangère vers `cras`
- `description` (TEXT) - Description de l'activité
- `hours` (DECIMAL) - Nombre d'heures
- `category` (VARCHAR) - Catégorie
- `created_at` (TIMESTAMP)

### Commandes Utiles

```bash
# Accéder à PostgreSQL via Docker
docker exec -it cra_postgres psql -U cra_user -d cra_db

# Voir les logs PostgreSQL
docker logs cra_postgres

# Réinitialiser la base de données
docker-compose down
docker volume rm crafter_postgres_data
docker-compose up -d
cd backend && npm run db:migrate
```

## 📡 API Documentation

Base URL : `http://localhost:3001/api`

### Endpoints CRA

- `GET /api/cras` - Liste tous les CRA (avec filtres optionnels)
- `GET /api/cras/:id` - Récupère un CRA spécifique
- `POST /api/cras` - Crée un nouveau CRA
- `PUT /api/cras/:id` - Met à jour un CRA
- `DELETE /api/cras/:id` - Supprime un CRA
- `GET /api/health` - Health check du serveur

Pour la documentation complète de l'API, voir [backend/README.md](backend/README.md)

## 🐛 Troubleshooting

### Port déjà utilisé

Si le port 3001 ou 5173 est déjà utilisé :

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Ou changer le port dans .env
```

### PostgreSQL ne démarre pas

```bash
# Vérifier les logs
docker logs cra_postgres

# Redémarrer Docker
docker-compose restart postgres
```

### Erreur "Cannot connect to database"

1. Vérifier que Docker est démarré : `docker ps`
2. Attendre 10 secondes après `docker-compose up`
3. Vérifier les credentials dans `backend/.env`

## 📚 Documentation

Pour plus de détails sur le développement et l'architecture, consultez :
- [backend/README.md](backend/README.md) - Documentation complète du backend
- [CLAUDE.md](CLAUDE.md) - Guide pour Claude Code
- [PROJECT.md](PROJECT.md) - Documentation du projet

## 📄 Licence

Ce projet est sous licence MIT.

Le code source est libre d'utilisation, mais chaque instance déployée reste la propriété de son hébergeur.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

© 2025 DiscoData. Tous droits réservés.
