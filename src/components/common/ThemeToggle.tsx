import React from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { theme, setTheme } = useTheme();

  const options: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Laptop },
  ];

  if (compact) {
    const nextMode = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    const CurrentIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

    return (
      <button
        onClick={() => setTheme(nextMode)}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-brand-850 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-brand-700"
        title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
        aria-label="Toggle theme mode"
      >
        <CurrentIcon className="w-4 h-4 text-flame-600 dark:text-flame-400" />
      </button>
    );
  }

  return (
    <div 
      className="inline-flex items-center bg-slate-100 dark:bg-brand-900/90 p-1 rounded-xl border border-slate-200 dark:border-brand-800 text-xs shadow-2xs"
      role="radiogroup"
      aria-label="Color theme selection"
    >
      {options.map(({ mode, label, icon: Icon }) => {
        const isActive = theme === mode;
        return (
          <button
            key={mode}
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(mode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all duration-150 ${
              isActive
                ? 'bg-brand-800 dark:bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title={`Switch to ${label} theme`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-flame-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
