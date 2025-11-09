import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      className={cn(
        'group relative inline-flex h-12 w-24 items-center overflow-hidden rounded-full px-2 transition-all duration-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950',
        'border border-white/50 bg-white/70 text-slate-600 shadow-lg shadow-indigo-100/40 backdrop-blur-xl',
        'before:absolute before:inset-0 before:-z-10 before:rounded-full before:border before:border-white/30 before:opacity-80 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-black/40',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-indigo-500/10 after:via-transparent after:to-purple-500/10 after:opacity-0 after:transition-opacity after:duration-500 group-hover:after:opacity-100',
        className,
      )}
      title={`Chuyển sang chế độ ${isDark ? 'sáng' : 'tối'}`}
    >
      <div className="absolute inset-x-4 flex items-center justify-between text-slate-400">
        <SunIcon
          className={cn(
            'h-4 w-4 transition-colors duration-500',
            isDark ? 'text-amber-200/50' : 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]'
          )}
        />
        <MoonIcon
          className={cn(
            'h-4 w-4 transition-colors duration-500',
            isDark ? 'text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.45)]' : 'text-indigo-200/40'
          )}
        />
      </div>

      <span
        className={cn(
          'absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg transition-all duration-500 ease-out overflow-hidden',
          isDark
            ? 'translate-x-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 shadow-indigo-500/40'
            : 'translate-x-0 bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 shadow-amber-400/50'
        )}
      >
        <span className="absolute inset-0 rounded-full border border-white/40 opacity-60"></span>
        <span className="absolute inset-0 rounded-full bg-white/25 blur-sm opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
        <span className="relative">
          {isDark ? (
            <MoonIcon className="h-4 w-4" />
          ) : (
            <SunIcon className="h-4 w-4" />
          )}
        </span>
      </span>
      <span className="sr-only">Chuyển chế độ nền</span>
    </button>
  );
}

