import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Select,
  FormGroup,
  FormSection,
} from '@/components/ui';
import { companyFormSchema, type CompanyFormData } from '@/schemas/company.schema';
import { useCompanyStore } from '@/stores/company.store';
import { REPERTOIRE_OPTIONS, LISTE_OPTIONS, REGISTRE_OPTIONS, type Registre, type CreateCompanyInput } from '@/types/company.types';
import { logger } from '@/lib/logger';

export function CreateCompany() {
  const navigate = useNavigate();
  const createCompany = useCompanyStore((state) => state.createCompany);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      country: 'France',
      repertoire: 'SIREN',
      liste: 'NAF',
      dispense: false,
      exemption: false,
    },
  });

  const watchDispense = watch('dispense');
  const watchExemption = watch('exemption');

  const onSubmit = async (data: CompanyFormData) => {
    logger.log('📝 [CreateCompany] Submitting form:', data);
    setIsSubmitting(true);

    try {
      // Nettoyer les champs optionnels vides
      const cleanedData: CreateCompanyInput = {
        ...data,
        complement: data.complement || undefined,
        phone: data.phone || undefined,
        registre: (data.registre && data.registre !== '') ? (data.registre as Registre) : undefined,
        registre_number: data.registre_number || undefined,
        code: data.code || undefined,
        tva_number: data.tva_number || undefined,
      };

      await createCompany(cleanedData);
      logger.log('✅ [CreateCompany] Company created successfully');
      navigate('/companies');
    } catch (error) {
      logger.error('❌ [CreateCompany] Error creating company:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
          Nouvelle société
        </h1>
        <p className="text-[rgb(var(--color-text-secondary))] mt-1">
          Créez une nouvelle société cliente ou prestataire
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Désignation et Siège social */}
        <FormSection
          title="Désignation et Siège social"
          description="Informations générales et adresse"
        >
          <FormGroup columns={1}>
            <Input
              label="Désignation"
              placeholder="Nom de la société"
              error={errors.designation?.message}
              required
              fullWidth
              {...register('designation')}
            />
          </FormGroup>

          <FormGroup columns={2}>
            <Input
              label="Adresse"
              placeholder="Numéro et rue, avenue, etc."
              error={errors.address?.message}
              required
              fullWidth
              {...register('address')}
            />
            <Input
              label="Complément"
              placeholder="Bâtiment, étage, etc."
              error={errors.complement?.message}
              fullWidth
              {...register('complement')}
            />
          </FormGroup>

          <FormGroup columns={3}>
            <Input
              label="Ville"
              placeholder="Ville ou Commune"
              error={errors.city?.message}
              required
              fullWidth
              {...register('city')}
            />
            <Input
              label="Code Postal"
              placeholder="00000"
              error={errors.postal_code?.message}
              required
              fullWidth
              maxLength={5}
              {...register('postal_code')}
            />
            <Input
              label="Pays"
              placeholder="France"
              error={errors.country?.message}
              required
              fullWidth
              {...register('country')}
            />
          </FormGroup>
        </FormSection>

        {/* Section 2: Contact */}
        <FormSection title="Contact" description="Coordonnées de contact">
          <FormGroup columns={2}>
            <Input
              label="Email"
              type="email"
              placeholder="email@email.com"
              error={errors.email?.message}
              required
              fullWidth
              {...register('email')}
            />
            <Input
              label="Téléphone"
              type="tel"
              placeholder="0600000000"
              error={errors.phone?.message}
              fullWidth
              maxLength={10}
              {...register('phone')}
            />
          </FormGroup>
        </FormSection>

        {/* Section 3: Identification */}
        <FormSection
          title="Identification"
          description="Numéro d'identification de la société"
        >
          <FormGroup columns={2}>
            <Controller
              name="repertoire"
              control={control}
              render={({ field }) => (
                <Select
                  label="Répertoire"
                  options={REPERTOIRE_OPTIONS}
                  error={errors.repertoire?.message}
                  required
                  fullWidth
                  {...field}
                />
              )}
            />
            <Input
              label="Numéro"
              placeholder="000000000"
              error={errors.repertoire_number?.message}
              helperText={
                watch('repertoire') === 'SIREN'
                  ? '9 chiffres pour SIREN'
                  : '14 chiffres pour SIRET'
              }
              required
              fullWidth
              maxLength={14}
              {...register('repertoire_number')}
            />
          </FormGroup>
        </FormSection>

        {/* Section 4: Immatriculation */}
        <FormSection
          title="Immatriculation"
          description="Informations sur le registre d'immatriculation"
        >
          <FormGroup columns={1}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[rgb(var(--color-border))]"
                {...register('dispense')}
              />
              <span className="text-sm text-[rgb(var(--color-text))]">
                Dispense d'immatriculation
              </span>
            </label>
          </FormGroup>

          {!watchDispense && (
            <FormGroup columns={2}>
              <Controller
                name="registre"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Registre"
                    options={REGISTRE_OPTIONS}
                    placeholder="Sélectionnez un registre"
                    error={errors.registre?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
              <Input
                label="Numéro"
                placeholder="Ville X 000 000 000"
                error={errors.registre_number?.message}
                fullWidth
                {...register('registre_number')}
              />
            </FormGroup>
          )}
        </FormSection>

        {/* Section 5: Activité */}
        <FormSection title="Activité" description="Code d'activité">
          <FormGroup columns={2}>
            <Controller
              name="liste"
              control={control}
              render={({ field }) => (
                <Select
                  label="Liste"
                  options={LISTE_OPTIONS}
                  error={errors.liste?.message}
                  required
                  fullWidth
                  {...field}
                />
              )}
            />
            <Input
              label="Code"
              placeholder="0000X"
              error={errors.code?.message}
              fullWidth
              maxLength={10}
              {...register('code')}
            />
          </FormGroup>
        </FormSection>

        {/* Section 6: TVA */}
        <FormSection
          title="TVA"
          description="Informations sur la TVA intracommunautaire"
        >
          <FormGroup columns={1}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[rgb(var(--color-border))]"
                {...register('exemption')}
              />
              <span className="text-sm text-[rgb(var(--color-text))]">
                Exemption (Art.293 B du CGI)
              </span>
            </label>
          </FormGroup>

          {!watchExemption && (
            <FormGroup columns={1}>
              <Input
                label="Numéro de TVA intracommunautaire"
                placeholder="FR00000000000"
                error={errors.tva_number?.message}
                helperText="Format: FR suivi de 11 chiffres"
                fullWidth
                maxLength={13}
                {...register('tva_number')}
              />
            </FormGroup>
          )}
        </FormSection>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[rgb(var(--color-border))]">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/companies')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer la société'}
          </Button>
        </div>
      </form>
    </div>
  );
}
