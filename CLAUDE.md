# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Utilisation de Context7 MCP

**IMPORTANT** : Ce projet utilise le serveur MCP Context7 pour accéder aux documentations officielles des bibliothèques.

### Quand utiliser Context7

Utilisez **systématiquement** Context7 dans les situations suivantes :

1. **Avant d'implémenter une nouvelle fonctionnalité** avec une bibliothèque externe
2. **En cas de doute** sur la syntaxe ou l'API d'une bibliothèque
3. **Lors de la mise à jour** d'une dépendance majeure
4. **Pour vérifier les bonnes pratiques** recommandées par les mainteneurs

### Comment utiliser Context7

```typescript
// 1. Résoudre l'ID de la bibliothèque
mcp__context7__resolve-library-id({ libraryName: "react-router-dom" })

// 2. Récupérer la documentation
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/remix-run/react-router/7.6.2",
  topic: "createBrowserRouter RouterProvider useNavigate",
  tokens: 3000
})
```

### Bibliothèques principales du projet

- **Tailwind CSS v4** : `/tailwindlabs/tailwindcss.com`
- **React Router v7** : `/remix-run/react-router/7.6.2`
- **React** : `/facebook/react`

### Avantages

- ✅ Documentation **toujours à jour**
- ✅ Exemples de code **officiels et vérifiés**
- ✅ Évite les erreurs dues à une documentation obsolète
- ✅ Meilleure compréhension des APIs et bonnes pratiques

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
   - Configuration dans `postcss.config.js` avec `'@tailwindcss/postcss': {}`
   - Import dans `src/index.css` : `@import "tailwindcss";` (nouvelle syntaxe v4)
   - Plus besoin de `tailwind.config.js` pour la configuration de base
   - Customisation via `@theme` en CSS si nécessaire

3. **React Router v7**: Configuration avec `createBrowserRouter`
   - Router défini dans `src/router.tsx` avec `createBrowserRouter`
   - Routes organisées avec la propriété `children` pour les routes imbriquées
   - Layout principal dans `src/components/layout/AppLayout.tsx` avec `<Outlet />`
   - Pages dans `src/pages/` (Dashboard, CreateCRA, EditCRA, PreviewCRA)
   - Navigation avec `<Link>` et `useNavigate()`
   - Paramètres dynamiques avec `useParams()`
   - Routes principales :
     - `/` → Dashboard
     - `/cra/new` → CreateCRA
     - `/cra/:id/edit` → EditCRA
     - `/cra/:id/preview` → PreviewCRA

Exemple de configuration du router :
```tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'cra/new', element: <CreateCRA /> },
      { path: 'cra/:id/edit', element: <EditCRA /> },
    ],
  },
]);
```

Utilisation dans `main.tsx` :
```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

4. **Système de Composants**:
   - Composants UI avec variants et sizes (voir `Button.tsx`)
   - Utilise `forwardRef` pour l'accessibilité et les refs
   - Fonction utilitaire `cn()` dans `src/lib/utils.ts` pour fusionner les classes Tailwind

5. **TypeScript Strict**: Mode strict activé avec options de linting strictes
   - `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

6. **ESLint + Prettier**:
   - ESLint pour le linting du code
   - Prettier pour le formatage avec `eslint-config-prettier` pour éviter les conflits
   - Configuration Prettier: `semi: true`, `singleQuote: true`, `printWidth: 80`

7. **API Client** (`src/services/api.ts`):
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

### Configuration Tailwind CSS v4

- **Syntaxe d'import** : Utiliser `@import "tailwindcss";` dans `src/index.css` (PAS `@tailwind base/components/utilities`)
- **Configuration PostCSS** : Le plugin `@tailwindcss/postcss` est requis
- **Pas de config JS** : Le fichier `tailwind.config.js` n'est pas nécessaire pour la configuration de base
- **Référence** : Toujours vérifier avec Context7 (`/tailwindlabs/tailwindcss.com`) en cas de doute

### Utilisation de Context7

- **TOUJOURS** consulter la documentation officielle via Context7 avant d'implémenter une nouvelle fonctionnalité
- Exemples de requêtes utiles :
  - Tailwind CSS : `/tailwindlabs/tailwindcss.com` avec topic "configuration setup import"
  - React Router : `/remix-run/react-router/7.6.2` avec topic "createBrowserRouter useNavigate"

### Autres Notes

- Le fichier `App.css` n'est pas utilisé (supprimé) car Tailwind CSS gère tous les styles
- Vite utilise le mode ESNext avec support des modules ES
- Les hooks de pré-commit ne sont pas configurés (à ajouter si nécessaire)
- L'application utilise React Router v7 avec `createBrowserRouter` (nouvelle API recommandée)
