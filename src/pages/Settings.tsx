import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Spinner } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/schemas/auth.schema';

export function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);

      // Déconnexion après 2 secondes
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Échec du changement de mot de passe',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[rgb(var(--color-surface))] shadow rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
            Mot de passe modifié
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Votre mot de passe a été modifié avec succès. Vous allez être
            redirigé vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">
          Paramètres
        </h1>
        <p className="mt-1 text-[rgb(var(--color-text-secondary))]">
          Gérez les paramètres de votre compte
        </p>
      </div>

      {/* Change Password Section */}
      <div className="bg-[rgb(var(--color-surface))] shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">
          Changer le mot de passe
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
          Après avoir modifié votre mot de passe, vous serez déconnecté et
          devrez vous reconnecter.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-[rgb(var(--color-text))]"
            >
              Mot de passe actuel
            </label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className="mt-1"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-[rgb(var(--color-text))]"
            >
              Nouveau mot de passe
            </label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className="mt-1"
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />
            <p className="mt-1 text-xs text-[rgb(var(--color-text-secondary))]">
              8 caractères min., 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium text-[rgb(var(--color-text))]"
            >
              Confirmer le nouveau mot de passe
            </label>
            <Input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              className="mt-1"
              {...register('confirmNewPassword')}
              error={errors.confirmNewPassword?.message}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Modification...
                </>
              ) : (
                'Modifier le mot de passe'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
