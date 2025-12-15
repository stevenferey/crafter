import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, StatusBadge, Spinner } from '@/components/ui';
import { useCRAStore } from '@/stores/cra.store';
import { useCompanyStore } from '@/stores/company.store';
import { type CRAStatus } from '@/constants/cra.constants';
import { formatMonthYear } from '@/lib/monthUtils';
import { logger } from '@/lib/logger';

export function Dashboard() {
  const cras = useCRAStore((state) => state.cras);
  const fetchCRAs = useCRAStore((state) => state.fetchCRAs);
  const isLoading = useCRAStore((state) => state.isLoading);
  const error = useCRAStore((state) => state.error);
  const clearError = useCRAStore((state) => state.clearError);

  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Charger les CRAs et les sociétés au montage du composant
  useEffect(() => {
    logger.log(
      '📊 [Dashboard] Component mounted, fetching CRAs and Companies...',
    );
    fetchCRAs();
    fetchCompanies();
  }, [fetchCRAs, fetchCompanies]);

  // Calculer les statistiques à partir des CRAs
  const totalClients = new Set(cras.map((cra) => cra.client_id)).size;
  const totalWorkedDays = cras.reduce(
    (sum, cra) => sum + (cra.worked_days?.length || 0),
    0,
  );

  // CRAs du mois en cours
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // getMonth() retourne 0-11, on veut 1-12
  const currentYear = today.getFullYear();

  const currentMonthCRAs = cras.filter((cra) => {
    return cra.month === currentMonth && cra.year === currentYear;
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
      subtext: `${currentMonthCRAs.reduce((sum, cra) => sum + (cra.worked_days?.length || 0), 0)} jours`,
    },
    {
      label: 'Total jours',
      value: totalWorkedDays.toString(),
      icon: '📅',
      subtext: `${cras.length} CRA`,
    },
    {
      label: 'Clients actifs',
      value: totalClients.toString(),
      icon: '👥',
    },
  ];

  // Trier les CRAs par année/mois décroissant
  const sortedCRAs = [...cras].sort((a, b) => {
    if (b.year !== a.year) {
      return b.year - a.year; // Année décroissante
    }
    return b.month - a.month; // Mois décroissant
  });

  // Pagination des CRAs
  const totalPages = Math.ceil(sortedCRAs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCRAs = sortedCRAs.slice(startIndex, startIndex + itemsPerPage);

  // Fonction helper pour obtenir le nom d'une société
  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.designation || 'N/A';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
            Dashboard
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-1">
            Gérez vos comptes rendus d'activité
          </p>
        </div>
        <Link to="/dashboard/cra/new">
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
            className="bg-[rgb(var(--color-surface))] rounded-lg border border-[rgb(var(--color-border))] p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-[rgb(var(--color-text))]">
                  {stat.value}
                </p>
                {stat.subtext && (
                  <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1">
                    {stat.subtext}
                  </p>
                )}
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CRAs List */}
      <div className="bg-[rgb(var(--color-surface))] rounded-lg border border-[rgb(var(--color-border))]">
        <div className="px-6 py-4 border-b border-[rgb(var(--color-border))]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
              Mes comptes rendus d'activités
            </h2>
            {sortedCRAs.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Afficher
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-sm border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                  par page
                </span>
              </div>
            )}
          </div>
        </div>

        {isLoading && cras.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Spinner />
            <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
              Chargement des CRAs...
            </p>
          </div>
        ) : paginatedCRAs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-[rgb(var(--color-text-muted))]"
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
            <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
              Aucun CRA disponible
            </p>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mt-2">
              Créez votre premier CRA pour commencer
            </p>
            <Link to="/dashboard/cra/new">
              <Button className="mt-4">Créer un CRA</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--color-border))]">
            {paginatedCRAs.map((cra) => (
              <div
                key={cra.id}
                className="px-6 py-4 hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-[rgb(var(--color-text))]">
                        {formatMonthYear(cra.month, cra.year)}
                      </h3>
                      <StatusBadge status={cra.status as CRAStatus} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
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
                        {getCompanyName(cra.client_id)}
                      </span>
                      {cra.worked_days && cra.worked_days.length > 0 && (
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
                          {cra.worked_days.length} jours
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/cra/${cra.id}/preview`}>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </Link>
                    <Link to={`/dashboard/cra/${cra.id}/edit`}>
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

        {/* Pagination Controls */}
        {sortedCRAs.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedCRAs.length)} sur {sortedCRAs.length} CRAs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-[rgb(var(--color-text))] px-2">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {cras.length === 0 && !isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">
              Démarrage rapide
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
              Créez votre premier CRA en quelques clics
            </p>
            <Link to="/dashboard/cra/new">
              <Button variant="primary">Créer un CRA</Button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">
              Besoin d'aide ?
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
              Consultez notre documentation pour plus d'informations
            </p>
            <Button variant="outline">Voir la documentation</Button>
          </div>
        </div>
      )}
    </div>
  );
}
