import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner } from '@/components/ui';
import { useCompanyStore } from '@/stores/company.store';
import { logger } from '@/lib/logger';

export function Companies() {
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const deleteCompany = useCompanyStore((state) => state.deleteCompany);
  const isLoading = useCompanyStore((state) => state.isLoading);
  const error = useCompanyStore((state) => state.error);
  const clearError = useCompanyStore((state) => state.clearError);

  // Charger les sociétés au montage du composant
  useEffect(() => {
    logger.log('🏢 [Companies] Component mounted, fetching companies...');
    fetchCompanies();
  }, [fetchCompanies]);

  const handleDelete = async (id: string, designation: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${designation}" ?`)) {
      try {
        await deleteCompany(id);
      } catch (error) {
        // L'erreur est déjà gérée par le store
        logger.error('Failed to delete company:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
            Sociétés
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-1">
            Gérez vos sociétés clientes et prestataires
          </p>
        </div>
        <Link to="/companies/new">
          <Button size="lg">
            <span className="mr-2">+</span>
            Nouvelle société
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Companies List */}
      {!isLoading && companies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-2">
            Aucune société
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            Commencez par créer votre première société
          </p>
          <Link to="/companies/new">
            <Button>
              <span className="mr-2">+</span>
              Créer une société
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && companies.length > 0 && (
        <div className="bg-[rgb(var(--color-surface))] rounded-lg border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-surface-secondary))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                    Désignation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                    {companies[0]?.repertoire || 'Répertoire'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-[rgb(var(--color-surface-secondary))] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[rgb(var(--color-text))]">
                        {company.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {company.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {company.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {company.repertoire_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/companies/${company.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(company.id, company.designation)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
