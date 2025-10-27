import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray } from 'react-hook-form';
import { useEditCRAForm } from '@/hooks/useCRAForm';
import { useCRAStore } from '@/stores/cra.store';
import { useAppStore } from '@/stores/app.store';
import {
  Input,
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
  const error = useCRAStore((state) => state.error);
  const addNotification = useAppStore((state) => state.addNotification);

  // Charger le CRA au montage du composant
  useEffect(() => {
    if (id) {
      console.log('✏️ [EditCRA] Loading CRA:', id);
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
          date: selectedCRA.date,
          client: selectedCRA.client,
          activities: selectedCRA.activities.map((act) => ({
            id: act.id,
            description: act.description,
            hours: act.hours,
            category: act.category,
          })),
          status: selectedCRA.status,
        }
      : {}
  );

  // Réinitialiser le formulaire quand les données sont chargées
  useEffect(() => {
    if (selectedCRA) {
      console.log('✏️ [EditCRA] Resetting form with data:', selectedCRA);
      reset({
        date: selectedCRA.date,
        client: selectedCRA.client,
        activities: selectedCRA.activities.map((act) => ({
          id: act.id,
          description: act.description,
          hours: act.hours,
          category: act.category,
        })),
        status: selectedCRA.status,
      });
    }
  }, [selectedCRA, reset]);

  // Gestion dynamique des activités
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  // Catégories prédéfinies
  const categories = [
    'Développement',
    'Réunion',
    'Documentation',
    'Tests',
    'Code Review',
    'Support',
    'Formation',
    'Analyse',
    'Conception',
    'DevOps',
    'Autre',
  ];

  // Soumission du formulaire
  const onSubmit = async (data: CRAFormData) => {
    if (!id) return;

    console.log('✏️ [EditCRA] Submitting update:', data);
    try {
      // Retirer les IDs des activités (gérés côté serveur)
      const activities = data.activities.map(({ id, ...activity }) => activity);

      await updateCRA(id, {
        date: data.date,
        client: data.client,
        activities,
        status: data.status,
      });

      addNotification('CRA mis à jour avec succès', 'success');
      navigate('/');
    } catch (error) {
      console.error('❌ [EditCRA] Error:', error);
      addNotification(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du CRA',
        'error'
      );
    }
  };

  // Supprimer le CRA
  const handleDelete = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce CRA ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    console.log('🗑️ [EditCRA] Deleting CRA:', id);
    try {
      await deleteCRA(id);
      addNotification('CRA supprimé avec succès', 'success');
      navigate('/');
    } catch (error) {
      console.error('❌ [EditCRA] Error deleting:', error);
      addNotification(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression du CRA',
        'error'
      );
    }
  };

  // Ajouter une nouvelle activité
  const handleAddActivity = () => {
    append({
      description: '',
      hours: 4,
      category: 'Développement',
    });
  };

  // Afficher un loader pendant le chargement
  if (isLoading && !selectedCRA) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement du CRA...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le CRA n'est pas trouvé
  if (error || (!isLoading && !selectedCRA)) {
    return (
      <div className="max-w-4xl mx-auto">
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
                {error || "Le CRA demandé n'existe pas ou n'a pas pu être chargé."}
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
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
          description="Date et client du CRA"
        >
          <FormGroup columns={2}>
            <DatePicker
              label="Date"
              error={errors.date?.message}
              required
              fullWidth
              {...(register('date') as any)}
              max={datePickerUtils.getToday()}
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
          </FormGroup>
        </FormSection>

        {/* Activités */}
        <FormSection
          title="Détail des activités"
          description="Modifiez ou ajoutez des activités"
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

                <FormGroup columns={2}>
                  <Input
                    label="Heures"
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="24"
                    placeholder="4"
                    error={errors.activities?.[index]?.hours?.message}
                    helperText="Multiple de 0.25"
                    required
                    fullWidth
                    {...register(`activities.${index}.hours`, {
                      valueAsNumber: true,
                    })}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register(`activities.${index}.category`)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.activities?.[index]?.category && (
                      <p className="text-sm text-red-600">
                        {errors.activities[index]?.category?.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
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
