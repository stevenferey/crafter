import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray } from 'react-hook-form';
import { useEditCRAForm } from '@/hooks/useCRAForm';
import { useCRAStore } from '@/stores/cra.store';
import { useAppStore } from '@/stores/app.store';
import {
  Input,
  Select,
  DatePicker,
  Textarea,
  Button,
  FormGroup,
  FormSection,
} from '@/components/ui';
import { datePickerUtils } from '@/components/ui/DatePicker';
import type { CRAFormData } from '@/schemas/cra.schema';

export function EditCRA() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const selectedCRA = useCRAStore((state) => state.selectedCRA);
  const fetchCRAById = useCRAStore((state) => state.fetchCRAById);
  const updateCRA = useCRAStore((state) => state.updateCRA);
  const deleteCRA = useCRAStore((state) => state.deleteCRA);
  const isLoading = useCRAStore((state) => state.isLoading);
  const addNotification = useAppStore((state) => state.addNotification);

  // Charger le CRA au montage du composant
  useEffect(() => {
    if (id) {
      fetchCRAById(id);
    }
  }, [id, fetchCRAById]);

  // Formulaire avec react-hook-form + zod
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useEditCRAForm(
    selectedCRA
      ? {
          month: selectedCRA.month,
          year: selectedCRA.year,
          client: selectedCRA.client,
          consultant: selectedCRA.consultant,
          days: selectedCRA.days,
          activities: selectedCRA.activities,
          status: selectedCRA.status,
        }
      : {},
  );

  // Réinitialiser le formulaire quand les données sont chargées
  useEffect(() => {
    if (selectedCRA) {
      reset({
        month: selectedCRA.month,
        year: selectedCRA.year,
        client: selectedCRA.client,
        consultant: selectedCRA.consultant,
        days: selectedCRA.days,
        activities: selectedCRA.activities,
        status: selectedCRA.status,
      });
    }
  }, [selectedCRA, reset]);

  // Gestion dynamique des activités
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  // Données pour les sélecteurs
  const months = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - 2 + i).toString(),
    label: (currentYear - 2 + i).toString(),
  }));

  // Soumission du formulaire
  const onSubmit = async (data: CRAFormData) => {
    if (!id) return;

    try {
      // Convertir les activités en s'assurant que les IDs sont présents
      const activities = data.activities.map(({ id: activityId, ...activity }) =>
        activityId
          ? { id: activityId, ...activity }
          : { id: `temp-${Date.now()}-${Math.random()}`, ...activity }
      );

      await updateCRA(id, {
        month: data.month,
        year: data.year,
        client: data.client,
        consultant: data.consultant,
        days: data.days,
        activities,
        status: data.status,
      });

      addNotification('CRA modifié avec succès', 'success');
      navigate(`/cra/${id}/preview`);
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : 'Erreur lors de la modification du CRA',
        'error',
      );
    }
  };

  // Supprimer le CRA
  const handleDelete = async () => {
    if (!id) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce CRA ?')) {
      try {
        await deleteCRA(id);
        addNotification('CRA supprimé avec succès', 'success');
        navigate('/');
      } catch (error) {
        addNotification(
          error instanceof Error ? error.message : 'Erreur lors de la suppression du CRA',
          'error',
        );
      }
    }
  };

  // Ajouter une nouvelle activité
  const handleAddActivity = () => {
    append({
      date: datePickerUtils.getToday(),
      description: '',
      hours: 8,
    });
  };

  // Afficher un loader pendant le chargement
  if (isLoading && !selectedCRA) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement du CRA...</p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le CRA n'existe pas
  if (!selectedCRA && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">CRA introuvable</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-gray-900">
            Dashboard
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/cra/${id}/preview`)}
            className="hover:text-gray-900"
          >
            CRA #{id}
          </button>
          <span>/</span>
          <span className="text-gray-900">Éditer</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Éditer le CRA</h1>
        <p className="text-gray-600 mt-1">
          Modifiez les informations du compte rendu d'activité
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <FormSection
          title="Informations générales"
          description="Période et contexte du CRA"
        >
          <FormGroup columns={2}>
            <Select
              label="Mois"
              placeholder="Sélectionner un mois"
              options={months}
              error={errors.month?.message}
              required
              fullWidth
              {...register('month')}
            />

            <Select
              label="Année"
              placeholder="Sélectionner une année"
              options={years}
              error={errors.year?.message}
              required
              fullWidth
              {...register('year')}
            />

            <Input
              label="Client"
              placeholder="Nom du client"
              error={errors.client?.message}
              helperText="Nom de l'entreprise ou du client"
              required
              fullWidth
              {...register('client')}
            />

            <Input
              label="Consultant"
              placeholder="Nom du consultant"
              error={errors.consultant?.message}
              required
              fullWidth
              {...register('consultant')}
            />

            <Input
              label="Jours travaillés"
              type="number"
              min={1}
              max={31}
              placeholder="20"
              error={errors.days?.message}
              helperText="Nombre de jours travaillés dans le mois"
              required
              fullWidth
              {...register('days', { valueAsNumber: true })}
            />
          </FormGroup>
        </FormSection>

        {/* Activités */}
        <FormSection
          title="Détail des activités"
          description="Modifiez les activités réalisées pendant la période"
        >
          <div className="space-y-4">
            {fields.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Aucune activité ajoutée
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cliquez sur "Ajouter une activité" pour commencer
                </p>
              </div>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Activité {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                </div>

                <FormGroup columns={3}>
                  <DatePicker
                    label="Date"
                    error={errors.activities?.[index]?.date?.message}
                    required
                    fullWidth
                    {...(register(`activities.${index}.date`) as any)}
                    max={datePickerUtils.getToday()}
                  />

                  <Input
                    label="Heures"
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="24"
                    placeholder="8"
                    error={errors.activities?.[index]?.hours?.message}
                    helperText="Multiple de 0.25"
                    required
                    fullWidth
                    {...register(`activities.${index}.hours`, {
                      valueAsNumber: true,
                    })}
                  />

                  <div className="md:col-span-3">
                    <Textarea
                      label="Description"
                      rows={3}
                      placeholder="Description de l'activité..."
                      error={errors.activities?.[index]?.description?.message}
                      required
                      fullWidth
                      {...register(`activities.${index}.description`)}
                    />
                  </div>
                </FormGroup>
              </div>
            ))}

            {/* Erreur globale des activités */}
            {errors.activities?.message && (
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
                {errors.activities.message}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddActivity}
              className="w-full"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Ajouter une activité
            </Button>
          </div>
        </FormSection>

        {/* Warning Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Attention</p>
              <p>
                La modification d'un CRA existant remplacera les informations
                actuelles.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Supprimer
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/cra/${id}/preview`)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
