import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useCreateCRAForm } from '@/hooks/useCRAForm';
import { useCRAStore } from '@/stores/cra.store';
import { useCompanyStore } from '@/stores/company.store';
import { useAppStore } from '@/stores/app.store';
import {
  Textarea,
  Button,
  FormGroup,
  FormSection,
  Select,
} from '@/components/ui';
import { SignatureInput } from '@/components/ui/SignatureInput';
import type { SignatureData } from '@/types/cra.types';
import {
  MONTHS,
  WEEKDAYS_MONDAY_FIRST,
  getCalendarGridMondayFirst,
  getCurrentMonthYear,
  getAvailableYears,
  formatMonthYear,
} from '@/lib/monthUtils';
import type { CRAFormData } from '@/schemas/cra.schema';

export function CreateCRA() {
  const navigate = useNavigate();
  const createCRA = useCRAStore((state) => state.createCRA);
  const isLoading = useCRAStore((state) => state.isLoading);
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const addNotification = useAppStore((state) => state.addNotification);

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Charger les sociétés au montage
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Formulaire avec react-hook-form + zod
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useCreateCRAForm();

  // Observer les changements de mois/année dans le formulaire
  const watchMonth = watch('month', currentMonth);
  const watchYear = watch('year', currentYear);
  const watchWorkedDays = watch('worked_days', []);

  // Utiliser les valeurs du formulaire pour le calendrier
  const selectedMonth = watchMonth || currentMonth;
  const selectedYear = watchYear || currentYear;

  // Créer les options pour les selects
  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.designation,
  }));

  const monthOptions = MONTHS.map((month, index) => ({
    value: (index + 1).toString(),
    label: month,
  }));

  const yearOptions = getAvailableYears().map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  // Générer la grille du calendrier
  const calendarGrid = getCalendarGridMondayFirst(selectedMonth, selectedYear);

  // Récupérer les sociétés sélectionnées pour leurs signatures par défaut
  const selectedClientId = watch('client_id');
  const selectedProviderId = watch('provider_id');

  const clientCompany = companies.find((c) => c.id === selectedClientId);
  const providerCompany = companies.find((c) => c.id === selectedProviderId);

  const clientDefaultSignature: Partial<SignatureData> | undefined =
    clientCompany
      ? {
          signatoryName: clientCompany.default_signatory_name || '',
          signatoryTitle: clientCompany.default_signatory_title || '',
          signatureImage: clientCompany.default_signature_image || '',
          signatureLocation: clientCompany.default_signature_location || '',
          useCurrentDate: clientCompany.default_use_current_date ?? false,
        }
      : undefined;

  const providerDefaultSignature: Partial<SignatureData> | undefined =
    providerCompany
      ? {
          signatoryName: providerCompany.default_signatory_name || '',
          signatoryTitle: providerCompany.default_signatory_title || '',
          signatureImage: providerCompany.default_signature_image || '',
          signatureLocation: providerCompany.default_signature_location || '',
          useCurrentDate: providerCompany.default_use_current_date ?? false,
        }
      : undefined;

  // Gestion de la sélection des jours
  const toggleDay = (day: number) => {
    const currentDays = watchWorkedDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    setValue('worked_days', newDays, { shouldValidate: true });
  };

  // Soumission du formulaire
  const onSubmit = async (data: CRAFormData) => {
    // Réinitialiser l'erreur avant la soumission
    setSubmitError(null);

    try {
      await createCRA({
        month: data.month,
        year: data.year,
        worked_days: data.worked_days,
        comment: data.comment,
        client_id: data.client_id,
        provider_id: data.provider_id,
        status: 'draft',
        // Signatures
        client_signatory_name: data.client_signatory_name,
        client_signatory_title: data.client_signatory_title,
        client_signature_image: data.client_signature_image,
        client_signature_location: data.client_signature_location,
        client_use_current_date: data.client_use_current_date,
        provider_signatory_name: data.provider_signatory_name,
        provider_signatory_title: data.provider_signatory_title,
        provider_signature_image: data.provider_signature_image,
        provider_signature_location: data.provider_signature_location,
        provider_use_current_date: data.provider_use_current_date,
      });

      addNotification('CRA créé avec succès', 'success');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du CRA';

      // Stocker l'erreur pour l'afficher dans l'interface
      setSubmitError(errorMessage);

      addNotification(errorMessage, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
          Nouveau CRA
        </h1>
        <p className="text-[rgb(var(--color-text-secondary))] mt-1">
          Créez un nouveau compte rendu d'activité mensuel
        </p>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit(onSubmit, () => {
          addNotification(
            'Veuillez corriger les erreurs dans le formulaire',
            'error',
          );
        })}
        className="space-y-6"
      >
        {/* Informations générales */}
        <FormSection
          title="Informations générales"
          description="Période, client et prestataire du CRA"
        >
          <FormGroup columns={2}>
            <Controller
              name="month"
              control={control}
              defaultValue={currentMonth}
              render={({ field }) => (
                <Select
                  label="Mois"
                  options={monthOptions}
                  error={errors.month?.message}
                  required
                  fullWidth
                  {...field}
                  value={field.value?.toString()}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="year"
              control={control}
              defaultValue={currentYear}
              render={({ field }) => (
                <Select
                  label="Année"
                  options={yearOptions}
                  error={errors.year?.message}
                  required
                  fullWidth
                  {...field}
                  value={field.value?.toString()}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="client_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Client"
                  options={companyOptions}
                  placeholder="Sélectionnez un client"
                  error={errors.client_id?.message}
                  helperText="Société cliente"
                  required
                  fullWidth
                  disabled={companies.length === 0}
                  {...field}
                />
              )}
            />

            <Controller
              name="provider_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Prestataire"
                  options={companyOptions}
                  placeholder="Sélectionnez un prestataire"
                  error={errors.provider_id?.message}
                  helperText="Société prestataire"
                  required
                  fullWidth
                  disabled={companies.length === 0}
                  {...field}
                />
              )}
            />
          </FormGroup>
        </FormSection>

        {/* Jours travaillés */}
        <FormSection
          title="Jours travaillés"
          description={`Sélectionnez les jours travaillés en ${formatMonthYear(selectedMonth, selectedYear)}`}
        >
          <div className="space-y-2">
            {/* En-tête du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS_MONDAY_FIRST.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-[rgb(var(--color-text-secondary))] py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((dayInfo, index) => {
                if (!dayInfo) {
                  return <div key={`empty-${index}`} className="h-11" />;
                }

                const isSelected = watchWorkedDays?.includes(dayInfo.day);
                const isWeekend = dayInfo.isWeekend;

                return (
                  <button
                    key={dayInfo.day}
                    type="button"
                    onClick={() => toggleDay(dayInfo.day)}
                    className={`
                      h-11 rounded-md border text-xs font-medium transition-all
                      ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : isWeekend
                            ? 'bg-gray-100 text-gray-400 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                            : 'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] border-[rgb(var(--color-border))] hover:border-blue-400'
                      }
                      ${isSelected ? 'scale-95' : 'hover:scale-105'}
                    `}
                  >
                    {dayInfo.day}
                  </button>
                );
              })}
            </div>

            {/* Statistiques */}
            <div className="bg-[rgb(var(--color-surface-hover))] rounded-lg p-4 border border-[rgb(var(--color-border))]">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                <span className="font-semibold text-[rgb(var(--color-text))]">
                  {watchWorkedDays?.length || 0} jour
                  {watchWorkedDays?.length > 1 ? 's' : ''} sélectionné
                  {watchWorkedDays?.length > 1 ? 's' : ''}
                </span>
                {watchWorkedDays && watchWorkedDays.length > 0 && (
                  <span className="ml-2">
                    ({watchWorkedDays.sort((a, b) => a - b).join(', ')})
                  </span>
                )}
              </p>
            </div>

            {/* Erreur */}
            {errors.worked_days && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.worked_days.message}
              </p>
            )}
          </div>
        </FormSection>

        {/* Commentaire */}
        <FormSection
          title="Commentaire"
          description="Ajoutez un commentaire optionnel sur le mois"
        >
          <FormGroup columns={1}>
            <Textarea
              label="Commentaire"
              rows={4}
              placeholder="Commentaire optionnel sur le mois..."
              error={errors.comment?.message}
              helperText="Optionnel - Maximum 1000 caractères"
              fullWidth
              {...register('comment')}
            />
          </FormGroup>
        </FormSection>

        {/* Signatures */}
        <FormSection
          title="Signatures"
          description="Signatures des représentants des sociétés (optionnel)"
        >
          <div className="space-y-6">
            {/* Signature Client */}
            <Controller
              name="client_signatory_name"
              control={control}
              render={({ field: nameField }) => (
                <Controller
                  name="client_signatory_title"
                  control={control}
                  render={({ field: titleField }) => (
                    <Controller
                      name="client_signature_image"
                      control={control}
                      render={({ field: imageField }) => (
                        <Controller
                          name="client_signature_location"
                          control={control}
                          render={({ field: locationField }) => (
                            <Controller
                              name="client_use_current_date"
                              control={control}
                              render={({ field: dateField }) => (
                                <SignatureInput
                                  label={`Signature ${clientCompany?.designation || 'Client'}`}
                                  value={{
                                    signatoryName: nameField.value || '',
                                    signatoryTitle: titleField.value || '',
                                    signatureImage: imageField.value || '',
                                    signatureLocation:
                                      locationField.value || '',
                                    useCurrentDate: dateField.value ?? false,
                                  }}
                                  onChange={(sig) => {
                                    nameField.onChange(sig.signatoryName);
                                    titleField.onChange(sig.signatoryTitle);
                                    imageField.onChange(sig.signatureImage);
                                    locationField.onChange(
                                      sig.signatureLocation,
                                    );
                                    dateField.onChange(sig.useCurrentDate);
                                  }}
                                  defaultSignature={clientDefaultSignature}
                                  disabled={!selectedClientId}
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

            {/* Signature Provider */}
            <Controller
              name="provider_signatory_name"
              control={control}
              render={({ field: nameField }) => (
                <Controller
                  name="provider_signatory_title"
                  control={control}
                  render={({ field: titleField }) => (
                    <Controller
                      name="provider_signature_image"
                      control={control}
                      render={({ field: imageField }) => (
                        <Controller
                          name="provider_signature_location"
                          control={control}
                          render={({ field: locationField }) => (
                            <Controller
                              name="provider_use_current_date"
                              control={control}
                              render={({ field: dateField }) => (
                                <SignatureInput
                                  label={`Signature ${providerCompany?.designation || 'Prestataire'}`}
                                  value={{
                                    signatoryName: nameField.value || '',
                                    signatoryTitle: titleField.value || '',
                                    signatureImage: imageField.value || '',
                                    signatureLocation:
                                      locationField.value || '',
                                    useCurrentDate: dateField.value ?? false,
                                  }}
                                  onChange={(sig) => {
                                    nameField.onChange(sig.signatoryName);
                                    titleField.onChange(sig.signatoryTitle);
                                    imageField.onChange(sig.signatureImage);
                                    locationField.onChange(
                                      sig.signatureLocation,
                                    );
                                    dateField.onChange(sig.useCurrentDate);
                                  }}
                                  defaultSignature={providerDefaultSignature}
                                  disabled={!selectedProviderId}
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
          </div>
        </FormSection>

        {/* Info Box */}
        <div className="bg-[rgb(var(--color-primary-light))] border-2 border-[rgb(var(--color-primary))] rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-[rgb(var(--color-primary))] flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm">
              <p className="font-bold mb-1 text-[rgb(var(--color-text))]">
                À propos du CRA mensuel
              </p>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Le CRA sera créé en mode brouillon. Vous pourrez le modifier
                avant de le soumettre pour validation.
              </p>
            </div>
          </div>
        </div>

        {/* Erreur de soumission */}
        {submitError && (
          <div className="bg-red-100/50 dark:bg-red-900/20 border-2 border-[rgb(var(--color-error))] rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-[rgb(var(--color-error))] flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="font-bold mb-1 text-[rgb(var(--color-text))]">
                  Erreur lors de la création
                </p>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={isSubmitting || isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Création...' : 'Créer le CRA'}
          </Button>
        </div>
      </form>
    </div>
  );
}
