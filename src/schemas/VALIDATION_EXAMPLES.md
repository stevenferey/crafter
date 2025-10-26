# Exemples de validation avec Zod et React Hook Form

Ce document présente des exemples d'utilisation de la validation dans l'application CRA.

## Configuration de base

### Installation

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Import des dépendances

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

## Schéma CRA

### Schéma principal

Le schéma `craFormSchema` valide :

- **Mois** : Entre 1 et 12
- **Année** : Format YYYY, dans une plage de 5 ans
- **Client** : Minimum 2 caractères, maximum 100
- **Consultant** : Minimum 2 caractères, maximum 100
- **Jours** : Entier entre 1 et 31
- **Activités** : Minimum 1 activité requise

### Validation des activités

Chaque activité valide :

- **Date** : Format YYYY-MM-DD
- **Description** : Entre 3 et 500 caractères
- **Heures** : Nombre positif, maximum 24h, multiple de 0.25

### Validations avancées

```typescript
// Pas de dates en double
activities.refine(
  (activities) => {
    const dates = activities.map((a) => a.date);
    return dates.length === new Set(dates).size;
  },
  { message: 'Chaque date ne peut apparaître qu\'une seule fois' }
);

// Maximum 24h par jour
activities.refine(
  (activities) => {
    const hoursByDate = new Map<string, number>();
    for (const activity of activities) {
      const current = hoursByDate.get(activity.date) || 0;
      hoursByDate.set(activity.date, current + activity.hours);
    }
    return Array.from(hoursByDate.values()).every((hours) => hours <= 24);
  },
  { message: 'Le total des heures par jour ne peut pas dépasser 24h' }
);
```

## Utilisation du hook useCRAForm

### Créer un nouveau CRA

```tsx
import { useCreateCRAForm } from '@/hooks/useCRAForm';
import { useCRAStore } from '@/stores/cra.store';

function CreateCRA() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useCreateCRAForm();

  const createCRA = useCRAStore((state) => state.createCRA);

  const onSubmit = async (data) => {
    await createCRA(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Client"
        error={errors.client?.message}
        {...register('client')}
      />
      <Button type="submit" disabled={isSubmitting}>
        Créer
      </Button>
    </form>
  );
}
```

### Éditer un CRA existant

```tsx
import { useEditCRAForm } from '@/hooks/useCRAForm';

function EditCRA() {
  const existingCRA = {
    month: '1',
    year: '2025',
    client: 'Acme Corp',
    consultant: 'John Doe',
    days: 20,
    activities: [],
  };

  const { register, handleSubmit } = useEditCRAForm(existingCRA);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Formulaire pré-rempli */}
    </form>
  );
}
```

### Mode brouillon (validation partielle)

```tsx
import { useDraftCRAForm } from '@/hooks/useCRAForm';

function DraftCRA() {
  const { register, handleSubmit } = useDraftCRAForm();

  const onSaveDraft = async (data) => {
    // Sauvegarde en brouillon
    // Les activités ne sont pas requises
  };

  return (
    <form onSubmit={handleSubmit(onSaveDraft)}>
      {/* Les champs sont partiellement validés */}
    </form>
  );
}
```

## Gestion des activités dynamiques

### useFieldArray pour ajouter/supprimer des activités

```tsx
import { useFieldArray } from 'react-hook-form';
import { useCreateCRAForm } from '@/hooks/useCRAForm';

function CRAForm() {
  const { register, control, formState: { errors } } = useCreateCRAForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  const addActivity = () => {
    append({
      date: new Date().toISOString().split('T')[0],
      description: '',
      hours: 8,
    });
  };

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <DatePicker
            label="Date"
            error={errors.activities?.[index]?.date?.message}
            {...register(`activities.${index}.date`)}
          />

          <Input
            label="Heures"
            type="number"
            step="0.25"
            error={errors.activities?.[index]?.hours?.message}
            {...register(`activities.${index}.hours`, {
              valueAsNumber: true,
            })}
          />

          <Textarea
            label="Description"
            error={errors.activities?.[index]?.description?.message}
            {...register(`activities.${index}.description`)}
          />

          <button onClick={() => remove(index)}>Supprimer</button>
        </div>
      ))}

      <button onClick={addActivity}>Ajouter une activité</button>

      {/* Erreur globale */}
      {errors.activities?.message && (
        <p className="text-red-600">{errors.activities.message}</p>
      )}
    </div>
  );
}
```

## Types TypeScript

### Types inférés automatiquement

```typescript
import type { CRAFormData, ActivityFormData } from '@/schemas/cra.schema';

// Type complet du formulaire
const cra: CRAFormData = {
  month: '1',
  year: '2025',
  client: 'Acme Corp',
  consultant: 'John Doe',
  days: 20,
  activities: [
    {
      date: '2025-01-15',
      description: 'Développement',
      hours: 8,
    },
  ],
  status: 'draft',
};

// Type d'une activité
const activity: ActivityFormData = {
  date: '2025-01-15',
  description: 'Développement',
  hours: 8,
};
```

## Validation personnalisée

### Validation de la période

```typescript
import { craFormWithPeriodValidation } from '@/schemas/cra.schema';

// Utiliser le schéma avec validation de période
const { register, handleSubmit } = useForm({
  resolver: zodResolver(craFormWithPeriodValidation),
});

// Empêche la création de CRA pour des périodes futures
```

### Validation au niveau du champ

```tsx
<Input
  label="Email"
  {...register('email', {
    onChange: (e) => console.log('Email changed:', e.target.value),
    onBlur: () => console.log('Email blurred'),
    validate: {
      isCustomEmail: (value) =>
        value.endsWith('@example.com') || 'Must use @example.com email',
    },
  })}
/>
```

## Erreurs et messages

### Affichage des erreurs

```tsx
// Erreur d'un champ
{errors.client?.message && (
  <p className="text-red-600">{errors.client.message}</p>
)}

// Erreur d'un champ nested
{errors.activities?.[0]?.date?.message && (
  <p className="text-red-600">{errors.activities[0].date.message}</p>
)}

// Erreur root (formulaire)
{errors.root?.message && (
  <p className="text-red-600">{errors.root.message}</p>
)}
```

### Messages personnalisés

```typescript
const schema = z.object({
  client: z
    .string()
    .min(2, 'Le nom du client doit contenir au moins 2 caractères')
    .max(100, 'Le nom du client est trop long'),
});
```

## Mode de validation

### onBlur (recommandé pour UX)

```tsx
useForm({
  mode: 'onBlur', // Valide au blur
});
```

### onChange (validation temps réel)

```tsx
useForm({
  mode: 'onChange', // Valide à chaque changement
});
```

### onSubmit (validation à la soumission)

```tsx
useForm({
  mode: 'onSubmit', // Valide uniquement à la soumission (par défaut)
});
```

## États du formulaire

### isSubmitting

```tsx
const { formState: { isSubmitting } } = useForm();

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Envoi...' : 'Envoyer'}
</Button>
```

### isDirty et dirtyFields

```tsx
const { formState: { isDirty, dirtyFields } } = useForm();

// Vérifier si le formulaire a été modifié
if (isDirty) {
  console.log('Formulaire modifié');
}

// Vérifier quels champs ont été modifiés
console.log('Champs modifiés:', dirtyFields);
```

### isValid

```tsx
const { formState: { isValid } } = useForm({
  mode: 'onChange',
});

<Button type="submit" disabled={!isValid}>
  Envoyer
</Button>
```

## Réinitialisation du formulaire

```tsx
const { reset } = useForm();

// Réinitialiser avec valeurs par défaut
reset();

// Réinitialiser avec nouvelles valeurs
reset({
  month: '2',
  year: '2025',
  client: 'New Client',
});
```

## Watch (observer les changements)

```tsx
const { watch } = useForm();

// Observer tous les champs
const formValues = watch();

// Observer un champ spécifique
const client = watch('client');

// Observer plusieurs champs
const [month, year] = watch(['month', 'year']);

// Observer avec callback
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log('Field changed:', name, value);
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

## Validation asynchrone

```typescript
const schema = z.object({
  username: z.string().refine(
    async (username) => {
      const response = await fetch(`/api/check-username/${username}`);
      const { available } = await response.json();
      return available;
    },
    { message: 'Ce nom d\'utilisateur est déjà pris' }
  ),
});
```

## Bonnes pratiques

1. **Toujours afficher les messages d'erreur** près des champs concernés
2. **Utiliser mode: 'onBlur'** pour une meilleure UX
3. **Désactiver le bouton submit** pendant isSubmitting
4. **Valider côté client ET serveur**
5. **Utiliser des messages d'erreur clairs** et en français
6. **Typer les formulaires** avec TypeScript
7. **Réutiliser les schémas** pour la cohérence
8. **Tester les validations** avec différents cas limites
