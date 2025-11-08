import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, StatusBadge, Spinner } from '@/components/ui';
import { type CRAStatus } from '@/constants/cra.constants';
import { formatMonthYear, formatWorkedDays } from '@/lib/monthUtils';
import { useCRA } from '@/hooks/useCRA';
import { useCompanyStore } from '@/stores/company.store';

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
  const workedDaysCount = selectedCRA.worked_days?.length || 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] mb-2">
          <button onClick={() => navigate('/')} className="hover:text-[rgb(var(--color-text))]">
            Dashboard
          </button>
          <span>/</span>
          <span className="text-[rgb(var(--color-text))]\">CRA #{id?.slice(0, 8)}</span>
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
              {formatMonthYear(selectedCRA.month, selectedCRA.year)} - {getCompanyName(selectedCRA.provider_id)} → {getCompanyName(selectedCRA.client_id)}
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
                Période
              </h3>
              <p className="text-lg font-semibold text-[rgb(var(--color-text))]">
                {formatMonthYear(selectedCRA.month, selectedCRA.year)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                Prestataire
              </h3>
              <p className="text-lg font-semibold text-[rgb(var(--color-text))]">
                {getCompanyName(selectedCRA.provider_id)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">Client</h3>
              <p className="text-lg font-semibold text-[rgb(var(--color-text))]">
                {getCompanyName(selectedCRA.client_id)}
              </p>
            </div>
          </div>
        </div>

        {/* Jours travaillés */}
        <div className="p-6 border-b border-[rgb(var(--color-border))]">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">
            Jours travaillés
          </h3>
          {!selectedCRA.worked_days || selectedCRA.worked_days.length === 0 ? (
            <div className="text-center py-8 bg-[rgb(var(--color-surface-hover))] rounded-lg">
              <p className="text-[rgb(var(--color-text-secondary))]">Aucun jour travaillé renseigné</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[rgb(var(--color-surface-hover))] rounded-lg p-4">
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  <span className="font-semibold text-[rgb(var(--color-text))]">
                    {workedDaysCount} jour{workedDaysCount > 1 ? 's' : ''} travaillé{workedDaysCount > 1 ? 's' : ''}
                  </span>
                  {' : '}
                  {formatWorkedDays(selectedCRA.worked_days)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Commentaire */}
        {selectedCRA.comment && (
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">
              Commentaire
            </h3>
            <div className="bg-[rgb(var(--color-surface-hover))] rounded-lg p-4">
              <p className="text-[rgb(var(--color-text))] whitespace-pre-wrap">
                {selectedCRA.comment}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="p-6 bg-[rgb(var(--color-surface-hover))]">
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">Jours travaillés</p>
              <p className="text-2xl font-bold text-[rgb(var(--color-text))]">
                {workedDaysCount}
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
