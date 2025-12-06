import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  craFormSchema,
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
}

/**
 * Valeurs par défaut pour un nouveau CRA mensuel
 */
const getDefaultCRAValues = (): Partial<CRAFormData> => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // getMonth() retourne 0-11, on veut 1-12

  return {
    month,
    year,
    worked_days: [],
    comment: '',
    client_id: '',
    provider_id: '',
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
export function useCRAForm(options: UseCRAFormOptions = {}) {
  const { defaultValues, isDraft = false } = options;

  // Sélectionner le schéma approprié (la validation de période est maintenant dans craFormSchema)
  const schema = isDraft
    ? (craFormDraftSchema as unknown as typeof craFormSchema)
    : craFormSchema;

  // Fusionner les valeurs par défaut
  const finalDefaultValues = {
    ...getDefaultCRAValues(),
    ...defaultValues,
  };

  return useForm<CRAFormData>({
    resolver: zodResolver(schema) as Resolver<CRAFormData>,
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
  });
}

/**
 * Hook pour créer un nouveau CRA
 */
export function useCreateCRAForm() {
  return useCRAForm({});
}

/**
 * Hook pour un brouillon de CRA (validation partielle)
 */
export function useDraftCRAForm(existingDraft?: Partial<CRAFormDraftData>) {
  return useCRAForm({
    defaultValues: existingDraft,
    isDraft: true,
  });
}
