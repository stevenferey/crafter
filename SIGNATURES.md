# 📝 Gestion des Signatures - Documentation

## Vue d'ensemble

Le système de signatures permet d'ajouter des signatures électroniques aux CRAs (Comptes Rendus d'Activité) et aux sociétés. Les signatures comprennent trois éléments :
- **Nom du signataire** : Le nom complet de la personne
- **Titre/Fonction** : Le titre ou la fonction du signataire (ex: "Directeur Général")
- **Image de signature** : Une image uploadée (PNG ou JPEG, max 2MB)

## Architecture

### Stockage des données

#### Base de données (PostgreSQL)

**Table `companies`** - Signature par défaut d'une société :
```sql
default_signatory_name VARCHAR(255)
default_signatory_title VARCHAR(255)
default_signature_image TEXT
```

**Table `cras`** - Signatures spécifiques à chaque CRA :
```sql
-- Signature du client
client_signatory_name VARCHAR(255)
client_signatory_title VARCHAR(255)
client_signature_image TEXT

-- Signature du prestataire
provider_signatory_name VARCHAR(255)
provider_signatory_title VARCHAR(255)
provider_signature_image TEXT
```

#### Fichiers uploadés

Les images de signature sont stockées dans :
```
backend/uploads/signatures/
```

Format des noms de fichier : `{uuid}.{extension}`
- Exemple : `550e8400-e29b-41d4-a716-446655440000.png`

### Frontend

#### Composant principal

**`SignatureInput.tsx`** - Composant réutilisable pour la saisie de signatures
- Upload d'image avec validation (PNG/JPEG, max 2MB)
- Saisie du nom et titre du signataire
- Preview de l'image uploadée
- Support des signatures par défaut
- Bouton "Utiliser signature par défaut" (si disponible)
- Bouton "Effacer" pour supprimer la signature

#### Intégration

**Sociétés** (`CreateCompany.tsx`, `EditCompany.tsx`) :
- Section "Signature par défaut"
- Une seule signature par société
- Utilisée comme suggestion dans les CRAs

**CRAs** (`CreateCRA.tsx`, `EditCRA.tsx`) :
- Section "Signatures"
- Deux signatures : Client + Prestataire
- Bouton "Utiliser signature par défaut" si la société a une signature
- Chaque signature peut être personnalisée indépendamment

### Backend

#### Upload Service

**Endpoint** : `POST /api/upload/signature`

**Middleware** : Multer avec configuration :
```javascript
{
  destination: 'uploads/signatures/',
  filename: UUID généré,
  limits: { fileSize: 2MB },
  fileFilter: PNG et JPEG seulement
}
```

**Réponse** :
```json
{
  "success": true,
  "path": "/uploads/signatures/{uuid}.png"
}
```

#### API Endpoints

**Companies** :
```
POST   /api/companies          - Créer avec signature par défaut
PUT    /api/companies/:id      - Mettre à jour signature par défaut
GET    /api/companies/:id      - Récupérer avec signature par défaut
```

**CRAs** :
```
POST   /api/cras               - Créer avec signatures client/prestataire
PUT    /api/cras/:id           - Mettre à jour signatures
GET    /api/cras/:id           - Récupérer avec signatures
```

## Workflow utilisateur

### 1. Configuration de la signature par défaut d'une société

1. Aller dans "Sociétés" → "Nouvelle société" ou éditer une société existante
2. Défiler jusqu'à la section "Signature par défaut"
3. Remplir les informations :
   - Nom du signataire
   - Titre/Fonction
   - Uploader une image de signature
4. Enregistrer la société

### 2. Utilisation des signatures dans un CRA

#### Option A : Utiliser la signature par défaut

1. Créer ou éditer un CRA
2. Sélectionner un client et/ou un prestataire
3. Défiler jusqu'à la section "Signatures"
4. Cliquer sur "Utiliser signature par défaut" (bouton avec variant `secondary`)
5. La signature est automatiquement pré-remplie
6. Possibilité de modifier ou effacer si besoin
7. Enregistrer le CRA

#### Option B : Saisir une signature personnalisée

1. Créer ou éditer un CRA
2. Défiler jusqu'à la section "Signatures"
3. Pour chaque partie (Client/Prestataire) :
   - Saisir le nom du signataire
   - Saisir le titre/fonction
   - Uploader une image de signature
4. Enregistrer le CRA

#### Option C : Effacer une signature

1. Éditer un CRA avec une signature
2. Cliquer sur "Effacer" dans la section signature
3. Enregistrer le CRA
4. La signature est supprimée (valeurs `NULL` en base)

## Points techniques importants

### Gestion des valeurs vides

**Problème** : `JSON.stringify()` supprime les propriétés avec valeur `undefined`

**Solution** : Utiliser `null` au lieu de `undefined` pour les champs vides

```typescript
// ❌ INCORRECT - Les champs seront supprimés lors de la sérialisation JSON
{
  client_signatory_name: data.client_signatory_name || undefined
}

// ✅ CORRECT - Les champs seront envoyés avec null
{
  client_signatory_name: data.client_signatory_name || null
}
```

**Implémentation** :

Frontend (`EditCRA.tsx`, `EditCompany.tsx`) :
```typescript
const updateData = {
  // ...
  client_signatory_name: data.client_signatory_name || null,
  client_signatory_title: data.client_signatory_title || null,
  client_signature_image: data.client_signature_image || null,
};
```

Backend Controller :
```typescript
if (req.body.client_signatory_name !== undefined)
  updateData.client_signatory_name = req.body.client_signatory_name || null;
```

Backend Model :
```typescript
params.push(data.client_signatory_name || null);
```

### Upload et sécurité

**Validations** :
- Types MIME autorisés : `image/png`, `image/jpeg`, `image/jpg`
- Taille maximale : 2 MB
- Nom de fichier : UUID v4 pour éviter les collisions

**Stockage** :
- Répertoire : `backend/uploads/signatures/`
- Permission : Lecture publique (serveur Express statique)
- URL d'accès : `http://localhost:3001/uploads/signatures/{uuid}.png`

### Chargement des images dans le frontend

```typescript
const getImageUrl = (path?: string) => {
  if (!path) return null;
  // Si le chemin commence par http, c'est une URL complète
  if (path.startsWith('http')) return path;
  // Sinon, construire l'URL avec le base URL du backend
  return `${env.apiUrl.replace('/api', '')}${path}`;
};
```

## Schéma de données

### Type TypeScript - Signature

```typescript
export interface SignatureData {
  signatoryName: string;
  signatoryTitle: string;
  signatureImage: string;
}
```

### Type TypeScript - Company avec signature

```typescript
export interface Company {
  id: string;
  designation: string;
  // ... autres champs
  default_signatory_name?: string | null;
  default_signatory_title?: string | null;
  default_signature_image?: string | null;
}
```

### Type TypeScript - CRA avec signatures

```typescript
export interface CRA {
  id: string;
  month: number;
  year: number;
  // ... autres champs
  client_signatory_name?: string | null;
  client_signatory_title?: string | null;
  client_signature_image?: string | null;
  provider_signatory_name?: string | null;
  provider_signatory_title?: string | null;
  provider_signature_image?: string | null;
}
```

## Fichiers modifiés

### Frontend

#### Composants
- `src/components/ui/SignatureInput.tsx` - Composant de saisie de signature
- `src/pages/CreateCompany.tsx` - Ajout section signature
- `src/pages/EditCompany.tsx` - Ajout section signature
- `src/pages/CreateCRA.tsx` - Ajout section signatures (client + prestataire)
- `src/pages/EditCRA.tsx` - Ajout section signatures (client + prestataire)

#### Services
- `src/services/upload.service.ts` - Service d'upload de signatures

#### Types
- `src/types/company.types.ts` - Ajout champs signature
- `src/types/cra.types.ts` - Ajout champs signatures + `SignatureData`

#### Schémas de validation
- `src/schemas/company.schema.ts` - Validation champs signature
- `src/schemas/cra.schema.ts` - Validation champs signatures

### Backend

#### Controllers
- `backend/src/controllers/company.controller.ts` - CRUD avec signatures
- `backend/src/controllers/cra.controller.ts` - CRUD avec signatures
- `backend/src/controllers/upload.controller.ts` - Upload de signatures

#### Models
- `backend/src/models/company.model.ts` - SQL queries avec signatures
- `backend/src/models/cra.model.ts` - SQL queries avec signatures

#### Routes
- `backend/src/routes/upload.routes.ts` - Routes d'upload

#### Middleware
- `backend/src/middleware/upload.middleware.ts` - Configuration Multer

#### Types
- `backend/src/types/company.types.ts` - Ajout champs signature
- `backend/src/types/cra.types.ts` - Ajout champs signatures

#### Migrations SQL
- `backend/migrations/008_add_signatures.sql` - Migration ajout colonnes

## Migration SQL

```sql
-- Ajout des colonnes de signature aux sociétés
ALTER TABLE companies
ADD COLUMN default_signatory_name VARCHAR(255),
ADD COLUMN default_signatory_title VARCHAR(255),
ADD COLUMN default_signature_image TEXT;

-- Ajout des colonnes de signature aux CRAs (client)
ALTER TABLE cras
ADD COLUMN client_signatory_name VARCHAR(255),
ADD COLUMN client_signatory_title VARCHAR(255),
ADD COLUMN client_signature_image TEXT;

-- Ajout des colonnes de signature aux CRAs (prestataire)
ALTER TABLE cras
ADD COLUMN provider_signatory_name VARCHAR(255),
ADD COLUMN provider_signatory_title VARCHAR(255),
ADD COLUMN provider_signature_image TEXT;
```

## Améliorations futures possibles

1. **Signature manuscrite** : Intégrer un canvas pour dessiner la signature directement
2. **Historique des signatures** : Tracer qui a signé et quand
3. **Validation de signature** : Vérification d'authenticité
4. **Templates de signature** : Bibliothèque de signatures pré-définies
5. **Export PDF** : Inclure les signatures dans les PDF générés
6. **Signature électronique qualifiée** : Conformité eIDAS pour valeur légale
7. **Multi-signatures** : Support de plus de deux signataires par CRA
8. **Workflow de validation** : Signature séquentielle (client → prestataire)

## Troubleshooting

### Les signatures ne se sauvegardent pas

**Cause** : Utilisation de `undefined` au lieu de `null`
**Solution** : Vérifier que les champs vides sont convertis en `null` avant l'envoi

### Les images ne s'affichent pas

**Cause 1** : Mauvaise construction de l'URL
**Solution** : Vérifier la fonction `getImageUrl()` dans `SignatureInput.tsx`

**Cause 2** : Fichier non accessible
**Solution** : Vérifier que le répertoire `backend/uploads/signatures/` existe et est accessible

### Erreur lors de l'upload

**Cause** : Fichier trop volumineux ou mauvais format
**Solution** : Vérifier que le fichier est PNG/JPEG et < 2MB

### Signature par défaut ne s'affiche pas dans le CRA

**Cause** : Société non sélectionnée ou sans signature
**Solution** :
1. Vérifier que le client/prestataire est sélectionné
2. Vérifier que la société a une signature par défaut configurée
3. Vérifier que `clientDefaultSignature` et `providerDefaultSignature` sont bien calculés

## Tests

### Test manuel - Workflow complet

1. **Créer une société avec signature** :
   - ✅ Créer une nouvelle société
   - ✅ Remplir les champs de signature
   - ✅ Uploader une image
   - ✅ Sauvegarder
   - ✅ Vérifier que la signature est visible en édition

2. **Utiliser la signature dans un CRA** :
   - ✅ Créer un nouveau CRA
   - ✅ Sélectionner la société comme client
   - ✅ Cliquer sur "Utiliser signature par défaut"
   - ✅ Vérifier que la signature est pré-remplie
   - ✅ Sauvegarder le CRA
   - ✅ Vérifier en édition que la signature est persistée

3. **Modifier une signature** :
   - ✅ Éditer un CRA avec signature
   - ✅ Modifier le nom du signataire
   - ✅ Sauvegarder
   - ✅ Vérifier que la modification est persistée

4. **Effacer une signature** :
   - ✅ Éditer un CRA avec signature
   - ✅ Cliquer sur "Effacer"
   - ✅ Sauvegarder
   - ✅ Vérifier en édition que la signature est vide

### Test API - Exemples de requêtes

**Créer une société avec signature** :
```bash
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "Acme Corp",
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "postal_code": "75001",
    "country": "France",
    "email": "contact@acme.com",
    "repertoire": "SIREN",
    "repertoire_number": "123456789",
    "liste": "NAF",
    "default_signatory_name": "Jean Dupont",
    "default_signatory_title": "Directeur Général",
    "default_signature_image": "/uploads/signatures/uuid.png"
  }'
```

**Mettre à jour un CRA avec signatures** :
```bash
curl -X PUT http://localhost:3001/api/cras/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "client_signatory_name": "Marie Martin",
    "client_signatory_title": "CEO",
    "client_signature_image": "/uploads/signatures/uuid1.png",
    "provider_signatory_name": "Pierre Durand",
    "provider_signatory_title": "CTO",
    "provider_signature_image": "/uploads/signatures/uuid2.png"
  }'
```

## Références

- **Multer Documentation** : https://github.com/expressjs/multer
- **React Hook Form** : https://react-hook-form.com/
- **PostgreSQL NULL handling** : https://www.postgresql.org/docs/current/functions-comparison.html
