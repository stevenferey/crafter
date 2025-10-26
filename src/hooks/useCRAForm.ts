import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  craFormSchema,
  craFormWithPeriodValidation,
  craFormDraftSchema,
  CRAFormData,
  CRAFormDraftData,
} from '@/schemas/cra.schema';

/**
 * Options pour le hook useCRAForm
 */
interface UseCRAFormOptions {
  /**
   * Valeurs par défaut du formulaire
   */
  defaultValues?: Partial<CRAFormData>;
  /**
   * Mode brouillon (validation partielle)
   */
  isDraft?: boolean;
  /**
   * Valider la période (empêcher les CRA futurs)
   */
  validatePeriod?: boolean;
}

/**
 * Valeurs par défaut pour un nouveau CRA
 */
const getDefaultCRAValues = (): Partial<CRAFormData> => {
  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString();
  const currentYear = today.getFullYear().toString();

  return {
    month: currentMonth,
    year: currentYear,
    client: '',
    consultant: '',
    days: 0,
    activities: [],
    status: 'draft',
  };
};

/**
 * Hook custom pour gérer les formulaires de CRA
 * Combine react-hook-form avec validation zod
 *
 * @example
 * ```tsx
 * const { register, handleSubmit, formState: { errors } } = useCRAForm({
 *   defaultValues: existingCRA,
 *   validatePeriod: true,
 * });
 *
 * const onSubmit = async (data) => {
 *   await craService.createCRA(data);
 * };
 *
 * return (
 *   <form onSubmit={handleSubmit(onSubmit)}>
 *     <Input {...register('client')} error={errors.client?.message} />
 *   </form>
 * );
 * ```
 */
export function useCRAForm(
  options: UseCRAFormOptions = {},
) {
  const {
    defaultValues,
    isDraft = false,
    validatePeriod = true,
  } = options;

  // Sélectionner le schéma approprié
  let schema = craFormSchema;
  if (validatePeriod && !isDraft) {
    schema = craFormWithPeriodValidation;
  }
  if (isDraft) {
    schema = craFormDraftSchema as unknown as typeof craFormSchema;
  }

  // Fusionner les valeurs par défaut
  const finalDefaultValues = {
    ...getDefaultCRAValues(),
    ...defaultValues,
  };

  return useForm<CRAFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: finalDefaultValues as CRAFormData,
    mode: 'onBlur', // Valider au blur pour une meilleure UX
  });
}

/**
 * Hook pour éditer un CRA existant
 * Pré-remplit le formulaire avec les données existantes
 */
export function useEditCRAForm(existingCRA: Partial<CRAFormData>) {
  return useCRAForm({
    defaultValues: existingCRA,
    validatePeriod: false, // Ne pas valider la période pour l'édition
  });
}

/**
 * Hook pour créer un nouveau CRA
 */
export function useCreateCRAForm() {
  return useCRAForm({
    validatePeriod: true,
  });
}

/**
 * Hook pour un brouillon de CRA (validation partielle)
 */
export function useDraftCRAForm(
  existingDraft?: Partial<CRAFormDraftData>,
) {
  return useCRAForm({
    defaultValues: existingDraft,
    isDraft: true,
    validatePeriod: false,
  });
}
