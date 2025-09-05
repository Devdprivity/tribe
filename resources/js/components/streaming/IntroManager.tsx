import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCcw, Check, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IntroManagerProps {
    onIntroReady: (introUrl: string | null) => void;
    onIntroEnd: () => void;
    maxDurationMinutes?: number;
    showPreview?: boolean;
}

const IntroManager: React.FC<IntroManagerProps> = ({
    onIntroReady,
    onIntroEnd,
    maxDurationMinutes = 20,
    showPreview = true
}) => {
    const [customIntro, setCustomIntro] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [useCustomIntro, setUseCustomIntro] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Default intro video (Tribe logo animation)
    const defaultIntroUrl = '/videos/tribe-default-intro.mp4';
    
    useEffect(() => {
        // Notify parent about the selected intro
        const selectedIntro = useCustomIntro && customIntro ? customIntro : defaultIntroUrl;
        onIntroReady(selectedIntro);
    }, [useCustomIntro, customIntro, onIntroReady]);
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('video/mp4')) {
            setError('Solo se permiten archivos MP4');
            return;
        }
        
        // Validate file size (max 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            setError('El archivo es demasiado grande. Máximo 500MB.');
            return;
        }
        
        setError(null);
        setIsUploading(true);
        setUploadProgress(0);
        
        // Create video element to check duration
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        
        video.onloadedmetadata = () => {
            const durationMinutes = video.duration / 60;
            
            if (durationMinutes > maxDurationMinutes) {
                setError(`El video es demasiado largo. Máximo ${maxDurationMinutes} minutos.`);
                setIsUploading(false);
                URL.revokeObjectURL(url);
                return;
            }
            
            setVideoDuration(video.duration);
            
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setIsUploading(false);
                    setCustomIntro(url);
                    setUseCustomIntro(true);
                }
                setUploadProgress(progress);
            }, 200);
        };
        
        video.onerror = () => {
            setError('Error al procesar el video');
            setIsUploading(false);
            URL.revokeObjectURL(url);
        };
        
        video.src = url;
    };
    
    const handleRemoveCustomIntro = () => {
        if (customIntro) {
            URL.revokeObjectURL(customIntro);
        }
        setCustomIntro(null);
        setUseCustomIntro(false);
        setVideoDuration(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const togglePlayPreview = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const resetPreview = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Configurar Intro del Stream</h3>
                <p className="text-white/70 text-sm">
                    Puedes cargar un video personalizado (máx. {maxDurationMinutes} min) o usar el intro por defecto
                </p>
            </div>
            
            {/* Intro Selection */}
            <div className="space-y-4">
                {/* Default Intro Option */}
                <div className="apple-liquid-card p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="default-intro"
                                name="intro-type"
                                checked={!useCustomIntro}
                                onChange={() => setUseCustomIntro(false)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="default-intro" className="text-white font-medium">
                                Intro por defecto
                            </label>
                        </div>
                        <div className="text-white/70 text-sm">
                            Logo Tribe + "Presentando, en breve comenzaremos"
                        </div>
                    </div>
                </div>
                
                {/* Custom Intro Option */}
                <div className="apple-liquid-card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="custom-intro"
                                name="intro-type"
                                checked={useCustomIntro}
                                onChange={() => setUseCustomIntro(true)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor="custom-intro" className="text-white font-medium">
                                Intro personalizado
                            </label>
                        </div>
                        {customIntro && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleRemoveCustomIntro}
                                className="apple-liquid-button bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                    
                    {useCustomIntro && (
                        <div className="space-y-3">
                            {!customIntro ? (
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/mp4"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    <Upload className="w-12 h-12 mx-auto mb-3 text-white/50" />
                                    <p className="text-white mb-2">Cargar video MP4</p>
                                    <p className="text-white/60 text-sm mb-4">
                                        Máximo {maxDurationMinutes} minutos, 500MB
                                    </p>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="apple-liquid-button bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isUploading ? 'Procesando...' : 'Seleccionar archivo'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="apple-liquid-card p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-400" />
                                            <span className="text-white text-sm font-medium">Video cargado</span>
                                        </div>
                                        {videoDuration && (
                                            <span className="text-white/70 text-sm">
                                                Duración: {formatDuration(videoDuration)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/70">Procesando video...</span>
                                        <span className="text-white">{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Error Display */}
            {error && (
                <Alert className="bg-red-500/20 border-red-400/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                        {error}
                    </AlertDescription>
                </Alert>
            )}
            
            {/* Preview */}
            {showPreview && (useCustomIntro ? customIntro : defaultIntroUrl) && (
                <div className="apple-liquid-card p-4">
                    <h4 className="text-white font-medium mb-3">Vista previa</h4>
                    <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            className="w-full h-48 object-contain"
                            src={useCustomIntro && customIntro ? customIntro : defaultIntroUrl}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => {
                                setIsPlaying(false);
                                onIntroEnd();
                            }}
                        />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={togglePlayPreview}
                                    className="apple-liquid-button bg-white/20 hover:bg-white/30 text-white"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={resetPreview}
                                    className="apple-liquid-button bg-white/20 hover:bg-white/30 text-white"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="text-white/70 text-xs">
                                {useCustomIntro ? 'Intro personalizado' : 'Intro por defecto'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntroManager;