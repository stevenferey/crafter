# Documentation du Projet Crafter

## 📋 Vue d'Ensemble

Crafter est une application web moderne construite avec React, TypeScript et Vite. Ce document décrit l'architecture du projet, les décisions techniques et les directives de développement.

## 🎯 Objectifs du Projet

- Fournir une base solide pour le développement d'applications React
- Utiliser les meilleures pratiques de développement web moderne
- Maintenir un code de haute qualité avec TypeScript strict
- Faciliter le développement avec des outils modernes et performants

## 🏗️ Architecture Technique

### Structure du Code

Le projet suit une architecture modulaire avec une séparation claire des responsabilités :

- **components/** - Composants React organisés par type (ui, layout, features)
- **hooks/** - Custom React hooks pour la logique réutilisable
- **lib/** - Fonctions utilitaires et helpers
- **pages/** - Composants de pages pour le routing
- **services/** - Services API et logique métier
- **stores/** - Gestion d'état global
- **types/** - Définitions TypeScript partagées

### Stack Technique

#### Frontend
- **React 18.3** - Bibliothèque UI avec concurrent features
- **TypeScript 5.6** - Typage statique strict
- **Vite 6** - Build tool rapide avec HMR
- **Tailwind CSS v4** - Framework CSS utility-first
- **React Router DOM v7** - Routing client-side

#### Développement
- **ESLint 9** - Linting du code JavaScript/TypeScript
- **Prettier** - Formatage automatique du code
- **TypeScript ESLint** - Rules ESLint pour TypeScript

#### API & Data
- **Fetch API** - Requêtes HTTP natives
- **Custom hooks** - `useApi` et `useApiMutation` pour la gestion d'état

### Conventions de Code

#### TypeScript
- Mode strict activé
- Typage explicite pour toutes les interfaces publiques
- Utilisation de `type` pour les unions, `interface` pour les objets
- Pas de `any` - utiliser `unknown` si nécessaire

#### React
- Composants fonctionnels uniquement
- Hooks pour la gestion d'état et effets
- `forwardRef` pour les composants UI réutilisables
- PropTypes via TypeScript interfaces

#### Styling
- Tailwind CSS pour tous les styles
- Fonction utilitaire `cn()` pour fusionner les classes
- Pas de CSS modules ni styled-components
- Variants et sizes via objets de mapping

#### Nommage
- Composants : PascalCase (`Button`, `UserProfile`)
- Fichiers : PascalCase pour composants, camelCase pour utils
- Hooks : camelCase avec préfixe `use` (`useApi`, `useAuth`)
- Types : PascalCase (`User`, `ApiResponse`)

## 🔧 Configuration

### Variables d'Environnement

Le projet utilise les variables d'environnement Vite (préfixe `VITE_`):

- `VITE_API_URL` - URL de l'API backend
- `VITE_AI_API_KEY` - Clé API pour services IA (optionnel)
- `VITE_APP_NAME` - Nom de l'application

Fichiers de configuration :
- `.env.example` - Template (versionné)
- `.env.local` - Valeurs locales (ignoré par git)

### Path Aliases

Le projet utilise l'alias `@/*` pour référencer `./src/*`:

```typescript
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
```

## 🚀 Workflow de Développement

### Installation et Démarrage

```bash
# Installation
npm install

# Configuration
cp .env.example .env.local
# Éditer .env.local

# Développement
npm run dev
```

### Développement d'une Nouvelle Fonctionnalité

1. Créer une branche depuis `main`
2. Développer la fonctionnalité
3. Vérifier la qualité du code :
   ```bash
   npm run type-check
   npm run lint
   npm run format
   ```
4. Tester le build :
   ```bash
   npm run build
   ```
5. Créer une pull request

### Ajout d'un Nouveau Composant UI

1. Créer le fichier dans `src/components/ui/`
2. Utiliser le pattern `forwardRef` avec types
3. Implémenter variants et sizes si applicable
4. Exporter le composant et ses types
5. Documenter avec JSDoc si nécessaire

Exemple :
```typescript
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
```

## 📄 Licence et Propriété Intellectuelle

### Licence MIT

Ce projet est distribué sous licence MIT (Massachusetts Institute of Technology).

**Permissions** :
- ✅ Usage commercial
- ✅ Modification
- ✅ Distribution
- ✅ Usage privé

**Conditions** :
- Inclure la licence et le copyright dans toutes les copies
- Pas de garantie fournie

**Limitations** :
- Aucune responsabilité de l'auteur
- Aucune garantie

### Propriété du Code

- **Copyright** : © 2025 DiscoData
- **Code source** : Libre d'utilisation selon les termes de la licence MIT
- **Instances déployées** : Chaque instance déployée reste la propriété de son hébergeur
- **Contributions** : Les contributions au code sont les bienvenues et seront sous la même licence

### Modèle de Monétisation

Bien que le code soit open source sous licence MIT, les instances déployées peuvent être monétisées :

**Options de monétisation possibles** :
- 📢 Publicité contextuelle
- 💎 Fonctionnalités premium (abonnement)
- 🔌 Intégrations tierces payantes
- 🎨 Personnalisation avancée
- 📊 Analytics et reporting avancés
- 🚀 Hébergement géré et support

**Restrictions** :
- Le code source doit rester ouvert (MIT)
- Les modifications doivent être documentées
- La licence et le copyright doivent être préservés

### Contributions et Droits d'Auteur

Les contributions au projet sont encouragées et doivent :
- Respecter la licence MIT existante
- Inclure des tests si applicable
- Suivre les conventions de code du projet
- Être documentées dans le changelog

Toutes les contributions seront créditées aux auteurs respectifs tout en restant sous le copyright de DiscoData.

## 🔒 Sécurité

### Bonnes Pratiques

- Ne jamais committer de secrets (API keys, tokens) dans le code
- Utiliser `.env.local` pour les configurations sensibles
- Valider toutes les entrées utilisateur
- Utiliser HTTPS en production
- Implémenter le CORS correctement
- Garder les dépendances à jour

### Signalement de Vulnérabilités

Si vous découvrez une faille de sécurité, veuillez la signaler de manière responsable en contactant l'équipe de développement.

## 📞 Support et Contact

Pour toute question concernant le projet, la licence ou les contributions :
- Créer une issue sur le dépôt GitHub
- Consulter la documentation dans CLAUDE.md
- Contacter l'équipe DiscoData

---

**Dernière mise à jour** : 2025
**Version** : 0.0.0
**Mainteneur** : DiscoData
