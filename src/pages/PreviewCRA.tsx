import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, StatusBadge, Spinner } from '@/components/ui';
import { type CRAStatus } from '@/constants/cra.constants';
import { datePickerUtils } from '@/lib/datePicker';
import { useCRA } from '@/hooks/useCRA';
import { useCompanyStore } from '@/stores/company.store';
import { logger } from '@/lib/logger';

export function PreviewCRA() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { cra: selectedCRA, isLoading, error } = useCRA(id);
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);

  // Charger les sociétés au montage
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Fonction helper pour obtenir le nom d'une société
  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.designation || 'N/A';
  };

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF
    logger.log('Export PDF du CRA:', id);
    alert('Export PDF en cours de développement...');
  };

  // Loader pendant le chargement
  if (isLoading && !selectedCRA) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-[rgb(var(--color-text-secondary))]">Chargement du CRA...</p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le CRA n'existe pas
  if (error || (!isLoading && !selectedCRA)) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0"
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
              <h3 className="text-lg font-medium text-red-800">
                CRA introuvable
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error || "Le CRA demandé n'existe pas ou n'a pas pu être chargé."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Retour au dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCRA) return null;

  // Calculer les statistiques
  const totalHours = Number(selectedCRA.total_hours);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] mb-2">
          <button onClick={() => navigate('/')} className="hover:text-[rgb(var(--color-text))]">
            Dashboard
          </button>
          <span>/</span>
          <span className="text-[rgb(var(--color-text))]">CRA #{id}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
                Prévisualisation du CRA
              </h1>
              <StatusBadge status={selectedCRA.status as CRAStatus} />
            </div>
            <p className="text-[rgb(var(--color-text-secondary))] mt-1">
              {datePickerUtils.formatDateLong(selectedCRA.date)} - {getCompanyName(selectedCRA.client_id)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/cra/${id}/edit`)}
            >
              Éditer
            </Button>
            <Button onClick={handleExportPDF}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exporter PDF
            </Button>
          </div>
        </div>
      </div>

      {/* CRA Preview */}
      <div className="bg-[rgb(var(--color-surface))] rounded-lg border border-[rgb(var(--color-border))] shadow-sm">
        {/* Header du CRA */}
        <div className="border-b border-[rgb(var(--color-border))] p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                Date
              </h3>
              <p className="text-lg font-semibold text-[rgb(var(--color-text))]">
                {datePickerUtils.formatDateLong(selectedCRA.date)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">Client</h3>
              <p className="text-lg font-semibold text-[rgb(var(--color-text))]">
                {getCompanyName(selectedCRA.client_id)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                Heures totales
              </h3>
              <p className="text-lg font-semibold text-[rgb(var(--color-text))]">
                {totalHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        {/* Activités */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">
            Détail des activités
          </h3>

          {selectedCRA.activities.length === 0 ? (
            <div className="text-center py-8 bg-[rgb(var(--color-surface-hover))] rounded-lg">
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
              <p className="mt-4 text-[rgb(var(--color-text-secondary))]">Aucune activité enregistrée</p>
              <Button
                variant="outline"
                onClick={() => navigate(`/cra/${id}/edit`)}
                className="mt-4"
              >
                Ajouter des activités
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[rgb(var(--color-border))]">
                <thead>
                  <tr className="bg-[rgb(var(--color-surface-hover))]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                      Heures
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[rgb(var(--color-surface))] divide-y divide-[rgb(var(--color-border))]">
                  {selectedCRA.activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-[rgb(var(--color-surface-hover))]">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[rgb(var(--color-text))]">
                        {activity.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-[rgb(var(--color-text))] text-right whitespace-nowrap">
                        {activity.hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[rgb(var(--color-surface-hover))] font-semibold">
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text))]" colSpan={2}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text))] text-right">
                      {totalHours.toFixed(1)}h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border-t border-[rgb(var(--color-border))] p-6 bg-[rgb(var(--color-surface-hover))]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">Heures totales</p>
              <p className="text-2xl font-bold text-[rgb(var(--color-text))]">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">Nombre d'activités</p>
              <p className="text-2xl font-bold text-[rgb(var(--color-text))]">
                {selectedCRA.activities.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">Moyenne par activité</p>
              <p className="text-2xl font-bold text-[rgb(var(--color-text))]">
                {selectedCRA.activities.length > 0
                  ? (totalHours / selectedCRA.activities.length).toFixed(1)
                  : '0'}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/')}>
          Retour au dashboard
        </Button>
      </div>
    </div>
  );
}
