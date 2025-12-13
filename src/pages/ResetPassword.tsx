import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Spinner } from '@/components/ui';
import { authService } from '@/services/auth.service';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/schemas/auth.schema';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        token,
        password: data.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Échec de la réinitialisation du mot de passe'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-[rgb(var(--color-bg))] shadow rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
              Lien invalide
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Le lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link to="/forgot-password">
              <Button>Demander un nouveau lien</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-[rgb(var(--color-bg))] shadow rounded-lg p-8 text-center">
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
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez
              maintenant vous connecter.
            </p>
            <Button onClick={() => navigate('/login')}>Se connecter</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-[rgb(var(--color-text-secondary))]">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-[rgb(var(--color-bg))] shadow rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[rgb(var(--color-text))]"
              >
                Nouveau mot de passe
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-1"
                {...register('password')}
                error={errors.password?.message}
              />
              <p className="mt-1 text-xs text-[rgb(var(--color-text-secondary))]">
                8 caractères min., 1 majuscule, 1 minuscule, 1 chiffre
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[rgb(var(--color-text))]"
              >
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Réinitialisation...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
