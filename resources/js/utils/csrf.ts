/**
 * Utility functions for CSRF token handling
 */

/**
 * Get CSRF token from meta tag
 */
export const getCsrfToken = (): string => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        console.error('CSRF token not found in meta tag');
        return '';
    }
    return token;
};

/**
 * Get headers with CSRF token for API requests
 */
export const getCsrfHeaders = (): Record<string, string> => {
    return {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        'Accept': 'application/json',
    };
};

/**
 * Make authenticated API request with CSRF token
 */
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const defaultOptions: RequestInit = {
        headers: getCsrfHeaders(),
        credentials: 'same-origin',
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    return fetch(url, mergedOptions);
};
