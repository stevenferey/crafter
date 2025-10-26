# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack Technique

- **Framework**: React 18.3 avec TypeScript 5.6
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 avec `@tailwindcss/postcss`
- **Router**: React Router DOM v7
- **Linting**: ESLint 9 avec TypeScript ESLint
- **Formatting**: Prettier
- **Utilitaires**: clsx + tailwind-merge (via fonction `cn()`)

## Variables d'Environnement

Le projet utilise des variables d'environnement pour la configuration. Copier `.env.example` vers `.env.local` et remplir les valeurs :

```bash
# API Backend URL
VITE_API_URL=http://localhost:3000/api

# AI API Key (optionnel, pour fonctionnalités d'aide IA)
VITE_AI_API_KEY=

# Application Name
VITE_APP_NAME=Crafter
```

**Important** :
- `.env.local` est ignoré par git et contient les valeurs sensibles
- `.env.example` est versionné et sert de template
- Les types TypeScript pour `import.meta.env` sont définis dans `src/vite-env.d.ts`
- Accéder aux variables via `import.meta.env.VITE_*` ou utiliser l'objet `env` exporté depuis `src/services/api.ts`

## Commandes Principales

```bash
# Développement
npm run dev              # Démarre le serveur de développement Vite

# Build et Production
npm run build            # Compile TypeScript puis build pour production
npm run preview          # Prévisualise le build de production

# Qualité du Code
npm run lint             # Vérifie les erreurs ESLint
npm run lint:fix         # Corrige automatiquement les erreurs ESLint
npm run format           # Formate le code avec Prettier
npm run type-check       # Vérifie les erreurs TypeScript sans émettre de fichiers
```

## Architecture du Projet

### Structure des Dossiers

```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables (Button, Input, etc.)
│   ├── layout/          # Composants de mise en page (Header, Footer, etc.)
│   └── features/        # Composants spécifiques aux fonctionnalités
├── hooks/               # Custom React hooks
├── lib/                 # Fonctions utilitaires et helpers
├── pages/               # Composants de pages/routes
├── services/            # Services API et logique métier
├── stores/              # State management (Context, Zustand, etc.)
└── types/               # Types et interfaces TypeScript partagés
```

### Décisions Techniques Clés

1. **Path Aliases**: Le projet utilise `@/*` pour référencer `./src/*`
   - Configuré dans `tsconfig.app.json` (paths) et `vite.config.ts` (resolve.alias)
   - Exemple: `import { Button } from '@/components/ui/Button'`

2. **Tailwind CSS v4**: Utilise le nouveau package `@tailwindcss/postcss`
   - Configuration dans `postcss.config.js`
   - Directives dans `src/index.css` (`@tailwind base/components/utilities`)

3. **Système de Composants**:
   - Composants UI avec variants et sizes (voir `Button.tsx`)
   - Utilise `forwardRef` pour l'accessibilité et les refs
   - Fonction utilitaire `cn()` dans `src/lib/utils.ts` pour fusionner les classes Tailwind

4. **TypeScript Strict**: Mode strict activé avec options de linting strictes
   - `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

5. **ESLint + Prettier**:
   - ESLint pour le linting du code
   - Prettier pour le formatage avec `eslint-config-prettier` pour éviter les conflits
   - Configuration Prettier: `semi: true`, `singleQuote: true`, `printWidth: 80`

6. **API Client** (`src/services/api.ts`):
   - Client HTTP typé avec gestion d'erreurs intégrée
   - Méthodes disponibles: `api.get()`, `api.post()`, `api.put()`, `api.patch()`, `api.delete()`
   - Classe `ApiError` pour gérer les erreurs API avec status et data
   - Utilise automatiquement `VITE_API_URL` pour le base URL

Exemple d'utilisation de l'API client:
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

## Développement de Composants UI

Lors de la création de nouveaux composants UI dans `src/components/ui/`:

1. Utiliser TypeScript strict avec types explicites
2. Utiliser `forwardRef` pour permettre les refs
3. Exporter les types d'interfaces avec le composant
4. Utiliser la fonction `cn()` pour fusionner les classes Tailwind
5. Implémenter des variants avec des objets de mapping de classes
6. Assurer l'accessibilité (ARIA attributes, keyboard navigation)

Exemple de pattern:
```tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary';
}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return <element ref={ref} className={cn(baseClasses, variantClasses[variant], className)} {...props} />
  }
);

Component.displayName = 'Component';

export { Component, type ComponentProps };
```

## Hooks Personnalisés

### useApi - Gestion de requêtes API avec état

Hook pour gérer automatiquement l'état de chargement et les erreurs des requêtes API :

```tsx
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api';

function UserList() {
  const { data, loading, error } = useApi(
    () => api.get<User[]>('/users'),
    [] // dependencies
  );

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <ul>
      {data?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### useApiMutation - Mutations API (POST, PUT, DELETE)

Hook pour les opérations de mutation avec gestion d'état :

```tsx
import { useApiMutation } from '@/hooks/useApi';
import { api } from '@/services/api';

function DeleteUserButton({ userId }: { userId: string }) {
  const { mutate, loading, error } = useApiMutation(
    (id: string) => api.delete(`/users/${id}`)
  );

  const handleDelete = async () => {
    const result = await mutate(userId);
    if (result) {
      console.log('Utilisateur supprimé');
    }
  };

  return (
    <>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Suppression...' : 'Supprimer'}
      </button>
      {error && <p>Erreur: {error.message}</p>}
    </>
  );
}
```

## Notes Importantes

- Le fichier `App.css` n'est pas utilisé (supprimé) car Tailwind CSS gère tous les styles
- Vite utilise le mode ESNext avec support des modules ES
- Les hooks de pré-commit ne sont pas configurés (à ajouter si nécessaire)
