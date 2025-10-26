import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useCRAStore } from '@/stores/cra.store';

export function PreviewCRA() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const selectedCRA = useCRAStore((state) => state.selectedCRA);
  const fetchCRAById = useCRAStore((state) => state.fetchCRAById);
  const isLoading = useCRAStore((state) => state.isLoading);

  // Charger le CRA au montage du composant
  useEffect(() => {
    if (id) {
      fetchCRAById(id);
    }
  }, [id, fetchCRAById]);

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF
    console.log('Export PDF du CRA:', id);
    alert('Export PDF en cours de développement...');
  };

  // Loader pendant le chargement
  if (isLoading && !selectedCRA) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement du CRA...</p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le CRA n'existe pas
  if (!selectedCRA && !isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">CRA introuvable</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedCRA) return null;

  // Calculer les statistiques
  const totalHours = selectedCRA.activities.reduce(
    (sum, activity) => sum + activity.hours,
    0,
  );

  // Convertir le mois en nom
  const getMonthName = (month: string) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];
    return months[parseInt(month) - 1] || month;
  };

  // Badge de statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', className: 'text-gray-700 bg-gray-100' },
      completed: { label: 'Complété', className: 'text-green-700 bg-green-100' },
      submitted: { label: 'Soumis', className: 'text-blue-700 bg-blue-100' },
      approved: { label: 'Approuvé', className: 'text-emerald-700 bg-emerald-100' },
      rejected: { label: 'Rejeté', className: 'text-red-700 bg-red-100' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-gray-900">
            Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900">CRA #{id}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Prévisualisation du CRA
              </h1>
              {getStatusBadge(selectedCRA.status)}
            </div>
            <p className="text-gray-600 mt-1">
              {getMonthName(selectedCRA.month)} {selectedCRA.year} - {selectedCRA.client}
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header du CRA */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Période
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {getMonthName(selectedCRA.month)} {selectedCRA.year}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Client</h3>
              <p className="text-lg font-semibold text-gray-900">
                {selectedCRA.client}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Consultant
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {selectedCRA.consultant}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Jours travaillés
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {selectedCRA.days} jours
              </p>
            </div>
          </div>
        </div>

        {/* Activités */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Détail des activités
          </h3>

          {selectedCRA.activities.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
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
              <p className="mt-4 text-gray-600">Aucune activité enregistrée</p>
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heures
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedCRA.activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {new Date(activity.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {activity.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                        {activity.hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-gray-900" colSpan={2}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {totalHours}h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Heures totales</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Moyenne par jour</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedCRA.days > 0 ? (totalHours / selectedCRA.days).toFixed(1) : '0'}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Activités</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedCRA.activities.length}
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
