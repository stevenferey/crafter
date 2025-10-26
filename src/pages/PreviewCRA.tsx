import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function PreviewCRA() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Données de démonstration (à remplacer par un fetch réel)
  const craData = {
    id,
    month: 'Janvier',
    year: '2025',
    client: 'Acme Corp',
    consultant: 'Jean Dupont',
    days: 20,
    activities: [
      {
        date: '2025-01-02',
        description: 'Développement de la fonctionnalité de reporting',
        hours: 8,
      },
      {
        date: '2025-01-03',
        description: 'Réunion client et ajustements',
        hours: 6,
      },
      {
        date: '2025-01-06',
        description: 'Développement API REST',
        hours: 8,
      },
      {
        date: '2025-01-07',
        description: 'Tests et debugging',
        hours: 7,
      },
      {
        date: '2025-01-08',
        description: 'Documentation technique',
        hours: 5,
      },
    ],
  };

  const totalHours = craData.activities.reduce(
    (sum, activity) => sum + activity.hours,
    0,
  );

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF
    console.log('Export PDF du CRA:', id);
    alert('Export PDF en cours de développement...');
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
            <h1 className="text-3xl font-bold text-gray-900">
              Prévisualisation du CRA
            </h1>
            <p className="text-gray-600 mt-1">
              {craData.month} {craData.year} - {craData.client}
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
                {craData.month} {craData.year}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Client</h3>
              <p className="text-lg font-semibold text-gray-900">
                {craData.client}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Consultant
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {craData.consultant}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Jours travaillés
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {craData.days} jours
              </p>
            </div>
          </div>
        </div>

        {/* Activités */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Détail des activités
          </h3>

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
                {craData.activities.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
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
                {(totalHours / craData.days).toFixed(1)}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Activités</p>
              <p className="text-2xl font-bold text-gray-900">
                {craData.activities.length}
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
