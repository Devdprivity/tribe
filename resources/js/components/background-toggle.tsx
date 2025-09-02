import React, { useState, useEffect } from 'react';
import { Image, Check, X, Loader2 } from 'lucide-react';
import { useBackgrounds, BackgroundOption } from '@/hooks/use-backgrounds';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const BackgroundToggle: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBackground, setSelectedBackground] = useState<string>('');
    const { backgrounds, loading } = useBackgrounds();

    const applyBackground = (backgroundPath: string) => {
        console.log('Aplicando fondo:', backgroundPath);
        setSelectedBackground(backgroundPath);
        
        // Verificar si estamos en login (no aplicar fondo)
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/forgot-password';
        
        if (isLoginPage) {
            console.log('Página de login detectada - no se aplica fondo');
            return;
        }
        
        // Si es fondo negro, usar la función específica
        if (backgroundPath === 'black') {
            applyBlackBackground();
            return;
        }
        
        // Aplicar el fondo solo a páginas autenticadas
        const body = document.body;
        const html = document.documentElement;
        
        if (body && html) {
            console.log('Aplicando estilos al body y html...');
            
            // Aplicar al body usando setProperty para !important
            body.style.setProperty('background-image', `url(${backgroundPath})`, 'important');
            body.style.setProperty('background-size', 'cover', 'important');
            body.style.setProperty('background-position', 'center', 'important');
            body.style.setProperty('background-repeat', 'no-repeat', 'important');
            body.style.setProperty('background-attachment', 'fixed', 'important');
            body.style.setProperty('min-height', '100vh', 'important');
            body.style.setProperty('background-color', 'transparent', 'important');
            
            // Aplicar al html usando setProperty para !important
            html.style.setProperty('background-image', `url(${backgroundPath})`, 'important');
            html.style.setProperty('background-size', 'cover', 'important');
            html.style.setProperty('background-position', 'center', 'important');
            html.style.setProperty('background-repeat', 'no-repeat', 'important');
            html.style.setProperty('background-attachment', 'fixed', 'important');
            html.style.setProperty('min-height', '100vh', 'important');
            html.style.setProperty('background-color', 'transparent', 'important');
            
            console.log('Estilos aplicados. Verificando...');
            console.log('Body backgroundImage:', body.style.backgroundImage);
            console.log('HTML backgroundImage:', html.style.backgroundImage);
            
            // Agregar overlay semi-transparente para mejorar legibilidad
            let overlay = document.querySelector('.global-background-overlay') as HTMLElement;
            if (!overlay) {
                console.log('Creando overlay...');
                overlay = document.createElement('div');
                overlay.className = 'global-background-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    pointer-events: none;
                    z-index: -1;
                `;
                document.body.appendChild(overlay);
                console.log('Overlay creado y agregado');
            }
            
            // Asegurar que todo el contenido esté por encima del overlay
            const appContainer = document.querySelector('#app');
            if (appContainer) {
                (appContainer as HTMLElement).style.position = 'relative';
                (appContainer as HTMLElement).style.zIndex = '1';
                console.log('App container configurado');
            }
            
            // Forzar un repaint del navegador
            body.style.display = 'none';
            body.offsetHeight; // Trigger reflow
            body.style.display = '';
            
            console.log('Fondo aplicado exitosamente');
        } else {
            console.error('No se pudo encontrar body o html');
        }
        
        // Guardar en localStorage
        localStorage.setItem('selectedBackground', backgroundPath);
        console.log('Fondo guardado en localStorage:', backgroundPath);
        setIsOpen(false);
    };

    const applyBlackBackground = () => {
        console.log('Aplicando fondo negro...');
        setSelectedBackground('black');
        
        // Verificar si estamos en login (no hacer nada)
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/forgot-password';
        
        if (isLoginPage) {
            console.log('Página de login detectada - no se aplica fondo negro');
            return;
        }
        
        // Aplicar fondo negro sólido
        const body = document.body;
        const html = document.documentElement;
        
        if (body && html) {
            console.log('Aplicando fondo negro al body y html...');
            
            // Aplicar fondo negro
            body.style.setProperty('background-color', '#000000', 'important');
            body.style.setProperty('background-image', 'none', 'important');
            html.style.setProperty('background-color', '#000000', 'important');
            html.style.setProperty('background-image', 'none', 'important');
            
            console.log('Fondo negro aplicado al body y html');
            
            // Remover overlay global si existe
            const overlay = document.querySelector('.global-background-overlay');
            if (overlay) {
                overlay.remove();
                console.log('Overlay removido');
            }
            
            // Restaurar z-index del contenido
            const appContainer = document.querySelector('#app');
            if (appContainer) {
                (appContainer as HTMLElement).style.zIndex = 'auto';
                console.log('App container z-index restaurado');
            }
            
            console.log('Fondo negro aplicado exitosamente');
        } else {
            console.error('No se pudo encontrar body o html');
        }
        
        // Guardar en localStorage
        localStorage.setItem('selectedBackground', 'black');
        console.log('Fondo negro guardado en localStorage');
        setIsOpen(false);
    };

    // Cargar fondo guardado al montar el componente
    useEffect(() => {
        // Verificar si estamos en login (no aplicar fondo)
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/forgot-password';
        
        if (isLoginPage) {
            console.log('Página de login detectada - no se aplica fondo automáticamente');
            // Restaurar fondo negro del login
            restoreLoginBackground();
            return;
        }
        
        // El preloader ya aplicó el fondo, solo sincronizar el estado
        const savedBackground = localStorage.getItem('selectedBackground');
        if (savedBackground && savedBackground !== 'black' && savedBackground !== '/img/Theme/default-bg.jpg') {
            console.log('🎨 Background-toggle: Sincronizando estado con fondo aplicado:', savedBackground);
            setSelectedBackground(savedBackground);
            // No aplicar el fondo aquí, ya fue aplicado por el preloader
        } else {
            // Si no hay fondo guardado o es negro, mantener el estado
            setSelectedBackground('black');
        }
        
        // Listener para cambios de ruta
        const handleRouteChange = () => {
            const currentIsLoginPage = window.location.pathname === '/login' || 
                                     window.location.pathname === '/register' || 
                                     window.location.pathname === '/forgot-password';
            
            if (currentIsLoginPage) {
                console.log('Navegación a login detectada - restaurando fondo negro');
                restoreLoginBackground();
            }
        };
        
        // Escuchar cambios de ruta
        window.addEventListener('popstate', handleRouteChange);
        
        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);
    
    // Función para restaurar fondo negro del login
    const restoreLoginBackground = () => {
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/forgot-password';
        
        if (isLoginPage) {
            console.log('Restaurando fondo negro del login...');
            const body = document.body;
            const html = document.documentElement;
            
            if (body && html) {
                // Restaurar fondo negro
                body.style.setProperty('background-color', '#000000', 'important');
                body.style.setProperty('background-image', 'none', 'important');
                html.style.setProperty('background-color', '#000000', 'important');
                html.style.setProperty('background-image', 'none', 'important');
                
                // Remover overlay si existe
                const overlay = document.querySelector('.global-background-overlay');
                if (overlay) {
                    overlay.remove();
                }
                
                console.log('Fondo negro del login restaurado');
            }
        }
    };

    // Función para limpiar fondo existente sin modificar estado
    const clearExistingBackground = () => {
        // Verificar si estamos en login (no limpiar fondo negro)
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/forgot-password';
        
        if (isLoginPage) {
            console.log('Página de login detectada - manteniendo fondo negro');
            return;
        }
        
        const body = document.body;
        const html = document.documentElement;
        
        if (body && html) {
            // Remover estilos del body
            body.style.removeProperty('background-image');
            body.style.removeProperty('background-size');
            body.style.removeProperty('background-position');
            body.style.removeProperty('background-repeat');
            body.style.removeProperty('background-attachment');
            body.style.removeProperty('min-height');
            body.style.removeProperty('background-color');
            
            // Remover estilos del html
            html.style.removeProperty('background-image');
            html.style.removeProperty('background-size');
            html.style.removeProperty('background-position');
            html.style.removeProperty('background-repeat');
            html.style.removeProperty('background-attachment');
            html.style.removeProperty('min-height');
            html.style.removeProperty('background-color');
            
            // Remover overlay global
            const overlay = document.querySelector('.global-background-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    };

    // Función para manejar errores de carga de imagen
    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = event.currentTarget;
        img.style.display = 'none';
        // Mostrar un placeholder en caso de error
        const parent = img.parentElement;
        if (parent) {
            parent.innerHTML = `
                <div class="w-12 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded border border-white/20 flex items-center justify-center">
                    <span class="text-white text-xs">Error</span>
                </div>
            `;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button"
                    title="Cambiar fondo"
                >
                    <Image className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto apple-liquid-dropdown">
                <DropdownMenuLabel className="text-white">Seleccionar Fondo</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                
                {loading ? (
                    <div className="text-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-white/70 mx-auto mb-2" />
                        <p className="text-white/70 text-sm">Cargando fondos...</p>
                    </div>
                ) : (
                    <>
                        {/* Opción de fondo negro */}
                        <DropdownMenuItem 
                            onClick={applyBlackBackground}
                            className="text-white hover:bg-white/10 cursor-pointer"
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-12 h-8 rounded border border-white/20 overflow-hidden bg-black flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">BLACK</span>
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium">Sin fondo</span>
                                    <p className="text-xs text-white/70">Fondo negro sólido (más rápido)</p>
                                </div>
                                {selectedBackground === 'black' && (
                                    <Check className="h-4 w-4 text-blue-400 ml-auto" />
                                )}
                            </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-white/20" />
                        
                        {/* Lista de fondos disponibles */}
                        {backgrounds.map((background) => (
                            <DropdownMenuItem 
                                key={background.id}
                                onClick={() => applyBackground(background.path)}
                                className="text-white hover:bg-white/10 cursor-pointer"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-12 h-8 rounded border border-white/20 overflow-hidden bg-gray-800">
                                        <img 
                                            src={background.path} 
                                            alt={background.name}
                                            className="w-full h-full object-cover"
                                            onError={handleImageError}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-medium">{background.name}</span>
                                        <p className="text-xs text-white/70">{background.description}</p>
                                    </div>
                                    {selectedBackground === background.path && (
                                        <Check className="h-4 w-4 text-blue-400 ml-auto" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
