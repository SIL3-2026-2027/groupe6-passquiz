import useTheme from '../lib/theme';
import Icon from './Icon';

/**
 * Bascule mode clair / mode sombre. `className` adapte les couleurs au fond (en-tête clair ou barre latérale sombre).
 */
export default function ThemeToggle({ className = 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100' }) {
    const { theme, toggleTheme } = useTheme();
    const label = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';

    return (
        <button type="button" onClick={toggleTheme} className={`rounded-lg p-2 transition ${className}`} title={label} aria-label={label}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
    );
}
