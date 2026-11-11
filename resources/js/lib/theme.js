import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'passquiz-theme';
const listeners = new Set();

/**
 * Thème actuel : la classe `dark` de <html>, posée avant l'affichage par app.blade.php
 * (choix mémorisé, sinon préférence du système).
 */
function currentTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function subscribe(listener) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

function setTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Stockage indisponible (navigation privée) : le thème s'applique pour la session en cours.
    }

    listeners.forEach((listener) => listener());
}

export default function useTheme() {
    const theme = useSyncExternalStore(subscribe, currentTheme);

    return { theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}
