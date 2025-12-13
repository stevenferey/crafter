import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

/**
 * Page de callback pour l'authentification OAuth
 * Récupère le token depuis l'URL et initialise la session
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Échec de l\'authentification Google');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        setError('Token manquant');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Sauvegarder le token
        setAccessToken(token);

        // Récupérer les infos utilisateur
        const user = await authService.getCurrentUser();
        setUser(user);

        // Rediriger vers le dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setError('Échec de la récupération du profil');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAccessToken, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
        <div className="text-center">
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
          <p className="text-[rgb(var(--color-text))] font-medium">{error}</p>
          <p className="mt-2 text-[rgb(var(--color-text-secondary))] text-sm">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
          Connexion en cours...
        </p>
      </div>
    </div>
  );
}
