import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';

export function Register() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] py-12 px-4 sm:px-6 lg:px-8 force-light">
        <div className="max-w-md w-full">
          <div className="bg-[rgb(var(--color-bg))] shadow rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
              Vérifiez votre email
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Un email de vérification a été envoyé à votre adresse. Cliquez sur
              le lien dans l'email pour activer votre compte.
            </p>
            <Button onClick={() => navigate('/login')} variant="outline">
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] py-12 px-4 sm:px-6 lg:px-8 force-light">
      <div className="max-w-md w-full space-y-8">
        {/* Lien retour */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour à l'accueil
        </Link>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
            Créer un compte
          </h1>
          <p className="mt-2 text-[rgb(var(--color-text-secondary))]">
            Inscrivez-vous pour utiliser Crafter
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-[rgb(var(--color-bg))] shadow rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-[rgb(var(--color-text))]"
                >
                  Prénom
                </label>
                <Input
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  className="mt-1"
                  {...register('first_name')}
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-[rgb(var(--color-text))]"
                >
                  Nom
                </label>
                <Input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  className="mt-1"
                  {...register('last_name')}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[rgb(var(--color-text))]"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[rgb(var(--color-text))]"
              >
                Mot de passe <span className="text-red-500">*</span>
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
                Confirmer le mot de passe{' '}
                <span className="text-red-500">*</span>
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
                  Inscription...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>

          {/* Lien connexion */}
          <p className="mt-6 text-center text-sm text-[rgb(var(--color-text-secondary))]">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
