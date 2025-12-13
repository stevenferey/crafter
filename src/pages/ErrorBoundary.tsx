import {
  useRouteError,
  useNavigate,
  isRouteErrorResponse,
} from 'react-router-dom';
import { Button } from '@/components/ui';

/**
 * Composant ErrorBoundary pour gérer les erreurs de routing
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'Une erreur inattendue est survenue';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-background))]">
      <div className="max-w-md w-full mx-4">
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
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

          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-2">
            Erreur {errorStatus}
          </h1>

          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {errorMessage}
          </p>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recharger la page
            </Button>
            <Button onClick={() => navigate('/dashboard')}>Retour au Dashboard</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
