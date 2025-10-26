import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function CreateCRA() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    month: '',
    year: '',
    client: '',
    consultant: '',
    days: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Sauvegarder le CRA
    console.log('CRA créé:', formData);
    navigate('/');
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
        <h1 className="text-3xl font-bold text-gray-900">Nouveau CRA</h1>
        <p className="text-gray-600 mt-1">
          Créez un nouveau compte rendu d'activité
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">À propos du CRA</p>
              <p>
                Après création, vous pourrez ajouter le détail des activités et
                télécharger le document PDF.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Annuler
          </Button>
          <Button type="submit">Créer le CRA</Button>
        </div>
      </form>
    </div>
  );
}
