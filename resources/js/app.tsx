import './bootstrap';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { initializeTheme } from './hooks/use-appearance';
import { CreatePostProvider } from './contexts/create-post-context';
import { RightPanelProvider } from './contexts/right-panel-context';
import { CommentsProvider } from './contexts/comments-context';
import { SidebarProvider } from './contexts/sidebar-context';

// Importar la función global de background-loader
import '@/utils/background-loader';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <CreatePostProvider>
                <RightPanelProvider>
                    <CommentsProvider>
                        <SidebarProvider>
                            <App {...props} />
                        </SidebarProvider>
                    </CommentsProvider>
                </RightPanelProvider>
            </CreatePostProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
// This will set light / dark mode on load...
initializeTheme();

