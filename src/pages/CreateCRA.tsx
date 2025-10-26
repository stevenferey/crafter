import { useNavigate } from 'react-router-dom';
import { useFieldArray } from 'react-hook-form';
import { useCreateCRAForm } from '@/hooks/useCRAForm';
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

export function CreateCRA() {
  const navigate = useNavigate();
  const createCRA = useCRAStore((state) => state.createCRA);
  const addNotification = useAppStore((state) => state.addNotification);

  // Formulaire avec react-hook-form + zod
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useCreateCRAForm();

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
    try {
      // Retirer les IDs des activités (générés côté serveur)
      const activities = data.activities.map(({ id, ...activity }) => activity);

      await createCRA({
        month: data.month,
        year: data.year,
        client: data.client,
        consultant: data.consultant,
        days: data.days,
        activities,
        status: 'draft',
      });

      addNotification('CRA créé avec succès', 'success');
      navigate('/');
    } catch (error) {
      addNotification(
        error instanceof Error ? error.message : 'Erreur lors de la création du CRA',
        'error',
      );
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouveau CRA</h1>
        <p className="text-gray-600 mt-1">
          Créez un nouveau compte rendu d'activité
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
          description="Ajoutez les activités réalisées pendant la période"
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">À propos du CRA</p>
              <p>
                Le CRA sera créé en mode brouillon. Vous pourrez le compléter et
                l'exporter en PDF depuis la page de prévisualisation.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le CRA'}
          </Button>
        </div>
      </form>
    </div>
  );
}
