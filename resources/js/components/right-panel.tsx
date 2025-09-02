import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfilePanel } from '@/components/user-profile-panel';
import { NotificationsPanel } from '@/components/notifications-panel';
import { ChatPanel } from '@/components/chat-panel';
import { useRightPanel } from '@/contexts/right-panel-context';

export default function RightPanel() {
    const { isCollapsed, togglePanel } = useRightPanel();

    return (
        <div className="relative h-full">
            {/* Panel con ancho dinámico */}
            <div className={`${isCollapsed ? 'w-12' : 'w-80'} border-l border-white/10 apple-liquid-sidebar h-full transition-all duration-500 ease-in-out relative`}>
                {isCollapsed ? (
                    /* Panel Colapsado - "Barriguita" */
                    <div className="flex flex-col items-center justify-center h-full relative">
                        {/* Indicadores verticales */}
                        <div className="flex flex-col gap-2">
                            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                        </div>
                        
                        {/* Efecto de "barriguita" - Sombra sutil */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    </div>
                ) : (
                    /* Panel Expandido */
                    <div className="h-full overflow-y-auto right-panel-scroll relative">
                        <UserProfilePanel />
                        <NotificationsPanel />
                        <ChatPanel />
                    </div>
                )}
                
                {/* UN SOLO BOTÓN - Siempre pegado al borde izquierdo del panel */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-6 w-6 h-16 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border-l border-white/20 rounded-l-full flex items-center justify-center cursor-pointer hover:from-white/25 hover:to-white/10 transition-all duration-300 shadow-lg z-40"
                     onClick={togglePanel}>
                    <span className="text-white/90 font-bold text-xs">
                        {isCollapsed ? '→' : '←'}
                    </span>
                </div>
            </div>
        </div>
    );
}