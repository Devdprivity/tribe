import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

import Preloader from './preloader';
import QuickGuide from './quick-guide';
import { useAppearance } from '@/hooks/use-appearance';

interface AppInitializerProps {
    children: React.ReactNode;
}

type AppState = 'preloader' | 'onboarding' | 'system';

export default function AppInitializer({ children }: AppInitializerProps) {
    // SIEMPRE empezar con preloader - sin excepciones
    const [appState, setAppState] = useState<AppState>('preloader');
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
    const [isAfterOnboarding, setIsAfterOnboarding] = useState(false);
    
    // Obtener datos de sesión desde el backend
    const { props } = usePage();
    const sessionData = props as any;
    
    // Inicializar tema del usuario
    useAppearance();

    useEffect(() => {
        console.log('🚀 AppInitializer: Inicializando aplicación - SIEMPRE con preloader');
        
        // Verificar si el backend indica que se debe limpiar el localStorage
        if (sessionData.clear_onboarding_storage) {
            console.log('🚀 AppInitializer: Limpiando localStorage por usuario nuevo');
            localStorage.removeItem('tribe_onboarding_completed');
        }
        
        // Verificar si debe mostrar onboarding
        const hasCompletedOnboarding = localStorage.getItem('tribe_onboarding_completed');
        const forceOnboarding = sessionData.force_onboarding;
        const isFirstVisit = hasCompletedOnboarding !== 'true' || forceOnboarding;
        
        setShouldShowOnboarding(isFirstVisit);
        console.log('🚀 AppInitializer: shouldShowOnboarding =', isFirstVisit, '(force:', forceOnboarding, ')');
        
        // SIEMPRE empezar con preloader
        console.log('🚀 AppInitializer: Iniciando preloader obligatorio');
    }, [sessionData]);

    const handlePreloaderComplete = () => {
        console.log('🚀 AppInitializer: Preloader completado');
        
        if (shouldShowOnboarding && !isAfterOnboarding) {
            console.log('🚀 AppInitializer: Mostrando onboarding');
            setAppState('onboarding');
        } else {
            console.log('🚀 AppInitializer: Yendo al sistema');
            setAppState('system');
        }
    };

    const handleOnboardingComplete = () => {
        console.log('🚀 AppInitializer: Onboarding completado');
        localStorage.setItem('tribe_onboarding_completed', 'true');
        
        // Limpiar banderas de sesión del backend
        if (sessionData.force_onboarding || sessionData.clear_onboarding_storage) {
            // Hacer una petición para limpiar las banderas de sesión
            fetch('/clear-onboarding-flags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            }).catch(console.error);
        }
        
        // Marcar que estamos después del onboarding
        setIsAfterOnboarding(true);
        
        // Después del onboarding, ir directamente al sistema
        console.log('🚀 AppInitializer: Yendo al sistema después del onboarding');
        setAppState('system');
    };

    console.log('🚀 AppInitializer: Estado actual =', appState);

    // Mostrar preloader
    if (appState === 'preloader') {
        return <Preloader onComplete={handlePreloaderComplete} />;
    }

    // Mostrar onboarding
    if (appState === 'onboarding') {
        return <QuickGuide onComplete={handleOnboardingComplete} />;
    }

    // Mostrar sistema
    if (appState === 'system') {
        return <>{children}</>;
    }

    // Estado inicial (no debería llegar aquí)
    return null;
}
