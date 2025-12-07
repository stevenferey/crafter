import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Select,
  FormGroup,
  FormSection,
  Spinner,
} from '@/components/ui';
import { SignatureInput } from '@/components/ui/SignatureInput';
import type { SignatureData } from '@/types/cra.types';
import {
  companyFormSchema,
  type CompanyFormData,
} from '@/schemas/company.schema';
import { useCompanyStore } from '@/stores/company.store';
import {
  REPERTOIRE_OPTIONS,
  LISTE_OPTIONS,
  REGISTRE_OPTIONS,
  type Registre,
} from '@/types/company.types';
import { logger } from '@/lib/logger';

export function EditCompany() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const fetchCompanyById = useCompanyStore((state) => state.fetchCompanyById);
  const updateCompany = useCompanyStore((state) => state.updateCompany);
  const isLoading = useCompanyStore((state) => state.isLoading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
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

  // Charger la société au montage
  useEffect(() => {
    if (id) {
      logger.log('🔄 [EditCompany] Fetching company:', id);
      fetchCompanyById(id);
    }
  }, [id, fetchCompanyById]);

  // Remplir le formulaire quand les données sont chargées
  useEffect(() => {
    if (selectedCompany) {
      logger.log('📝 [EditCompany] Populating form with company data');
      reset({
        designation: selectedCompany.designation,
        address: selectedCompany.address,
        complement: selectedCompany.complement || '',
        city: selectedCompany.city,
        postal_code: selectedCompany.postal_code,
        country: selectedCompany.country,
        email: selectedCompany.email,
        phone: selectedCompany.phone || '',
        repertoire: selectedCompany.repertoire,
        repertoire_number: selectedCompany.repertoire_number,
        dispense: selectedCompany.dispense,
        registre: selectedCompany.registre || '',
        registre_number: selectedCompany.registre_number || '',
        liste: selectedCompany.liste,
        code: selectedCompany.code || '',
        exemption: selectedCompany.exemption,
        tva_number: selectedCompany.tva_number || '',
        default_signatory_name: selectedCompany.default_signatory_name || '',
        default_signatory_title: selectedCompany.default_signatory_title || '',
        default_signature_image: selectedCompany.default_signature_image || '',
        default_signature_location:
          selectedCompany.default_signature_location || '',
        default_use_current_date:
          selectedCompany.default_use_current_date ?? false,
      });
    }
  }, [selectedCompany, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    if (!id) return;

    setIsSubmitting(true);

    try {
      // Nettoyer les champs optionnels vides - utiliser null au lieu de undefined
      const cleanedData = {
        ...data,
        complement: data.complement || null,
        phone: data.phone || null,
        registre:
          data.registre && data.registre !== ''
            ? (data.registre as Registre)
            : null,
        registre_number: data.registre_number || null,
        code: data.code || null,
        tva_number: data.tva_number || null,
        default_signatory_name: data.default_signatory_name || null,
        default_signatory_title: data.default_signatory_title || null,
        default_signature_image: data.default_signature_image || null,
        default_signature_location: data.default_signature_location || null,
        default_use_current_date: data.default_use_current_date ?? false,
      };

      await updateCompany(id, cleanedData);
      navigate('/companies');
    } catch (error) {
      logger.error('❌ [EditCompany] Error updating company:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading && !selectedCompany) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">
          Société non trouvée
        </h2>
        <p className="text-[rgb(var(--color-text-secondary))] mt-2">
          La société demandée n'existe pas.
        </p>
        <Button onClick={() => navigate('/companies')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
          Modifier une société
        </h1>
        <p className="text-[rgb(var(--color-text-secondary))] mt-1">
          Modifiez les informations de {selectedCompany.designation}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Sections identiques à CreateCompany */}
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

        {/* Section 7: Signature par défaut */}
        <FormSection
          title="Signature par défaut"
          description="Signature utilisée par défaut pour les CRAs de cette société (optionnel)"
        >
          <Controller
            name="default_signatory_name"
            control={control}
            render={({ field: nameField }) => (
              <Controller
                name="default_signatory_title"
                control={control}
                render={({ field: titleField }) => (
                  <Controller
                    name="default_signature_image"
                    control={control}
                    render={({ field: imageField }) => (
                      <Controller
                        name="default_signature_location"
                        control={control}
                        render={({ field: locationField }) => (
                          <Controller
                            name="default_use_current_date"
                            control={control}
                            render={({ field: dateField }) => (
                              <SignatureInput
                                label="Signature par défaut"
                                value={{
                                  signatoryName: nameField.value || '',
                                  signatoryTitle: titleField.value || '',
                                  signatureImage: imageField.value || '',
                                  signatureLocation: locationField.value || '',
                                  useCurrentDate: dateField.value ?? false,
                                }}
                                onChange={(sig: Partial<SignatureData>) => {
                                  nameField.onChange(sig.signatoryName);
                                  titleField.onChange(sig.signatoryTitle);
                                  imageField.onChange(sig.signatureImage);
                                  locationField.onChange(sig.signatureLocation);
                                  dateField.onChange(sig.useCurrentDate);
                                }}
                              />
                            )}
                          />
                        )}
                      />
                    )}
                  />
                )}
              />
            )}
          />
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
            {isSubmitting
              ? 'Enregistrement...'
              : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
}
