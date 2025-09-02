import React, { useState, useEffect } from 'react';
import { Image, Check, X, Loader2 } from 'lucide-react';
import { useBackgrounds, BackgroundOption } from '@/hooks/use-backgrounds';

export const BackgroundSelector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBackground, setSelectedBackground] = useState<string>('');
    const { backgrounds, loading } = useBackgrounds();

    const applyBackground = (backgroundPath: string) => {
        setSelectedBackground(backgroundPath);
        
        // Si es fondo negro, usar la función específica
        if (backgroundPath === 'black') {
            applyBlackBackground();
            return;
        }
        
        // Aplicar el fondo a todo el sistema (body)
        const body = document.body;
        if (body) {
            body.style.backgroundImage = `url(${backgroundPath})`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundRepeat = 'no-repeat';
            body.style.backgroundAttachment = 'fixed';
            body.style.minHeight = '100vh';
            
            // Agregar overlay semi-transparente para mejorar legibilidad
            let overlay = document.querySelector('.global-background-overlay') as HTMLElement;
            if (!overlay) {
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
            }
            
            // Asegurar que todo el contenido esté por encima del overlay
            const appContainer = document.querySelector('#app');
            if (appContainer) {
                (appContainer as HTMLElement).style.position = 'relative';
                (appContainer as HTMLElement).style.zIndex = '1';
            }
        }
        
        // Guardar en localStorage
        localStorage.setItem('selectedBackground', backgroundPath);
        setIsOpen(false);
    };

    const applyBlackBackground = () => {
        setSelectedBackground('black');
        
        // Aplicar fondo negro sólido
        const body = document.body;
        if (body) {
            body.style.setProperty('background-color', '#000000', 'important');
            body.style.setProperty('background-image', 'none', 'important');
            
            // Remover overlay global si existe
            const overlay = document.querySelector('.global-background-overlay');
            if (overlay) {
                overlay.remove();
            }
            
            // Restaurar z-index del contenido
            const appContainer = document.querySelector('#app');
            if (appContainer) {
                (appContainer as HTMLElement).style.zIndex = 'auto';
            }
        }
        
        // Guardar en localStorage
        localStorage.setItem('selectedBackground', 'black');
        setIsOpen(false);
    };

    const removeBackground = () => {
        setSelectedBackground('');
        
        // Remover el fondo del body
        const body = document.body;
        if (body) {
            body.style.backgroundImage = 'none';
            body.style.backgroundSize = '';
            body.style.backgroundPosition = '';
            body.style.backgroundRepeat = '';
            body.style.backgroundAttachment = '';
            body.style.minHeight = '';
            
            // Remover overlay global
            const overlay = document.querySelector('.global-background-overlay');
            if (overlay) {
                overlay.remove();
            }
            
            // Restaurar z-index del contenido
            const appContainer = document.querySelector('#app');
            if (appContainer) {
                (appContainer as HTMLElement).style.zIndex = 'auto';
            }
        }
        
        // Limpiar localStorage
        localStorage.removeItem('selectedBackground');
        setIsOpen(false);
    };

    // Cargar fondo guardado al montar el componente
    useEffect(() => {
        // El preloader ya aplicó el fondo, solo sincronizar el estado
        const savedBackground = localStorage.getItem('selectedBackground');
        if (savedBackground && savedBackground !== 'black' && savedBackground !== '/img/Theme/default-bg.jpg') {
            console.log('🎨 Background-selector: Sincronizando estado con fondo aplicado:', savedBackground);
            setSelectedBackground(savedBackground);
            // No aplicar el fondo aquí, ya fue aplicado por el preloader
        } else {
            // Si no hay fondo guardado o es negro, mantener el estado
            setSelectedBackground('black');
        }
    }, []);

    return (
        <div className="relative">
            {/* Botón para abrir el selector */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
                <Image className="h-4 w-4" />
                <span>Fondo</span>
            </button>

            {/* Modal del selector */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Seleccionar Fondo del Sistema
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Estado de carga */}
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando fondos...</span>
                            </div>
                        )}

                        {/* Grid de opciones de fondo */}
                        {!loading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                {backgrounds.map((bg, index) => (
                                    <div
                                        key={index}
                                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedBackground === bg.path
                                                ? 'border-blue-500 ring-2 ring-blue-200'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                        onClick={() => applyBackground(bg.path)}
                                    >
                                        {/* Preview de la imagen */}
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                            <img
                                                src={bg.path}
                                                alt={bg.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback si la imagen no carga
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                                                <span class="text-white text-xs text-center px-2">${bg.name}</span>
                                                            </div>
                                                        `;
                                                    }
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Overlay con nombre */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">
                                                {bg.name}
                                            </span>
                                        </div>

                                        {/* Check si está seleccionado */}
                                        {selectedBackground === bg.path && (
                                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}

                                        {/* Badge para fondo por defecto */}
                                        {bg.path.includes('4k-resolution-5f0ynl6oa2mijckl.webp') && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                Default
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex justify-between">
                            <button
                                onClick={removeBackground}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Quitar Fondo
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
