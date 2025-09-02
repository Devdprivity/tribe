import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/utils/time-format';
import { 
    X, 
    ChevronUp, 
    ChevronDown, 
    Clock,
    Play,
    Pause,
    Image as ImageIcon,
    Heart,
    MessageCircle,
    Share2
} from 'lucide-react';

interface Story {
    id: number;
    media_url: string;
    media_type: 'image' | 'video';
    caption?: string;
    expires_at: string;
    time_remaining: string;
    created_at: string;
    likes_count: number;
    is_liked: boolean;
}

interface StoryGroup {
    user: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
    stories: Story[];
    has_viewed: boolean;
}

interface StoriesViewerProps {
    isOpen: boolean;
    onClose: () => void;
    storyGroups: StoryGroup[];
    initialGroupIndex: number;
    initialStoryIndex: number;
}

export default function StoriesViewer({ 
    isOpen, 
    onClose, 
    storyGroups, 
    initialGroupIndex, 
    initialStoryIndex 
}: StoriesViewerProps) {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [mediaError, setMediaError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isLiking, setIsLiking] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    const currentGroup = storyGroups[currentGroupIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];

    useEffect(() => {
        if (isOpen && currentStory) {
            setMediaError(false);
            setIsLoading(false); // Mostrar contenido inmediatamente
            setIsPlaying(true);
            
            // Cargar estado de likes
            loadLikeStatus();
            
            // Si es un video, intentar reproducirlo inmediatamente
            if (currentStory.media_type === 'video' && videoRef.current) {
                const video = videoRef.current;
                video.load(); // Recargar el video
                
                // Intentar reproducir inmediatamente sin esperar
                video.play().catch((error) => {
                    console.log('Error al reproducir video:', error);
                    setIsPlaying(false);
                });
            }
            
            startProgress();
        }
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isOpen, currentStory]);

    const handleMediaError = () => {
        console.log('Error al cargar media');
        setMediaError(true);
    };

    const loadLikeStatus = async () => {
        if (!currentStory) return;
        
        // Usar datos iniciales si están disponibles
        if (currentStory.likes_count !== undefined && currentStory.is_liked !== undefined) {
            setIsLiked(currentStory.is_liked);
            setLikesCount(currentStory.likes_count);
            return;
        }
        
        // Fallback: cargar desde API si no hay datos iniciales
        try {
            const response = await fetch(`/stories/${currentStory.id}/like-status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.liked);
                setLikesCount(data.likes_count);
            }
        } catch (error) {
            console.error('Error al cargar estado de likes:', error);
        }
    };

    const handleLikeStory = async () => {
        if (!currentStory || isLiking) return;
        
        setIsLiking(true);
        
        try {
            const response = await fetch(`/stories/${currentStory.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.liked);
                setLikesCount(data.likes_count);
                
                // Feedback visual
                const button = document.querySelector('[data-story-like]') as HTMLElement;
                if (button) {
                    button.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        button.style.transform = 'scale(1)';
                    }, 200);
                }
            } else {
                console.error('Error al procesar like');
            }
        } catch (error) {
            console.error('Error al dar like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentStory = () => {
        console.log('Comment on story:', currentStory.id);
        // Aquí puedes implementar la lógica para comentar
        // Por ejemplo, abrir un modal de comentarios o redirigir
        alert('Función de comentarios en desarrollo');
    };

    const handleShareStory = async () => {
        try {
            console.log('Share story:', currentStory.id);
            
            // Intentar usar la Web Share API si está disponible
            if (navigator.share) {
                await navigator.share({
                    title: `Historia de ${currentGroup.user.full_name}`,
                    text: currentStory.caption || 'Mira esta historia',
                    url: window.location.href,
                });
            } else {
                // Fallback: copiar URL al portapapeles
                await navigator.clipboard.writeText(window.location.href);
                alert('URL copiada al portapapeles');
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            // Fallback: copiar URL al portapapeles
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('URL copiada al portapapeles');
            } catch (clipboardError) {
                console.error('Error al copiar al portapapeles:', clipboardError);
                alert('No se pudo compartir la historia');
            }
        }
    };

    const startProgress = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        setProgress(0);
        const duration = 15000; // 15 segundos
        const interval = 50; // Actualizar cada 50ms
        const increment = (interval / duration) * 100;

        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    nextStory();
                    return 0;
                }
                return prev + increment;
            });
        }, interval);
    };

    const pauseProgress = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
        setIsPlaying(false);
    };

    const resumeProgress = () => {
        if (!isPlaying) {
            startProgress();
            setIsPlaying(true);
        }
    };

    const nextStory = () => {
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentGroupIndex < storyGroups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    };

    const prevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentStoryIndex(storyGroups[currentGroupIndex - 1].stories.length - 1);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                prevStory();
                break;
            case 'ArrowDown':
                e.preventDefault();
                nextStory();
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
            case ' ':
                e.preventDefault();
                if (isPlaying) {
                    pauseProgress();
                } else {
                    resumeProgress();
                }
                break;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isPlaying]);

    if (!currentStory) return null;

    const isVideo = currentStory.media_type === 'video';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full h-full max-w-none max-h-none p-0 bg-black/90 backdrop-blur-md border-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                <DialogTitle className="sr-only">
                    Historia de {currentGroup.user.full_name || currentGroup.user.username}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Visualizando historia {currentStoryIndex + 1} de {currentGroup.stories.length} de {currentGroup.user.full_name || currentGroup.user.username}
                </DialogDescription>
                <div className="relative w-full h-full flex flex-col">
                    {/* Header con información del usuario */}
                    <div className="absolute top-0 left-0 right-0 z-20 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={currentGroup.user.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                        {currentGroup.user.full_name?.charAt(0) || currentGroup.user.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-white font-medium">{currentGroup.user.full_name}</p>
                                    <p className="text-white/70 text-sm">@{currentGroup.user.username}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-black/50 border-white/30 text-white">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTimeAgo(currentStory.created_at)}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="mt-4 flex gap-1">
                            {currentGroup.stories.map((_, index) => (
                                <div
                                    key={index}
                                    className="h-1 bg-white/30 rounded-full flex-1"
                                >
                                    <div
                                        className={`h-full bg-white rounded-full transition-all duration-100 ${
                                            index < currentStoryIndex
                                                ? 'w-full'
                                                : index === currentStoryIndex
                                                ? 'w-full'
                                                : 'w-0'
                                        }`}
                                        style={{
                                            width: index === currentStoryIndex ? `${progress}%` : undefined
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 relative">
                        {/* Media */}
                        <div className="absolute inset-0">
                            {mediaError ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                                    <ImageIcon className="h-16 w-16 mb-4 text-gray-400" />
                                    <p className="text-lg font-medium mb-2">Error al cargar el contenido</p>
                                    <p className="text-sm text-gray-400">No se pudo mostrar esta historia</p>
                                </div>
                            ) : isVideo ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        src={currentStory.media_url}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="auto"
                                        crossOrigin="anonymous"
                                        onPlay={() => {
                                            console.log('Video empezó a reproducir');
                                            setIsPlaying(true);
                                        }}
                                        onPause={() => {
                                            console.log('Video pausado');
                                            setIsPlaying(false);
                                        }}
                                        onPlaying={() => {
                                            console.log('Video reproduciendo');
                                            setIsPlaying(true);
                                        }}
                                        onError={(e) => {
                                            console.log('Error en video:', e);
                                            handleMediaError();
                                        }}
                                        onLoadStart={() => {
                                            console.log('Video empezó a cargar');
                                        }}
                                        onWaiting={() => {
                                            console.log('Video esperando datos');
                                        }}
                                        onStalled={() => {
                                            console.log('Video estancado');
                                        }}
                                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23374151'/%3E%3Cpath d='M40 30l20 15-20 15V30z' fill='%23fff'/%3E%3C/svg%3E"
                                    />
                                    {/* Overlay de video con icono de play - solo cuando está pausado manualmente */}
                                    {!isPlaying && videoRef.current && videoRef.current.paused && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-black/50 rounded-full p-4">
                                                <Play className="h-12 w-12 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <img
                                    src={currentStory.media_url}
                                    alt={`Historia de ${currentGroup.user.full_name || currentGroup.user.username}`}
                                    className="w-full h-full object-cover"
                                    onError={handleMediaError}
                                    loading="eager"
                                />
                            )}
                        </div>

                        {/* Overlay con gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Caption */}
                        {currentStory.caption && (
                            <div className="absolute bottom-20 left-4 right-4">
                                <p className="text-white text-lg leading-relaxed">
                                    {currentStory.caption}
                                </p>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-3 z-30">
                            <div className="flex flex-col items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`border-0 rounded-full w-12 h-12 p-0 hover:scale-110 transition-all duration-200 ${
                                        isLiked 
                                            ? 'bg-gradient-to-br from-[#00FFCC] via-[#CC4DFF] to-[#3366FF] text-white shadow-lg shadow-[#00FFCC]/25' 
                                            : 'bg-black/50 hover:bg-black/70 text-white'
                                    }`}
                                    data-story-like
                                    disabled={isLiking}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleLikeStory();
                                    }}
                                >
                                    <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                                </Button>
                                {likesCount > 0 && (
                                    <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded-full">
                                        {likesCount}
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-12 h-12 p-0 hover:scale-110 transition-transform"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCommentStory();
                                }}
                            >
                                <MessageCircle className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-12 h-12 p-0 hover:scale-110 transition-transform"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleShareStory();
                                }}
                            >
                                <Share2 className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Áreas de navegación */}
                        <div className="absolute inset-0 flex">
                            {/* Área izquierda - historia anterior */}
                            <div
                                className="w-1/2 h-full cursor-pointer"
                                onClick={prevStory}
                            />
                            
                            {/* Área derecha - siguiente historia */}
                            <div
                                className="w-1/2 h-full cursor-pointer"
                                onClick={nextStory}
                            />
                        </div>

                        {/* Botones de navegación vertical */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                            {currentGroupIndex > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={prevStory}
                                    className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 p-0"
                                >
                                    <ChevronUp className="h-5 w-5" />
                                </Button>
                            )}
                            
                            {currentGroupIndex < storyGroups.length - 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={nextStory}
                                    className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 p-0"
                                >
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            )}
                        </div>

                        {/* Indicador de pausa/reproducción - solo cuando está pausado manualmente */}
                        {!isPlaying && videoRef.current && videoRef.current.paused && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={resumeProgress}
                                    className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-16 h-16 p-0"
                                >
                                    <Play className="h-8 w-8" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
