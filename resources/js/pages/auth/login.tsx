import { Head } from '@inertiajs/react';
import { Github, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import SocialButtons from '@/components/social-buttons';
import Threads from '@/components/threads';

export default function Login() {
    // Agregar clase al body para proteger el fondo negro
    useEffect(() => {
        document.body.classList.add('login-page');
        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

    return (
        <>
            <Head title="Iniciar Sesión" />

            {/* Background with Threads Effect */}
            <Threads 
                color={[0.2, 0.4, 1.0]} // Azul
                amplitude={1.2}
                distance={0.3}
                enableMouseInteraction={true}
                className="fixed inset-0 z-0 threads-background"
            />

            {/* Main Content Container - No Scroll */}
            <div className="h-screen flex flex-col items-center justify-center relative z-10 px-4 overflow-hidden">
                {/* Logo Tribe - Más pequeño */}
                <div className="mb-12">
                    <img
                        src="/apple-touch-icon.png"
                        alt="Tribe Logo"
                        className="h-25 w-25 mx-auto"
                    />
                </div>
                
                {/* Simple Login Card - Más compacto */}
                <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-800 shadow-2xl max-w-sm w-full mb-2">
                    {/* Header - Más compacto */}
                    <div className="text-center mb-3">
                        <h1 className="text-lg font-bold text-white mb-1">
                            Iniciar Sesión
                        </h1>
                        <p className="text-gray-400 text-xs">
                            Conecta con tu cuenta
                        </p>
                    </div>

                    {/* Social Login Buttons - Más pequeños */}
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="h-8 w-full rounded-lg border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800 hover:border-gray-600 transition-all duration-200 text-sm"
                            type="button"
                            onClick={() => window.location.href = '/auth/github'}
                        >
                            <Github className="h-3 w-3 mr-2" />
                            GitHub
                        </Button>
                        
                        <Button
                            variant="outline"
                            className="h-8 w-full rounded-lg border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
                            type="button"
                            onClick={() => window.location.href = '/auth/google'}
                        >
                            <Mail className="h-3 w-3 mr-2" />
                            Google
                        </Button>
                    </div>
                </div>

                {/* Social Buttons Footer */}
                <div className="mt-24">
                    <SocialButtons className="text-gray-400" />
                </div>
            </div>
        </>
    );
}
