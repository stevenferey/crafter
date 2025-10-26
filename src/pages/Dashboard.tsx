import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useCRAStore } from '@/stores/cra.store';

export function Dashboard() {
  const cras = useCRAStore((state) => state.cras);
  const fetchCRAs = useCRAStore((state) => state.fetchCRAs);
  const isLoading = useCRAStore((state) => state.isLoading);

  // Charger les CRAs au montage du composant
  useEffect(() => {
    fetchCRAs();
  }, [fetchCRAs]);

  // Calculer les statistiques à partir des CRAs
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // CRAs du mois en cours
  const currentMonthCRAs = cras.filter(
    (cra) =>
      parseInt(cra.month) === currentMonth &&
      parseInt(cra.year) === currentYear
  );

  // Total de tous les jours travaillés
  const totalDays = cras.reduce((sum, cra) => sum + cra.days, 0);

  // Total de toutes les heures travaillées
  const totalHours = cras.reduce(
    (sum, cra) =>
      sum + cra.activities.reduce((actSum, activity) => actSum + activity.hours, 0),
    0
  );

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
      subtext: `${currentMonthCRAs.reduce((sum, cra) => sum + cra.days, 0)} jours`,
    },
    {
      label: 'Jours totaux',
      value: totalDays.toString(),
      icon: '⏱️',
      subtext: `${totalHours}h enregistrées`,
    },
    {
      label: 'Clients actifs',
      value: new Set(cras.map((cra) => cra.client)).size.toString(),
      icon: '👥',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: 'Brouillon',
        className: 'text-gray-700 bg-gray-50',
      },
      completed: {
        label: 'Complété',
        className: 'text-green-700 bg-green-50',
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

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getMonthName = (month: string) => {
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    return months[parseInt(month) - 1] || month;
  };

  // Trier les CRAs par date décroissante
  const sortedCRAs = [...cras].sort((a, b) => {
    const dateA = new Date(parseInt(a.year), parseInt(a.month) - 1);
    const dateB = new Date(parseInt(b.year), parseInt(b.month) - 1);
    return dateB.getTime() - dateA.getTime();
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
                        {getMonthName(cra.month)} {cra.year}
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {cra.days} jours
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
      {cras.length === 0 && !isLoading && (
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
