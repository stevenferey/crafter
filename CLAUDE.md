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

- **Framework**: React 19 avec TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 avec `@tailwindcss/postcss`
- **Router**: React Router DOM v7
- **Linting**: ESLint 10 avec TypeScript ESLint
- **Formatting**: Prettier
- **Utilitaires**: clsx + tailwind-merge (via fonction `cn()`)

## Variables d'Environnement

Le projet utilise des variables d'environnement pour la configuration. Copier `.env.example` vers `.env.local` et remplir les valeurs :

```bash
# API Backend URL
VITE_API_URL=http://localhost:3001/api

# Application Name
VITE_APP_NAME=Crafter

# Donation addresses (optionnel, pour afficher les boutons de dons)
VITE_DONATION_BTC=
VITE_DONATION_ETH=

# SEO (optionnel, pour génération sitemap/robots.txt et meta tags)
VITE_SITE_URL=
VITE_INDEXABLE=
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
│   ├── layout/          # Composants de mise en page (AppLayout)
│   ├── auth/            # Composants d'authentification (ProtectedRoute)
│   ├── features/        # Composants spécifiques aux fonctionnalités
│   └── pdf/             # Composants de génération PDF
├── constants/           # Constantes de l'application
├── hooks/               # Custom React hooks
├── lib/                 # Fonctions utilitaires et helpers
├── pages/               # Composants de pages/routes
├── plugins/             # Plugins Vite (SEO, sitemap, robots.txt)
├── schemas/             # Schémas de validation Zod
├── services/            # Services API et logique métier
├── stores/              # State management (Zustand)
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
   - Pages dans `src/pages/`
   - Navigation avec `<Link>` et `useNavigate()`
   - Paramètres dynamiques avec `useParams()`
   - Routes principales :
     - `/` → Landing (page publique)
     - `/login`, `/register` → Authentification
     - `/forgot-password` → Mot de passe oublié
     - `/reset-password/:token` → Réinitialisation du mot de passe
     - `/verify-email/:token` → Vérification email
     - `/dashboard` → Dashboard (utilisateurs connectés)
     - `/dashboard/cra/new` → CreateCRA
     - `/dashboard/cra/:id/edit` → EditCRA
     - `/dashboard/cra/:id/preview` → PreviewCRA
     - `/dashboard/companies` → Liste des sociétés
     - `/dashboard/companies/new` → CreateCompany
     - `/dashboard/companies/:id/edit` → EditCompany
     - `/dashboard/settings` → Paramètres (changement de mot de passe)

Exemple de configuration du router :
```tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

export const router = createBrowserRouter([
  // Routes publiques
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },
  { path: '/verify-email/:token', element: <VerifyEmail /> },

  // Routes protégées (utilisateurs connectés)
  {
    path: '/dashboard',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'cra/new', element: <CreateCRA /> },
      { path: 'cra/:id/edit', element: <EditCRA /> },
      { path: 'cra/:id/preview', element: <PreviewCRA /> },
      { path: 'companies', element: <Companies /> },
      { path: 'companies/new', element: <CreateCompany /> },
      { path: 'companies/:id/edit', element: <EditCompany /> },
      { path: 'settings', element: <Settings /> },
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

## 📝 Maintenance de la Documentation

### Principe : Documentation Vivante

La documentation doit **toujours refléter l'état actuel du code**. Après chaque développement significatif, analyser et mettre à jour la documentation.

### Quand mettre à jour la documentation

Mettre à jour la documentation dans les cas suivants :

1. **Changement d'architecture majeur**
   - Migration de localStorage vers API backend
   - Changement de structure de données
   - Ajout/suppression de couches (backend, microservices, etc.)

2. **Nouvelles fonctionnalités**
   - Nouveaux endpoints API
   - Nouveaux composants majeurs
   - Nouvelles dépendances importantes

3. **Modifications de configuration**
   - Changement de ports
   - Nouvelles variables d'environnement
   - Modifications de Docker Compose

4. **Refactoring significatif**
   - Changement de conventions de nommage
   - Réorganisation des dossiers
   - Migration de bibliothèques

### Procédure de mise à jour

#### 1. Identifier les fichiers markdown

```bash
# Lister tous les fichiers .md du projet (hors node_modules)
find . -name "*.md" -not -path "*/node_modules/*"
```

Fichiers à vérifier systématiquement :
- `README.md` - Documentation principale du projet
- `CLAUDE.md` - Ce fichier (instructions pour Claude Code)
- `PROJECT.md` - Architecture et conventions
- `backend/README.md` - Documentation du backend (si applicable)
- Tout autre fichier `.md` à la racine ou dans les sous-dossiers

#### 2. Analyser chaque fichier

Pour chaque fichier markdown, vérifier :

**Questions à se poser** :
- ✅ Les exemples de code sont-ils à jour ?
- ✅ Les noms de fichiers/dossiers existent-ils toujours ?
- ✅ Les ports/URLs sont-ils corrects ?
- ✅ La structure de données correspond-elle au code actuel ?
- ✅ Les commandes fonctionnent-elles encore ?
- ✅ Les dépendances listées sont-elles installées ?

**Signes d'obsolescence** :
- ❌ Mention de technologies/services supprimés
- ❌ Références à des fichiers qui n'existent plus
- ❌ Instructions qui ne fonctionnent plus
- ❌ Architecture décrite différente de l'implémentation
- ❌ Ports/URLs incorrects

#### 3. Actions possibles

**Option A - Mettre à jour**
Si le fichier reste pertinent mais contient des informations obsolètes :
```typescript
// Corriger les sections obsolètes
Edit(filePath, oldContent, newContent)
```

**Option B - Supprimer**
Si le fichier décrit une architecture complètement abandonnée :
```bash
# Supprimer les fichiers obsolètes
rm path/to/obsolete.md
```

**Option C - Créer**
Si un nouveau composant majeur manque de documentation :
```typescript
// Créer une nouvelle documentation
Write('docs/NEW_FEATURE.md', content)
```

### Exemples de maintenance

#### Exemple 1 : Migration localStorage → API Backend

**Avant** (LOCALSTORAGE_PERSISTENCE.md) :
```markdown
# Persistance LocalStorage Implémentée ✅
Le store CRA utilise le middleware `persist` de Zustand...
```

**Action** : 🗑️ **SUPPRIMER** - L'architecture localStorage n'existe plus
```bash
rm LOCALSTORAGE_PERSISTENCE.md
```

**Raison** : Le projet utilise maintenant PostgreSQL + API REST

#### Exemple 2 : Changement de port

**Avant** (CLAUDE.md) :
```bash
VITE_API_URL=http://localhost:3000/api
```

**Action** : ✏️ **CORRIGER**
```bash
VITE_API_URL=http://localhost:3001/api
```

**Raison** : Le backend écoute sur le port 3001

#### Exemple 3 : Nouveau backend

**Avant** : Pas de documentation backend

**Action** : ✨ **CRÉER** `backend/README.md`
```markdown
# Backend API Documentation
## Endpoints
- GET /api/cras
- POST /api/cras
...
```

### Workflow automatique recommandé

Après chaque développement significatif, suivre ces étapes :

```bash
# 1. Lister tous les fichiers markdown
find . -name "*.md" -not -path "*/node_modules/*"

# 2. Lire chaque fichier
Read("README.md")
Read("CLAUDE.md")
Read("backend/README.md")
# ...

# 3. Analyser et identifier les obsolescences
# - Comparer avec le code actuel
# - Vérifier les références aux fichiers
# - Tester les commandes mentionnées

# 4. Appliquer les corrections
# - Supprimer les fichiers obsolètes
# - Mettre à jour les informations incorrectes
# - Ajouter la documentation manquante

# 5. Vérifier la cohérence
# - Tous les README pointent vers les bons fichiers
# - Les ports/URLs sont cohérents partout
# - Les exemples de code fonctionnent
```

### Checklist de vérification

Avant de finaliser une session de développement :

- [ ] Lire tous les fichiers `.md` du projet
- [ ] Vérifier que les exemples de code sont à jour
- [ ] Confirmer que les ports/URLs sont corrects
- [ ] Valider que la structure décrite correspond au code
- [ ] Supprimer toute documentation d'architecture abandonnée
- [ ] Ajouter la documentation des nouvelles fonctionnalités majeures
- [ ] Vérifier la cohérence entre tous les fichiers markdown

### Principes de documentation

1. **Précision** : Préférer supprimer que laisser une doc incorrecte
2. **Minimalisme** : Ne documenter que l'essentiel, le code doit être auto-documenté
3. **Cohérence** : Les mêmes informations doivent être identiques partout
4. **Actualité** : Mieux vaut pas de doc qu'une doc obsolète
5. **Clarté** : Utiliser des exemples concrets et des commandes testées

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
