import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  useAppStore,
  useSystemThemeListener,
} from '@/stores/app.store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AppLayout() {
  const location = useLocation();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  // Initialiser le thème au démarrage
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // Écouter les changements de préférence système
  useSystemThemeListener();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <header className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-[rgb(var(--color-text))]">Crafter</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive('/')
                    ? 'bg-[rgb(var(--color-primary-light))] text-blue-700'
                    : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text))]',
                )}
              >
                Dashboard
              </Link>
              <Link
                to="/cra/new"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive('/cra/new')
                    ? 'bg-[rgb(var(--color-primary-light))] text-blue-700'
                    : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text))]',
                )}
              >
                Nouveau CRA
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[rgb(var(--color-surface))] border-t border-[rgb(var(--color-border))] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-[rgb(var(--color-text-muted))]">
              © 2025 DiscoData. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm text-[rgb(var(--color-text-muted))]">
              <a href="#" className="hover:text-[rgb(var(--color-text))] transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-[rgb(var(--color-text))] transition-colors">
                Support
              </a>
              <a
                href="https://github.com/stevenferey/crafter"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[rgb(var(--color-text))] transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
