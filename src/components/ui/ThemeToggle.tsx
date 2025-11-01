import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore, type Theme } from '@/stores/app.store';

const themeConfig = {
  light: {
    icon: Sun,
    label: 'Mode clair',
    next: 'dark' as Theme,
  },
  dark: {
    icon: Moon,
    label: 'Mode sombre',
    next: 'system' as Theme,
  },
  system: {
    icon: Monitor,
    label: 'Mode système',
    next: 'light' as Theme,
  },
};

export function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const currentTheme = themeConfig[theme];
  const Icon = currentTheme.icon;

  const handleToggle = () => {
    setTheme(currentTheme.next);
  };

  return (
    <button
      onClick={handleToggle}
      className="group relative inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label={`Changer de thème (actuellement: ${currentTheme.label})`}
      title={currentTheme.label}
    >
      <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />

      {/* Tooltip */}
      <span className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700">
        {currentTheme.label}
      </span>
    </button>
  );
}
