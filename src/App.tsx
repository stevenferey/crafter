import { useState } from 'react';
import { Button } from '@/components/ui/Button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Vite + React + TypeScript
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Démo du composant Button avec Tailwind CSS
        </p>

        <div className="space-y-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Compteur: {count}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setCount(count + 1)}>Incrémenter</Button>
              <Button variant="secondary" onClick={() => setCount(count - 1)}>
                Décrémenter
              </Button>
              <Button variant="outline" onClick={() => setCount(0)}>
                Réinitialiser
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Variantes de boutons
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Tailles de boutons
            </h2>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              États désactivés
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Primary Disabled</Button>
              <Button variant="secondary" disabled>
                Secondary Disabled
              </Button>
              <Button variant="outline" disabled>
                Outline Disabled
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
