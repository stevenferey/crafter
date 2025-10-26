# Crafter

Générateur de Compte Rendu d'Activité (CRA) pour les indépendants et freelances.

## Description

Crafter est une application web moderne conçue pour faciliter la gestion et la génération de Comptes Rendus d'Activité (CRA) pour les professionnels indépendants. L'application permet de suivre vos activités, gérer vos projets clients et générer automatiquement des CRA professionnels.

## Stack Technique

- **Framework**: React 18.3 avec TypeScript 5.6
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 avec `@tailwindcss/postcss`
- **Router**: React Router DOM v7
- **Linting**: ESLint 9 avec TypeScript ESLint
- **Formatting**: Prettier
- **Utilitaires**: clsx + tailwind-merge

## Architecture du Projet

```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables (Button, Input, etc.)
│   ├── layout/          # Composants de mise en page (Header, Footer, Sidebar)
│   └── features/        # Composants spécifiques aux fonctionnalités (CRA, Projets)
├── hooks/               # Custom React hooks (useApi, useApiMutation)
├── lib/                 # Fonctions utilitaires (cn pour Tailwind)
├── pages/               # Composants de pages/routes
├── services/            # Services API et logique métier
├── stores/              # State management (Context API, Zustand, etc.)
└── types/               # Types et interfaces TypeScript partagés
```

### Composants Principaux

- **components/ui**: Système de design avec composants réutilisables (Button avec variants et sizes)
- **services/api.ts**: Client HTTP typé avec gestion d'erreurs intégrée
- **hooks/useApi.ts**: Hooks pour gérer les requêtes API avec état automatique

## Prérequis

- Node.js 18+
- npm ou yarn

## Installation

1. Cloner le repository :
```bash
git clone <repository-url>
cd crafter
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```

Puis éditer `.env.local` avec vos valeurs :
```bash
VITE_API_URL=http://localhost:3000/api
VITE_AI_API_KEY=votre_clé_api (optionnel)
VITE_APP_NAME=Crafter
```

## Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_API_URL` | URL de l'API backend | Oui |
| `VITE_AI_API_KEY` | Clé API pour fonctionnalités IA | Non |
| `VITE_APP_NAME` | Nom de l'application | Oui |

**Important** :
- Les variables d'environnement doivent être préfixées par `VITE_` pour être accessibles dans le code
- `.env.local` est ignoré par git et contient les valeurs sensibles
- `.env.example` sert de template et est versionné

## Démarrage

### Développement

Démarrer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build Production

Compiler l'application pour la production :
```bash
npm run build
```

Prévisualiser le build de production :
```bash
npm run preview
```

## Scripts Disponibles

```bash
npm run dev          # Démarre le serveur de développement Vite
npm run build        # Compile TypeScript puis build pour production
npm run preview      # Prévisualise le build de production
npm run lint         # Vérifie les erreurs ESLint
npm run lint:fix     # Corrige automatiquement les erreurs ESLint
npm run format       # Formate le code avec Prettier
npm run type-check   # Vérifie les erreurs TypeScript sans émettre de fichiers
```

## Utilisation de l'API Client

Le projet inclut un client API typé avec gestion d'erreurs :

```tsx
import { api, ApiError } from '@/services/api';

// GET request
const users = await api.get<User[]>('/users');

// POST request
const newUser = await api.post<User>('/users', { name: 'John' });

// Gestion d'erreurs
try {
  await api.delete('/users/123');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Erreur ${error.status}:`, error.message);
  }
}
```

### Hooks API

**useApi** - Pour les requêtes GET avec gestion d'état :
```tsx
import { useApi } from '@/hooks/useApi';

const { data, loading, error } = useApi(
  () => api.get<User[]>('/users'),
  [] // dependencies
);
```

**useApiMutation** - Pour POST/PUT/DELETE :
```tsx
import { useApiMutation } from '@/hooks/useApi';

const { mutate, loading, error } = useApiMutation(
  (id: string) => api.delete(`/users/${id}`)
);

await mutate('123');
```

## Développement

### Conventions de Code

- **TypeScript Strict Mode** : Activé avec linting strict
- **Path Aliases** : Utiliser `@/*` pour référencer `./src/*`
- **Composants UI** : Utiliser `forwardRef`, variants, et la fonction `cn()` pour Tailwind
- **Formatage** : Prettier avec `semi: true`, `singleQuote: true`, `printWidth: 80`

### Créer un Nouveau Composant UI

```tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary';
}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';

export { Component, type ComponentProps };
```

## Documentation

Pour plus de détails sur l'architecture et les conventions du projet, consulter [CLAUDE.md](./CLAUDE.md).

## Licence

MIT

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
