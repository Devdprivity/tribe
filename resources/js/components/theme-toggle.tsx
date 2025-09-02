import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export const ThemeToggle: React.FC = () => {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
                onClick={() => updateAppearance('light')}
                className={`p-2 rounded-md transition-all duration-200 ${
                    appearance === 'light'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Tema Claro"
            >
                <Sun className="h-4 w-4" />
            </button>
            
            <button
                onClick={() => updateAppearance('dark')}
                className={`p-2 rounded-md transition-all duration-200 ${
                    appearance === 'dark'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Tema Oscuro"
            >
                <Moon className="h-4 w-4" />
            </button>
            
            <button
                onClick={() => updateAppearance('system')}
                className={`p-2 rounded-md transition-all duration-200 ${
                    appearance === 'system'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Tema del Sistema"
            >
                <Monitor className="h-4 w-4" />
            </button>
        </div>
    );
};
