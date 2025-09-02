import React, { useState, useEffect } from 'react';
import { preloadAndApplyBackground } from '@/utils/background-loader';

interface PreloaderProps {
    onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const [videoEnded, setVideoEnded] = useState(false);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [backgroundPreloaded, setBackgroundPreloaded] = useState(false);

    // Precargar el fondo del usuario mientras se reproduce el video
    useEffect(() => {
        const preloadUserBackground = async () => {
            const savedBackground = localStorage.getItem('selectedBackground');
            
            if (savedBackground && savedBackground !== 'black' && savedBackground !== '/img/Theme/default-bg.jpg') {
                console.log('🎬 Preloader: Precargando imagen de fondo del usuario:', savedBackground);
                
                // Crear una nueva imagen para precargar
                const img = new Image();
                img.onload = () => {
                    console.log('🎬 Preloader: Imagen de fondo precargada exitosamente');
                    setBackgroundPreloaded(true);
                };
                img.onerror = () => {
                    console.log('🎬 Preloader: Error al precargar imagen, usando fondo negro');
                    setBackgroundPreloaded(true);
                };
                img.src = savedBackground;
            } else {
                console.log('🎬 Preloader: No hay fondo personalizado, usando negro por defecto');
                setBackgroundPreloaded(true);
            }
        };
        
        preloadUserBackground();
    }, []);

    // Cuando el video termine y el fondo esté precargado, aplicar el background
    useEffect(() => {
        if (videoEnded && backgroundPreloaded && !backgroundLoaded) {
            console.log('🎬 Preloader: Video terminado y fondo precargado, aplicando background...');
            
            preloadAndApplyBackground().then(() => {
                console.log('🎬 Preloader: Background aplicado exitosamente (negro + personalizado automático)');
                setBackgroundLoaded(true);
                
                // Pequeño delay para asegurar que el background se aplique completamente
                setTimeout(() => {
                    console.log('🎬 Preloader: Completado, llamando onComplete');
                    onComplete();
                }, 200); // Aumentado para dar tiempo al fondo personalizado
            });
        }
    }, [videoEnded, backgroundPreloaded, backgroundLoaded, onComplete]);

    const handleVideoEnded = () => {
        console.log('🎬 Preloader: Video terminado');
        setVideoEnded(true);
    };

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="text-center">
                <video
                    autoPlay
                    muted
                    className="max-w-md mx-auto"
                    onEnded={handleVideoEnded}
                >
                    <source src="/img/preloader/PreloaderFinal.mp4" type="video/mp4" />
                </video>
                
                {videoEnded && !backgroundLoaded && (
                    <div className="mt-4 text-white/70">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p className="mt-2">
                            {!backgroundPreloaded ? 'Preparando fondo...' : 'Cargando sistema...'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
