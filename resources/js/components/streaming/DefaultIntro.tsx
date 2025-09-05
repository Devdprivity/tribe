import React, { useEffect, useState } from 'react';

interface DefaultIntroProps {
    onEnd: () => void;
    duration?: number; // Duration in seconds
}

const DefaultIntro: React.FC<DefaultIntroProps> = ({ onEnd, duration = 5 }) => {
    const [currentPhase, setCurrentPhase] = useState<'logo' | 'text' | 'fade'>('logo');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const totalDuration = duration * 1000; // Convert to milliseconds
        const logoPhase = totalDuration * 0.4; // 40% for logo animation
        const textPhase = totalDuration * 0.5; // 50% for text display
        const fadePhase = totalDuration * 0.1; // 10% for fade out

        const startTime = Date.now();
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progressPercent = (elapsed / totalDuration) * 100;
            setProgress(progressPercent);

            if (elapsed < logoPhase) {
                setCurrentPhase('logo');
            } else if (elapsed < logoPhase + textPhase) {
                setCurrentPhase('text');
            } else if (elapsed < totalDuration) {
                setCurrentPhase('fade');
            } else {
                onEnd();
                return;
            }

            requestAnimationFrame(updateProgress);
        };

        updateProgress();
    }, [duration, onEnd]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 25% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
                    `
                }} />
            </div>

            {/* Main Content */}
            <div className={`text-center transition-all duration-1000 ${
                currentPhase === 'fade' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}>
                {/* Tribe Logo Animation */}
                <div className={`mb-8 transition-all duration-1000 ${
                    currentPhase === 'logo' ? 'scale-100 opacity-100' : 'scale-110 opacity-90'
                }`}>
                    <svg 
                        width="120" 
                        height="120" 
                        viewBox="0 0 120 120" 
                        className="mx-auto"
                    >
                        {/* Outer Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="55"
                            fill="none"
                            stroke="url(#gradient1)"
                            strokeWidth="3"
                            className={`transition-all duration-2000 ${
                                currentPhase === 'logo' ? 'animate-pulse' : ''
                            }`}
                            style={{
                                strokeDasharray: currentPhase === 'logo' ? '0 345' : '345 0',
                                strokeDashoffset: currentPhase === 'logo' ? '345' : '0',
                                animation: currentPhase === 'logo' ? 'drawCircle 2s ease-in-out forwards' : 'none'
                            }}
                        />
                        
                        {/* Inner Triangle (Tribe Symbol) */}
                        <path
                            d="M60 25 L85 70 L35 70 Z"
                            fill="url(#gradient2)"
                            className={`transition-all duration-1000 delay-500 ${
                                currentPhase === 'logo' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                            }`}
                            style={{
                                transformOrigin: '60px 60px'
                            }}
                        />
                        
                        {/* Inner Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="8"
                            fill="#ffffff"
                            className={`transition-all duration-1000 delay-1000 ${
                                currentPhase === 'logo' ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                            }`}
                            style={{
                                transformOrigin: '60px 60px'
                            }}
                        />
                        
                        {/* Gradients */}
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="50%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#F59E0B" />
                                <stop offset="50%" stopColor="#EF4444" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Brand Name */}
                <div className={`mb-6 transition-all duration-1000 delay-1500 ${
                    currentPhase === 'logo' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}>
                    <h1 className="text-6xl font-bold text-white mb-2 tracking-wider">
                        <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            TRIBE
                        </span>
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto rounded-full" />
                </div>

                {/* Presentation Text */}
                <div className={`transition-all duration-1000 ${
                    currentPhase === 'text' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Presentando
                    </h2>
                    <p className="text-lg text-white/80 mb-8">
                        En breve comenzaremos
                    </p>
                    
                    {/* Loading Animation */}
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-8 left-8 right-8">
                    <div className="w-full bg-white/20 rounded-full h-1">
                        <div 
                            className="bg-gradient-to-r from-purple-400 to-cyan-400 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes drawCircle {
                    from {
                        stroke-dasharray: 0 345;
                        stroke-dashoffset: 345;
                    }
                    to {
                        stroke-dasharray: 345 0;
                        stroke-dashoffset: 0;
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default DefaultIntro;