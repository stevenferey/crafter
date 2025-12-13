import { useEffect, useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore, useSystemThemeListener } from '@/stores/app.store';
import { useAuthStore } from '@/stores/auth.store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  // Auth store
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Menu utilisateur
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialiser le thème au démarrage
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // Écouter les changements de préférence système
  useSystemThemeListener();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Header */}
      <header className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-[rgb(var(--color-text))]">
                  Crafter
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive('/dashboard')
                    ? 'bg-[rgb(var(--color-primary-light))] text-blue-700'
                    : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text))]',
                )}
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/cra/new"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive('/dashboard/cra/new')
                    ? 'bg-[rgb(var(--color-primary-light))] text-blue-700'
                    : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text))]',
                )}
              >
                Nouveau CRA
              </Link>
              <Link
                to="/dashboard/companies"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname.startsWith('/dashboard/companies')
                    ? 'bg-[rgb(var(--color-primary-light))] text-blue-700'
                    : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text))]',
                )}
              >
                Sociétés
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />

              {/* Menu utilisateur */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}
                  <svg
                    className={cn(
                      'w-4 h-4 text-[rgb(var(--color-text-secondary))] transition-transform',
                      showUserMenu && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[rgb(var(--color-surface))] rounded-lg shadow-lg border border-[rgb(var(--color-border))] py-1 z-50">
                    {/* Info utilisateur */}
                    <div className="px-4 py-3 border-b border-[rgb(var(--color-border))]">
                      <p className="text-sm font-medium text-[rgb(var(--color-text))]">
                        {user?.first_name && user?.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user?.email}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
                        {user?.email}
                      </p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-[rgb(var(--color-surface-hover))] transition-colors flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
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
              <a
                href="#"
                className="hover:text-[rgb(var(--color-text))] transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="hover:text-[rgb(var(--color-text))] transition-colors"
              >
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
