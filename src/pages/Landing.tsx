import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import {
  DonationModal,
  BitcoinIcon,
  EthereumIcon,
} from '@/components/features/DonationModal';

const BTC_ADDRESS = import.meta.env.VITE_DONATION_BTC;
const ETH_ADDRESS = import.meta.env.VITE_DONATION_ETH;

export function Landing() {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const hasDonationAddresses = BTC_ADDRESS || ETH_ADDRESS;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] force-light">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[rgb(var(--color-text))] tracking-tight">
              Simplifiez la gestion
              <span className="block text-indigo-600">
                de vos CRA
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-[rgb(var(--color-text-secondary))]">
              Créez, gérez et exportez vos comptes rendus d'activité en quelques
              clics. Fini les tableaux Excel et les documents perdus.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-[rgb(var(--color-bg))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text))]">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">
              Une solution simple et efficace pour gérer vos CRA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl p-8 shadow-sm border border-[rgb(var(--color-border))]">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-indigo-600"
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
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-3">
                Création rapide
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Calendrier interactif pour sélectionner vos jours travaillés.
                Simple, rapide et intuitif.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl p-8 shadow-sm border border-[rgb(var(--color-border))]">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-indigo-600"
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
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-3">
                Export PDF
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Générez des CRA professionnels prêts à être signés et envoyés à
                vos clients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl p-8 shadow-sm border border-[rgb(var(--color-border))]">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-indigo-600"
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
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-3">
                Multi-sociétés
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Gérez plusieurs clients et prestataires depuis une seule
                interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-[rgb(var(--color-bg-secondary))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text))]">
            Prêt à simplifier vos CRA ?
          </h2>
          <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">
            Rejoignez Crafter et gagnez du temps sur votre gestion
            administrative.
          </p>
          <div className="mt-10">
            <Link to="/register">
              <Button size="lg" className="px-8">
                Créer un compte gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-[rgb(var(--color-bg))] border-t border-[rgb(var(--color-border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              &copy; {new Date().getFullYear()} Crafter. Tous droits réservés.
            </p>
            {hasDonationAddresses && (
              <div className="flex items-center gap-2">
                <span className="text-[rgb(var(--color-border))] hidden sm:inline">
                  |
                </span>
                <button
                  onClick={() => setIsDonationModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors group cursor-pointer"
                  aria-label="Soutenir le projet"
                >
                  {BTC_ADDRESS && (
                    <span className="transition-transform duration-500 group-hover:rotate-[360deg]">
                      <BitcoinIcon />
                    </span>
                  )}
                  {ETH_ADDRESS && (
                    <span className="transition-transform duration-500 group-hover:rotate-[360deg]">
                      <EthereumIcon />
                    </span>
                  )}
                  <span>Soutenir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </div>
  );
}
