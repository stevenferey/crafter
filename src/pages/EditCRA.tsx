import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function EditCRA() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Données de démonstration (à remplacer par un fetch réel)
  const [formData, setFormData] = useState({
    month: '1',
    year: '2025',
    client: 'Acme Corp',
    consultant: 'Jean Dupont',
    days: '20',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Mettre à jour le CRA
    console.log('CRA mis à jour:', formData);
    navigate(`/cra/${id}/preview`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-gray-900">
            Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900">Éditer CRA #{id}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Éditer le CRA</h1>
        <p className="text-gray-600 mt-1">
          Modifiez les informations du compte rendu d'activité
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mois */}
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mois <span className="text-red-500">*</span>
              </label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Sélectionner un mois</option>
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Année */}
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Année <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Sélectionner une année</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div>
              <label
                htmlFor="client"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                placeholder="Nom du client"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Consultant */}
            <div>
              <label
                htmlFor="consultant"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Consultant <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="consultant"
                name="consultant"
                value={formData.consultant}
                onChange={handleChange}
                required
                placeholder="Nom du consultant"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Jours travaillés */}
            <div>
              <label
                htmlFor="days"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Jours travaillés <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="days"
                name="days"
                value={formData.days}
                onChange={handleChange}
                required
                min="1"
                max="31"
                placeholder="Nombre de jours"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Attention</p>
              <p>
                La modification d'un CRA existant remplacera les informations
                actuelles.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer ce CRA ?')) {
                // TODO: Supprimer le CRA
                navigate('/');
              }
            }}
          >
            Supprimer
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
