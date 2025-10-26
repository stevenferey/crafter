# Crafter

Application React moderne construite avec Vite, TypeScript et Tailwind CSS.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Éditer .env.local avec vos configurations
```

### Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Compiler le projet
npm run build

# Prévisualiser le build de production
npm run preview
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

- **Framework**: React 18.3 avec TypeScript 5.6
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Router**: React Router DOM v7
- **Linting**: ESLint 9 + Prettier
- **API Client**: Fetch API avec hooks personnalisés

## 🏗️ Architecture

Le projet suit une structure modulaire avec séparation des préoccupations :

```
src/
├── components/     # Composants React réutilisables
│   ├── ui/        # Composants UI de base (Button, Input, etc.)
│   ├── layout/    # Composants de mise en page
│   └── features/  # Composants spécifiques aux fonctionnalités
├── hooks/         # Custom React hooks
├── lib/           # Fonctions utilitaires
├── pages/         # Composants de pages/routes
├── services/      # Services API et logique métier
├── stores/        # State management
└── types/         # Types TypeScript partagés
```

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env.local` à la racine du projet :

```bash
VITE_API_URL=http://localhost:3000/api
VITE_AI_API_KEY=
VITE_APP_NAME=Crafter
```

Voir `.env.example` pour la liste complète des variables.

## 📚 Documentation

Pour plus de détails sur le développement et l'architecture, consultez :
- [CLAUDE.md](CLAUDE.md) - Guide pour Claude Code
- [PROJECT.md](PROJECT.md) - Documentation du projet

## 📄 Licence

Ce projet est sous licence MIT.

Le code source est libre d'utilisation, mais chaque instance déployée reste la propriété de son hébergeur.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

© 2025 DiscoData. Tous droits réservés.
