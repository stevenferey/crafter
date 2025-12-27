import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/services/api';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [error, setError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [lastEmail, setLastEmail] = useState('');

  // Récupérer l'URL de redirection (dashboard par défaut)
  const from =
    (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setEmailNotVerified(false);
    setResendSuccess(false);

    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      // Détecter l'erreur email non vérifié
      if (
        err instanceof ApiError &&
        (err.data as { error?: string })?.error === 'email_not_verified'
      ) {
        setEmailNotVerified(true);
        setLastEmail(data.email);
      }
      setError(err instanceof Error ? err.message : 'Échec de la connexion');
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError(null);

    try {
      await authService.resendVerification(lastEmail);
      setResendSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'envoi de l'email",
      );
    } finally {
      setResendLoading(false);
    }
  };

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
            Connexion
          </h1>
          <p className="mt-2 text-[rgb(var(--color-text-secondary))]">
            Connectez-vous à votre compte Crafter
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-[rgb(var(--color-bg))] shadow rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              {emailNotVerified && !resendSuccess && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  {resendLoading
                    ? 'Envoi en cours...'
                    : "Renvoyer l'email de vérification"}
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                Email de vérification envoyé ! Vérifiez votre boîte de
                réception.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[rgb(var(--color-text))]"
              >
                Email
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
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-1"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Lien inscription */}
          <p className="mt-6 text-center text-sm text-[rgb(var(--color-text-secondary))]">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
