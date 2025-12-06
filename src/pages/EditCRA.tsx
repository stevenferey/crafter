import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useEditCRAForm } from '@/hooks/useCRAForm';
import { useCRA } from '@/hooks/useCRA';
import { useCRAStore } from '@/stores/cra.store';
import { useCompanyStore } from '@/stores/company.store';
import { useAppStore } from '@/stores/app.store';
import {
  Textarea,
  Button,
  FormGroup,
  FormSection,
  Spinner,
  Select,
} from '@/components/ui';
import { SignatureInput } from '@/components/ui/SignatureInput';
import type { SignatureData } from '@/types/cra.types';
import {
  MONTHS,
  WEEKDAYS,
  getCalendarGrid,
  getCurrentMonthYear,
  getAvailableYears,
  formatMonthYear,
} from '@/lib/monthUtils';
import { STATUS_CONFIG } from '@/constants/cra.constants';
import type { CRAFormData } from '@/schemas/cra.schema';

export function EditCRA() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { cra: selectedCRA, isLoading, error } = useCRA(id);
  const updateCRA = useCRAStore((state) => state.updateCRA);
  const deleteCRA = useCRAStore((state) => state.deleteCRA);
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const addNotification = useAppStore((state) => state.addNotification);

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(
    selectedCRA?.month || currentMonth,
  );
  const [selectedYear, setSelectedYear] = useState(
    selectedCRA?.year || currentYear,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Charger les sociétés au montage du composant
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
    reset,
    formState: { errors, isSubmitting },
  } = useEditCRAForm(
    selectedCRA
      ? {
          month: selectedCRA.month,
          year: selectedCRA.year,
          worked_days: selectedCRA.worked_days,
          comment: selectedCRA.comment,
          client_id: selectedCRA.client_id || '',
          provider_id: selectedCRA.provider_id || '',
          status: selectedCRA.status,
          client_signatory_name: selectedCRA.client_signatory_name || '',
          client_signatory_title: selectedCRA.client_signatory_title || '',
          client_signature_image: selectedCRA.client_signature_image || '',
          provider_signatory_name: selectedCRA.provider_signatory_name || '',
          provider_signatory_title: selectedCRA.provider_signatory_title || '',
          provider_signature_image: selectedCRA.provider_signature_image || '',
        }
      : {},
  );

  // Réinitialiser le formulaire quand les données sont chargées
  useEffect(() => {
    if (selectedCRA) {
      reset({
        month: selectedCRA.month,
        year: selectedCRA.year,
        worked_days: selectedCRA.worked_days,
        comment: selectedCRA.comment,
        client_id: selectedCRA.client_id || '',
        provider_id: selectedCRA.provider_id || '',
        status: selectedCRA.status,
        client_signatory_name: selectedCRA.client_signatory_name || '',
        client_signatory_title: selectedCRA.client_signatory_title || '',
        client_signature_image: selectedCRA.client_signature_image || '',
        provider_signatory_name: selectedCRA.provider_signatory_name || '',
        provider_signatory_title: selectedCRA.provider_signatory_title || '',
        provider_signature_image: selectedCRA.provider_signature_image || '',
      });
      setSelectedMonth(selectedCRA.month);
      setSelectedYear(selectedCRA.year);
    }
  }, [selectedCRA, reset]);

  // Observer les changements de mois/année dans le formulaire
  const watchMonth = watch('month', selectedMonth);
  const watchYear = watch('year', selectedYear);
  const watchWorkedDays = watch('worked_days', []);

  // Synchroniser les états locaux avec les valeurs du formulaire
  useEffect(() => {
    if (watchMonth) setSelectedMonth(watchMonth);
  }, [watchMonth]);

  useEffect(() => {
    if (watchYear) setSelectedYear(watchYear);
  }, [watchYear]);

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

  const statusOptions = Object.entries(STATUS_CONFIG).map(
    ([value, config]) => ({
      value,
      label: config.label,
    }),
  );

  // Générer la grille du calendrier
  const calendarGrid = getCalendarGrid(selectedMonth, selectedYear);

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
        }
      : undefined;

  const providerDefaultSignature: Partial<SignatureData> | undefined =
    providerCompany
      ? {
          signatoryName: providerCompany.default_signatory_name || '',
          signatoryTitle: providerCompany.default_signatory_title || '',
          signatureImage: providerCompany.default_signature_image || '',
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
    if (!id) return;

    // Réinitialiser l'erreur avant la soumission
    setSubmitError(null);

    try {
      await updateCRA(id, {
        month: data.month,
        year: data.year,
        worked_days: data.worked_days,
        comment: data.comment,
        client_id: data.client_id,
        provider_id: data.provider_id,
        status: data.status,
        // Signatures - Utiliser null au lieu de undefined pour que les champs soient envoyés
        client_signatory_name: data.client_signatory_name || null,
        client_signatory_title: data.client_signatory_title || null,
        client_signature_image: data.client_signature_image || null,
        provider_signatory_name: data.provider_signatory_name || null,
        provider_signatory_title: data.provider_signatory_title || null,
        provider_signature_image: data.provider_signature_image || null,
      });

      addNotification('CRA mis à jour avec succès', 'success');
      navigate('/');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du CRA';

      // Stocker l'erreur pour l'afficher dans l'interface
      setSubmitError(errorMessage);

      addNotification(errorMessage, 'error');
    }
  };

  // Supprimer le CRA
  const handleDelete = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce CRA ? Cette action est irréversible.',
    );

    if (!confirmed) return;

    try {
      await deleteCRA(id);
      addNotification('CRA supprimé avec succès', 'success');
      navigate('/');
    } catch (error) {
      addNotification(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression du CRA',
        'error',
      );
    }
  };

  // Afficher un loader pendant le chargement
  if (isLoading && !selectedCRA) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner />
          <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
            Chargement du CRA...
          </p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le CRA n'est pas trouvé
  if (error || (!isLoading && !selectedCRA)) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                CRA introuvable
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error ||
                  "Le CRA demandé n'existe pas ou n'a pas pu être chargé."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Retour au dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
          Éditer le CRA
        </h1>
        <p className="text-[rgb(var(--color-text-secondary))] mt-1">
          Modifiez les informations du compte rendu d'activité mensuel
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Statut du CRA */}
        <FormSection
          title="Statut du CRA"
          description="Gérez le statut du compte rendu d'activité"
        >
          <FormGroup columns={1}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Statut"
                  options={statusOptions}
                  error={errors.status?.message}
                  helperText="Changez le statut du CRA (brouillon, soumis, approuvé, rejeté)"
                  required
                  fullWidth
                  {...field}
                />
              )}
            />
          </FormGroup>
        </FormSection>

        {/* Informations générales */}
        <FormSection
          title="Informations générales"
          description="Période, client et prestataire du CRA"
        >
          <FormGroup columns={2}>
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <Select
                  label="Mois"
                  options={monthOptions}
                  placeholder="Sélectionnez un mois"
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
              render={({ field }) => (
                <Select
                  label="Année"
                  options={yearOptions}
                  placeholder="Sélectionnez une année"
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
          <div className="space-y-4">
            {/* En-tête du calendrier */}
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-[rgb(var(--color-text-secondary))] py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-2">
              {calendarGrid.map((dayInfo, index) => {
                if (!dayInfo) {
                  return (
                    <div key={`empty-${index}`} className="aspect-square" />
                  );
                }

                const isSelected = watchWorkedDays?.includes(dayInfo.day);
                const isWeekend = dayInfo.isWeekend;

                return (
                  <button
                    key={dayInfo.day}
                    type="button"
                    onClick={() => toggleDay(dayInfo.day)}
                    className={`
                      aspect-square rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : isWeekend
                            ? 'bg-gray-100 text-gray-400 border-gray-200 hover:border-gray-300'
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
                        <SignatureInput
                          label={`Signature ${clientCompany?.designation || 'Client'}`}
                          value={{
                            signatoryName: nameField.value || '',
                            signatoryTitle: titleField.value || '',
                            signatureImage: imageField.value || '',
                          }}
                          onChange={(sig) => {
                            nameField.onChange(sig.signatoryName);
                            titleField.onChange(sig.signatoryTitle);
                            imageField.onChange(sig.signatureImage);
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
                        <SignatureInput
                          label={`Signature ${providerCompany?.designation || 'Prestataire'}`}
                          value={{
                            signatoryName: nameField.value || '',
                            signatoryTitle: titleField.value || '',
                            signatureImage: imageField.value || '',
                          }}
                          onChange={(sig) => {
                            nameField.onChange(sig.signatoryName);
                            titleField.onChange(sig.signatoryTitle);
                            imageField.onChange(sig.signatureImage);
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
          </div>
        </FormSection>

        {/* Erreur de soumission */}
        {submitError && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
                <p className="font-bold mb-1 text-red-800">
                  Erreur lors de la mise à jour
                </p>
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isSubmitting || isLoading}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Supprimer
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isSubmitting || isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading
                ? 'Enregistrement...'
                : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
