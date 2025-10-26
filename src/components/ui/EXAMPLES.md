# Exemples d'utilisation des composants de formulaire

Ce document présente des exemples d'utilisation des composants de formulaire UI.

## Import des composants

```tsx
// Import individuel
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

// Ou import groupé depuis le barrel
import { Input, Select, DatePicker, Textarea, FormField, FormGroup, FormSection } from '@/components/ui';
```

## Input

### Utilisation basique

```tsx
<Input
  label="Email"
  type="email"
  placeholder="votre@email.com"
  required
  fullWidth
/>
```

### Avec erreur

```tsx
<Input
  label="Nom d'utilisateur"
  error="Ce nom d'utilisateur est déjà pris"
  defaultValue="john"
/>
```

### Avec texte d'aide

```tsx
<Input
  label="Mot de passe"
  type="password"
  helperText="Au moins 8 caractères avec majuscules et chiffres"
  required
/>
```

### Désactivé

```tsx
<Input
  label="Email"
  value="john@example.com"
  disabled
/>
```

## Textarea

### Utilisation basique

```tsx
<Textarea
  label="Description"
  rows={5}
  placeholder="Décrivez votre activité..."
  fullWidth
/>
```

### Avec contrôle du resize

```tsx
<Textarea
  label="Commentaire"
  resize="none"  // 'none' | 'vertical' | 'horizontal' | 'both'
  helperText="Maximum 500 caractères"
/>
```

## Select

### Avec options prop

```tsx
<Select
  label="Mois"
  placeholder="Sélectionner un mois"
  options={[
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars', disabled: true },
  ]}
  required
/>
```

### Avec children

```tsx
<Select label="Statut" required>
  <option value="">Sélectionner un statut</option>
  <option value="draft">Brouillon</option>
  <option value="completed">Complété</option>
  <option value="submitted">Soumis</option>
</Select>
```

## DatePicker

### Utilisation basique

```tsx
<DatePicker
  label="Date de début"
  required
  fullWidth
/>
```

### Avec limites min/max

```tsx
import { datePickerUtils } from '@/components/ui/DatePicker';

<DatePicker
  label="Date d'activité"
  min={datePickerUtils.getRelativeDate(-30)}  // Il y a 30 jours
  max={datePickerUtils.getToday()}             // Aujourd'hui
  helperText="Sélectionnez une date dans les 30 derniers jours"
/>
```

### Avec valeur par défaut

```tsx
<DatePicker
  label="Date"
  defaultValue={datePickerUtils.getToday()}
/>
```

## FormField (Wrapper générique)

### Avec un input personnalisé

```tsx
<FormField
  label="Prix"
  error={errors.price?.message}
  helperText="Prix en euros"
  required
>
  <input
    type="number"
    step="0.01"
    className="w-full px-4 py-2 border rounded-lg"
  />
</FormField>
```

### Avec un composant custom

```tsx
<FormField label="Équipe" required>
  <CustomMultiSelect
    options={teams}
    value={selectedTeams}
    onChange={setSelectedTeams}
  />
</FormField>
```

## FormGroup (Layout)

### Grille 2 colonnes

```tsx
<FormGroup columns={2} gap="md">
  <Input label="Prénom" required />
  <Input label="Nom" required />
  <Input label="Email" type="email" required />
  <Input label="Téléphone" type="tel" />
</FormGroup>
```

### Grille responsive

```tsx
<FormGroup columns={3}>  {/* 1 col mobile, 2 col tablette, 3 col desktop */}
  <Select label="Pays" required />
  <Input label="Ville" required />
  <Input label="Code postal" required />
</FormGroup>
```

## FormSection (Sections de formulaire)

```tsx
<FormSection
  title="Informations personnelles"
  description="Vos informations de base"
>
  <FormGroup columns={2}>
    <Input label="Prénom" required />
    <Input label="Nom" required />
    <Input label="Email" type="email" required />
    <DatePicker label="Date de naissance" />
  </FormGroup>
</FormSection>

<FormSection
  title="Adresse"
  description="Votre adresse de facturation"
>
  <FormGroup columns={1}>
    <Input label="Rue" required fullWidth />
    <FormGroup columns={3}>
      <Input label="Code postal" required />
      <Input label="Ville" required />
      <Select label="Pays" required options={countries} />
    </FormGroup>
  </FormGroup>
</FormSection>
```

## Avec React Hook Form

### Installation

```bash
npm install react-hook-form
```

### Exemple complet

```tsx
import { useForm } from 'react-hook-form';
import { Input, Select, DatePicker, Textarea, FormGroup, FormSection } from '@/components/ui';

interface FormData {
  name: string;
  email: string;
  birthdate: string;
  country: string;
  bio: string;
}

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Profil">
        <FormGroup columns={2}>
          <Input
            label="Nom complet"
            error={errors.name?.message}
            required
            fullWidth
            {...register('name', {
              required: 'Le nom est requis',
              minLength: { value: 2, message: 'Minimum 2 caractères' },
            })}
          />

          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            required
            fullWidth
            {...register('email', {
              required: 'L\'email est requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide',
              },
            })}
          />

          <DatePicker
            label="Date de naissance"
            error={errors.birthdate?.message}
            fullWidth
            {...register('birthdate', {
              required: 'La date de naissance est requise',
            })}
          />

          <Select
            label="Pays"
            error={errors.country?.message}
            required
            fullWidth
            options={[
              { value: 'fr', label: 'France' },
              { value: 'be', label: 'Belgique' },
              { value: 'ch', label: 'Suisse' },
            ]}
            {...register('country', {
              required: 'Le pays est requis',
            })}
          />
        </FormGroup>

        <Textarea
          label="Biographie"
          rows={5}
          error={errors.bio?.message}
          helperText="Parlez-nous de vous (optionnel)"
          fullWidth
          {...register('bio', {
            maxLength: { value: 500, message: 'Maximum 500 caractères' },
          })}
        />
      </FormSection>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 border rounded-lg"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
```

## Validation personnalisée

```tsx
import { useForm, Controller } from 'react-hook-form';

function FormWithValidation() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="customField"
        control={control}
        rules={{
          validate: {
            isPositive: (value) =>
              parseFloat(value) > 0 || 'La valeur doit être positive',
            isInteger: (value) =>
              Number.isInteger(parseFloat(value)) || 'La valeur doit être un entier',
          },
        }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Nombre d'heures"
            type="number"
            error={fieldState.error?.message}
          />
        )}
      />
    </form>
  );
}
```

## Accessibilité

Tous les composants incluent :
- Labels associés aux champs via `htmlFor` et `id`
- Attributs `aria-invalid` pour les erreurs
- Attributs `aria-describedby` pour les messages d'aide
- Attributs `aria-required` pour les champs requis
- Rôle `alert` pour les messages d'erreur
- Support complet du clavier et des lecteurs d'écran

## Personnalisation avec Tailwind

Tous les composants acceptent une prop `className` pour personnalisation :

```tsx
<Input
  label="Email"
  className="font-mono text-lg"  // Override les styles
/>

<FormSection
  title="Section"
  className="bg-blue-50 shadow-lg"  // Override les styles de section
>
  ...
</FormSection>
```
