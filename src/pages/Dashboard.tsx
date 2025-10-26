import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function Dashboard() {
  // Données de démonstration
  const recentCRAs = [
    {
      id: '1',
      month: 'Janvier 2025',
      client: 'Acme Corp',
      days: 20,
      status: 'completed',
      createdAt: '2025-01-31',
    },
    {
      id: '2',
      month: 'Décembre 2024',
      client: 'TechStart SAS',
      days: 18,
      status: 'completed',
      createdAt: '2024-12-31',
    },
    {
      id: '3',
      month: 'Novembre 2024',
      client: 'Acme Corp',
      days: 22,
      status: 'completed',
      createdAt: '2024-11-30',
    },
  ];

  const stats = [
    { label: 'CRA ce mois', value: '1', icon: '📄' },
    { label: 'Jours travaillés', value: '20', icon: '📅' },
    { label: 'Clients actifs', value: '2', icon: '👥' },
    { label: 'Taux de remplissage', value: '91%', icon: '📊' },
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
          Complété
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-full">
        En cours
      </span>
    );
  };

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
                      {cra.month}
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
      </div>

      {/* Quick Actions */}
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
    </div>
  );
}
