# Persistance LocalStorage Implémentée ✅

## Vue d'ensemble

Le store CRA utilise maintenant le middleware `persist` de Zustand pour sauvegarder automatiquement les données dans le **localStorage** du navigateur. Les données persistent entre les sessions et les rafraîchissements de page.

## Modifications apportées

### 1. Store CRA mis à jour (`src/stores/cra.store.ts`)

**Changements principaux** :

```typescript
import { persist } from 'zustand/middleware';

export const useCRAStore = create<CRAState>()(
  persist(
    (set, get) => ({
      // ... state et actions
    }),
    {
      name: 'crafter-cra-storage',
      partialize: (state) => ({
        cras: state.cras, // Seuls les CRAs sont persistés
      }),
    }
  )
);
```

**Ce qui est persisté** :
- ✅ `cras` : Liste complète des CRAs avec toutes leurs données

**Ce qui N'est PAS persisté** :
- ❌ `selectedCRA` : État temporaire de sélection
- ❌ `isLoading` : État de chargement
- ❌ `error` : Messages d'erreur temporaires
- ❌ `filters` : Filtres appliqués
- ❌ `sort` : Ordre de tri

### 2. Mode LocalStorage (sans appels API)

Le store fonctionne maintenant en **mode local** :

**Génération d'IDs** :
```typescript
const generateId = (): string => {
  return `cra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

**Timestamps** :
```typescript
const generateTimestamp = (): string => {
  return new Date().toISOString();
};
```

**Opérations locales** :
- `createCRA()` : Génère un ID et ajoute au state
- `updateCRA()` : Modifie le CRA dans le state
- `deleteCRA()` : Supprime du state
- `fetchCRAs()` : Retourne les données déjà chargées (pas d'appel API)
- `fetchCRAById()` : Cherche dans le state local

## Comment tester la persistance

### Test 1 : Création et persistance

1. Lancez l'application :
   ```bash
   npm run dev
   ```

2. Créez un nouveau CRA avec quelques activités

3. Vérifiez dans les **DevTools** du navigateur :
   - Ouvrir DevTools (F12)
   - Aller dans l'onglet **Application** (Chrome) ou **Storage** (Firefox)
   - Dans le menu de gauche : **Local Storage** → `http://localhost:5173`
   - Vous devriez voir une clé `crafter-cra-storage`
   - Cliquez dessus pour voir les données JSON

4. Rafraîchissez la page (F5)

5. ✅ **Vérification** : Le CRA créé doit toujours être visible dans le dashboard

### Test 2 : Édition et mise à jour

1. Éditez un CRA existant :
   - Modifiez des champs
   - Ajoutez/supprimez des activités
   - Cliquez "Enregistrer"

2. Rafraîchissez la page (F5)

3. ✅ **Vérification** : Les modifications doivent être persistées

### Test 3 : Suppression

1. Supprimez un CRA

2. Rafraîchissez la page (F5)

3. ✅ **Vérification** : Le CRA supprimé ne doit plus apparaître

### Test 4 : Persistance multi-sessions

1. Fermez complètement le navigateur

2. Rouvrez le navigateur et retournez sur l'application

3. ✅ **Vérification** : Toutes les données doivent être présentes

## Inspection des données dans localStorage

### Via DevTools

**Chrome/Edge** :
1. F12 → Application tab
2. Local Storage → http://localhost:5173
3. Clé : `crafter-cra-storage`

**Firefox** :
1. F12 → Storage tab
2. Local Storage → http://localhost:5173
3. Clé : `crafter-cra-storage`

### Via Console JavaScript

```javascript
// Récupérer les données
const data = localStorage.getItem('crafter-cra-storage');
const parsed = JSON.parse(data);
console.log(parsed);

// Voir le nombre de CRAs
console.log('Nombre de CRAs:', parsed.state.cras.length);

// Voir tous les CRAs
console.table(parsed.state.cras);
```

### Effacer les données manuellement

```javascript
// Via console
localStorage.removeItem('crafter-cra-storage');

// Ou effacer tout le localStorage
localStorage.clear();
```

Ensuite, rafraîchir la page pour recommencer avec un état vide.

## Structure des données persistées

Format JSON dans localStorage :

```json
{
  "state": {
    "cras": [
      {
        "id": "cra-1234567890-abc123",
        "month": "1",
        "year": "2025",
        "client": "Acme Corp",
        "consultant": "John Doe",
        "days": 20,
        "activities": [
          {
            "id": "cra-1234567891-def456",
            "date": "2025-01-15",
            "description": "Développement feature X",
            "hours": 8
          }
        ],
        "status": "draft",
        "createdAt": "2025-01-26T10:30:00.000Z",
        "updatedAt": "2025-01-26T11:00:00.000Z"
      }
    ]
  },
  "version": 0
}
```

## Avantages de localStorage

✅ **Rapidité** : Pas de latence réseau, tout est instantané
✅ **Simplicité** : Pas besoin de configurer un backend
✅ **Développement** : Parfait pour le prototypage et les tests
✅ **Persistance** : Les données survivent aux rafraîchissements
✅ **Débogage** : Facile à inspecter dans les DevTools

## Limitations de localStorage

⚠️ **Limite de stockage** : ~5-10 MB par domaine
⚠️ **Local uniquement** : Pas de synchronisation entre appareils
⚠️ **Pas de partage** : Chaque utilisateur/navigateur a ses propres données
⚠️ **Sécurité** : Accessible depuis le JavaScript (pas sécurisé pour données sensibles)
⚠️ **Performance** : Ralentit avec beaucoup de données

## Migration vers une API backend

Quand vous serez prêt à passer à un vrai backend :

### 1. Configurer l'API URL

```bash
# .env.local
VITE_API_URL=https://api.example.com
```

### 2. Remplacer le store

Restaurer l'ancienne version du store qui utilise `craService` :

```typescript
// src/stores/cra.store.ts
export const useCRAStore = create<CRAState>()(
  persist(
    (set, get) => ({
      // Utiliser craService.getCRAs(), createCRA(), etc.
      fetchCRAs: async () => {
        const cras = await craService.getCRAs();
        set({ cras });
      },
      // ...
    }),
    {
      name: 'crafter-cra-storage',
    }
  )
);
```

### 3. Le service est déjà prêt

`src/services/cra.service.ts` contient déjà toutes les fonctions d'API nécessaires.

## Exporter/Importer les données

### Exporter toutes les données

```javascript
// Via console
const data = localStorage.getItem('crafter-cra-storage');
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'crafter-backup.json';
a.click();
```

### Importer des données

```javascript
// Via console
const jsonData = '{"state":{"cras":[...]}}'; // Votre JSON
localStorage.setItem('crafter-cra-storage', jsonData);
location.reload(); // Rafraîchir la page
```

## Réinitialiser l'application

Pour repartir de zéro :

1. **Option 1 - Via console** :
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Option 2 - Via DevTools** :
   - Application/Storage tab
   - Clic droit sur `crafter-cra-storage`
   - Delete
   - Rafraîchir la page

3. **Option 3 - Via code** :
   Ajouter un bouton dans les paramètres qui appelle `reset()` du store.

## Dépannage

### Les données ne persistent pas

1. Vérifiez que vous êtes en `http://localhost` et non `file://`
2. Vérifiez que localStorage n'est pas désactivé dans les paramètres du navigateur
3. Vérifiez l'espace disponible (localStorage peut être plein)

### Données corrompues

```javascript
// Effacer et recommencer
localStorage.removeItem('crafter-cra-storage');
location.reload();
```

### Version du state incompatible

Si vous modifiez la structure du state, effacez localStorage :

```javascript
localStorage.clear();
```

Ou incrémentez la version dans la configuration persist (à implémenter).

## Prochaines étapes

1. **Ajouter la gestion de version** pour les migrations de schéma
2. **Implémenter l'export/import** via UI
3. **Ajouter une limite de CRAs** pour éviter de remplir localStorage
4. **Compression des données** pour économiser l'espace
5. **Migration vers IndexedDB** pour plus de stockage (>50MB)

## Ressources

- [Documentation Zustand Persist](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [MDN - Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Limites de localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability)
