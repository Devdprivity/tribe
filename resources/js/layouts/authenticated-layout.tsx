import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import RightPanel from '@/components/right-panel';
import { useAppearance } from '@/hooks/use-appearance';
import AppInitializer from '@/components/app-initializer';
import CommentsModal from '@/components/comments-modal';
import { useComments } from '@/contexts/comments-context';
import { usePage } from '@inertiajs/react';

interface Props {
    title?: string;
    description?: string;
}

export default function AuthenticatedLayout({ children, title, description }: PropsWithChildren<Props>) {
    const { appearance } = useAppearance();
    const { isCommentsModalOpen, selectedPost, closeCommentsModal } = useComments();
    const { auth } = usePage().props as any;
    const currentUser = auth.user;

    return (
        <AppInitializer>
            <>
                <Head title={title} />
                <meta name="description" content={description} />

                <div className="h-screen bg-background overflow-hidden app-layout-container" data-appearance={appearance}>
                    <AppShell>
                        {/* Sidebar Izquierdo - Navegación Principal */}
                        <AppSidebar />

                        {/* Contenido Principal - Feed Central */}
                        <div className="flex-1 flex flex-col h-full">
                            <AppHeader />

                            {/* Feed Central */}
                            <main className="flex-1 flex justify-center overflow-y-auto main-content-scroll">
                                <div className="w-full max-w-6xl px-8 py-6">
                                    {children}
                                </div>
                            </main>
                        </div>

                        {/* Panel Derecho - Colapsable */}
                        <RightPanel />
                    </AppShell>
                </div>

                {/* Modal de Comentarios */}
                {selectedPost && (
                    <CommentsModal
                        isOpen={isCommentsModalOpen}
                        onClose={closeCommentsModal}
                        post={selectedPost}
                        currentUser={currentUser}
                    />
                )}
            </>
        </AppInitializer>
    );
}
