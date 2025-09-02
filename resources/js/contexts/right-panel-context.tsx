import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RightPanelContextType {
    isCollapsed: boolean;
    togglePanel: () => void;
    collapsePanel: () => void;
    expandPanel: () => void;
}

const RightPanelContext = createContext<RightPanelContextType | undefined>(undefined);

interface RightPanelProviderProps {
    children: ReactNode;
}

export function RightPanelProvider({ children }: RightPanelProviderProps) {
    // Inicializar el estado desde localStorage o por defecto false
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('right-panel-collapsed');
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });

    // Guardar en localStorage cuando cambie el estado
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('right-panel-collapsed', JSON.stringify(isCollapsed));
        }
    }, [isCollapsed]);

    const togglePanel = () => {
        setIsCollapsed(!isCollapsed);
    };

    const collapsePanel = () => {
        setIsCollapsed(true);
    };

    const expandPanel = () => {
        setIsCollapsed(false);
    };

    return (
        <RightPanelContext.Provider value={{
            isCollapsed,
            togglePanel,
            collapsePanel,
            expandPanel
        }}>
            {children}
        </RightPanelContext.Provider>
    );
}

export function useRightPanel() {
    const context = useContext(RightPanelContext);
    if (context === undefined) {
        throw new Error('useRightPanel must be used within a RightPanelProvider');
    }
    return context;
}
