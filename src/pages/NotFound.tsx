import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

/**
 * Page 404 - Not Found
 */
export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-24 w-24 text-[rgb(var(--color-text-muted))]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-[rgb(var(--color-text))] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[rgb(var(--color-text))] mb-2">
          Page non trouvée
        </h2>
        <p className="text-[rgb(var(--color-text-secondary))] mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button onClick={() => navigate('/')}>
            Retour au Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
