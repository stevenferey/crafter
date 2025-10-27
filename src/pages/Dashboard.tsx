import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useCRAStore } from '@/stores/cra.store';

export function Dashboard() {
  const cras = useCRAStore((state) => state.cras);
  const fetchCRAs = useCRAStore((state) => state.fetchCRAs);
  const isLoading = useCRAStore((state) => state.isLoading);
  const error = useCRAStore((state) => state.error);
  const clearError = useCRAStore((state) => state.clearError);

  // Charger les CRAs au montage du composant
  useEffect(() => {
    console.log('📊 [Dashboard] Component mounted, fetching CRAs...');
    fetchCRAs();
  }, [fetchCRAs]);

  // Calculer les statistiques à partir des CRAs
  const totalHours = cras.reduce((sum, cra) => sum + Number(cra.total_hours), 0);
  const totalClients = new Set(cras.map((cra) => cra.client)).size;

  // CRAs du mois en cours
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentMonthCRAs = cras.filter((cra) => {
    const craDate = new Date(cra.date);
    return (
      craDate.getMonth() === currentMonth &&
      craDate.getFullYear() === currentYear
    );
  });

  const stats = [
    {
      label: 'Total CRAs',
      value: cras.length.toString(),
      icon: '📄',
    },
    {
      label: 'CRA ce mois',
      value: currentMonthCRAs.length.toString(),
      icon: '📅',
      subtext: `${currentMonthCRAs.reduce((sum, cra) => sum + Number(cra.total_hours), 0)}h`,
    },
    {
      label: 'Total heures',
      value: totalHours.toFixed(1),
      icon: '⏱️',
      subtext: `${cras.reduce((sum, cra) => sum + cra.activities.length, 0)} activités`,
    },
    {
      label: 'Clients actifs',
      value: totalClients.toString(),
      icon: '👥',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: 'Brouillon',
        className: 'text-gray-700 bg-gray-50',
      },
      submitted: {
        label: 'Soumis',
        className: 'text-blue-700 bg-blue-50',
      },
      approved: {
        label: 'Approuvé',
        className: 'text-emerald-700 bg-emerald-50',
      },
      rejected: {
        label: 'Rejeté',
        className: 'text-red-700 bg-red-50',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Trier les CRAs par date décroissante
  const sortedCRAs = [...cras].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Prendre les 10 CRAs les plus récents
  const recentCRAs = sortedCRAs.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos comptes rendus d'activité
          </p>
        </div>
        <Link to="/cra/new">
          <Button size="lg">
            <span className="mr-2">+</span>
            Nouveau CRA
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtext && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent CRAs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">CRA récents</h2>
        </div>

        {isLoading && cras.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement des CRAs...</p>
          </div>
        ) : recentCRAs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600">Aucun CRA disponible</p>
            <p className="text-sm text-gray-500 mt-2">
              Créez votre premier CRA pour commencer
            </p>
            <Link to="/cra/new">
              <Button className="mt-4">Créer un CRA</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentCRAs.map((cra) => (
              <div
                key={cra.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {formatDate(cra.date)}
                      </h3>
                      {getStatusBadge(cra.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {cra.client}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {Number(cra.total_hours).toFixed(1)}h
                      </span>
                      {cra.activities.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          {cra.activities.length} activités
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/cra/${cra.id}/preview`}>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </Link>
                    <Link to={`/cra/${cra.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Éditer
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {cras.length === 0 && !isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Démarrage rapide
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre premier CRA en quelques clics
            </p>
            <Link to="/cra/new">
              <Button variant="primary">Créer un CRA</Button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Besoin d'aide ?
            </h3>
            <p className="text-gray-600 mb-4">
              Consultez notre documentation pour plus d'informations
            </p>
            <Button variant="outline">Voir la documentation</Button>
          </div>
        </div>
      )}
    </div>
  );
}
