import { useCallback, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme(userThemePreference?: Appearance) {
    // Use user preference if available, otherwise fallback to localStorage, then 'dark'
    const savedAppearance = userThemePreference || (localStorage.getItem('appearance') as Appearance) || 'dark';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const { props } = usePage<{ auth: { user: any; theme_preference: Appearance } }>();
    const userThemePreference = props.auth.theme_preference || 'dark';
    const [appearance, setAppearance] = useState<Appearance>(userThemePreference);

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);

        // Update user preference in database if user is authenticated
        if (props.auth.user) {
            router.patch('/user/theme-preference', { theme_preference: mode }, {
                preserveState: true,
                preserveScroll: true,
                only: ['auth'],
            });
        }
    }, [props.auth.user]);

    useEffect(() => {
        // Use user preference from backend, fallback to localStorage, then 'dark'
        const initialTheme = userThemePreference || (localStorage.getItem('appearance') as Appearance) || 'dark';
        setAppearance(initialTheme);
        applyTheme(initialTheme);

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [userThemePreference]);

    return { appearance, updateAppearance } as const;
}
