import { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { UserProfilePanel } from '@/components/user-profile-panel';
import { NotificationsPanel } from '@/components/notifications-panel';
import { ChatPanel } from '@/components/chat-panel';
import { useAppearance } from '@/hooks/use-appearance';

interface Props {
    title?: string;
    description?: string;
}

export default function AppLayout({ children, title, description }: PropsWithChildren<Props>) {
    const { appearance } = useAppearance();

    return (
        <>
            <Head title={title} />
            <meta name="description" content={description} />

            <div className="min-h-screen bg-background" data-appearance={appearance}>
                <AppShell>
                    {/* Sidebar Izquierdo - Navegación Principal */}
                    <AppSidebar />

                    {/* Contenido Principal - Feed Central */}
                    <div className="flex-1 flex flex-col min-h-screen">
                        <AppHeader />

                        {/* Feed Central */}
                        <main className="flex-1 flex justify-center">
                            <div className="w-full max-w-2xl px-4 py-6">
                                {children}
                            </div>
                        </main>
                    </div>

                    {/* Panel Derecho - Perfil, Notificaciones, Chat */}
                    <div className="w-80 border-l bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                        <div className="sticky top-0 h-screen overflow-y-auto">
                            {/* Perfil del Usuario */}
                            <UserProfilePanel />

                            {/* Notificaciones */}
                            <NotificationsPanel />

                            {/* Chat/Conversaciones */}
                            <ChatPanel />
                        </div>
                    </div>
                </AppShell>
            </div>
        </>
    );
}
