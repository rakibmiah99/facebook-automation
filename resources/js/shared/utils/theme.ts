const STORAGE_KEY = 'app-theme';

export function getStoredTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: 'dark' | 'light') {
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 250);
}
