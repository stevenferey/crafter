import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Spinner } from '@/components/ui';
import { authService } from '@/services/auth.service';

export function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setError('Token de vérification manquant');
        return;
      }

      try {
        await authService.verifyEmail({ token });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(
          err instanceof Error
            ? err.message
            : "Échec de la vérification de l'email",
        );
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
            Vérification de votre email...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">
              Erreur de vérification
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              {error || 'Le lien de vérification est invalide ou a expiré.'}
            </p>
            <div className="space-y-3">
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Email vérifié !
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            Votre adresse email a été vérifiée avec succès. Vous pouvez
            maintenant vous connecter.
          </p>
          <Link to="/login">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
