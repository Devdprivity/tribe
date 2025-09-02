import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface GuideSlide {
    image: string;
    title: string;
    description: string;
    duration: number;
}

const guideSlides: GuideSlide[] = [

    {
        image: '/img/guia/create post.png',
        title: 'Crear Contenido',
        description: 'Comparte tus proyectos, ideas y conocimientos con la comunidad de desarrolladores',
        duration: 2500
    },
    {
        image: '/img/guia/Canales favoritos.png',
        title: 'Canales Favoritos',
        description: 'Accede rápidamente a tus canales preferidos desde el sidebar personalizado',
        duration: 2500
    },
    {
        image: '/img/guia/menu colsapsed.png',
        title: 'Menú Colapsado',
        description: 'Maximiza tu espacio de trabajo con el menú colapsable que se convierte en un orbe flotante',
        duration: 2500
    },
    {
        image: '/img/guia/alertas mensajes theme profile config cerra sesion.png',
        title: 'Notificaciones y Configuración',
        description: 'Mantente al día con alertas, mensajes y personaliza tu experiencia con temas y configuraciones',
        duration: 2500
    }
];

interface QuickGuideProps {
    onComplete: () => void;
}

export default function QuickGuide({ onComplete }: QuickGuideProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // No necesitamos timer, el video se manejará con onEnded
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const slide = guideSlides[currentSlide];
        const timer = setTimeout(() => {
            if (currentSlide < guideSlides.length - 1) {
                setCurrentSlide(prev => prev + 1);
            } else {
                // Última slide completada
                onComplete();
            }
        }, slide.duration);

        return () => clearTimeout(timer);
    }, [currentSlide, isLoading, onComplete]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <div className="text-center">
                    <video
                        autoPlay
                        muted
                        className="max-w-md mx-auto"
                        style={{ filter: 'brightness(1.5) contrast(1.2)' }}
                        onEnded={() => {
                            setIsLoading(false);
                        }}
                    >
                        <source src="/img/preloader/PreloaderFinal.mp4" type="video/mp4" />
                        {/* Fallback si el video no carga */}
                        <div className="text-white text-lg">Cargando...</div>
                    </video>
                </div>
            </div>
        );
    }

    const currentGuideSlide = guideSlides[currentSlide];

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50">
            {/* Contenido Principal */}
            <div className="max-w-4xl mx-auto p-8 relative">
                {/* Imagen */}
                <div className="relative mb-8">
                    <img
                        src={currentGuideSlide.image}
                        alt={currentGuideSlide.title}
                        className="w-full h-auto rounded-2xl shadow-2xl border border-white/20"
                        style={{ maxHeight: '60vh', objectFit: 'contain' }}
                    />
                    
                    {/* Overlay de gradiente sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                </div>

                {/* Información del Slide */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {currentGuideSlide.title}
                    </h2>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                        {currentGuideSlide.description}
                    </p>
                </div>

                {/* Indicadores de Progreso */}
                <div className="flex justify-center">
                    <div className="flex space-x-2">
                        {guideSlides.map((_, index) => (
                            <div
                                key={index}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentSlide
                                        ? 'bg-white'
                                        : 'bg-white/30'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Efectos de Fondo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    );
}
