import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/utils/time-format';
import { 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Clock,
    Play,
    Image as ImageIcon
} from 'lucide-react';
import StoriesViewer from './stories-viewer';

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
    comments_count: number;
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

interface StoriesCarouselProps {
    onCreateStory?: () => void;
}

export default function StoriesCarousel({ onCreateStory }: StoriesCarouselProps) {
    const [stories, setStories] = useState<StoryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const response = await fetch('/api/stories');
            if (response.ok) {
                const data = await response.json();
                setStories(data);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollLeft = () => {
        if (isScrolling) return;
        setIsScrolling(true);
        setCurrentIndex(prev => Math.max(0, prev - 1));
        setTimeout(() => setIsScrolling(false), 300);
    };

    const scrollRight = () => {
        if (isScrolling) return;
        setIsScrolling(true);
        setCurrentIndex(prev => Math.min(stories.length - 1, prev + 1));
        setTimeout(() => setIsScrolling(false), 300);
    };

    const getLatestStory = (storyGroup: StoryGroup) => {
        return storyGroup.stories[0]; // El más reciente
    };

    const handleStoryClick = (groupIndex: number, storyIndex: number = 0) => {
        setSelectedGroupIndex(groupIndex);
        setSelectedStoryIndex(storyIndex);
        setShowViewer(true);
    };

    if (isLoading) {
        return (
            <Card className="apple-liquid-card border border-white/20 mb-6">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0">
                                <div className="w-16 h-20 bg-white/10 rounded-xl mb-2"></div>
                                <div className="w-12 h-3 bg-white/10 rounded mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (stories.length === 0) {
        return (
            <Card className="apple-liquid-card border border-white/20 mb-6">
                <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center cursor-pointer relative z-50" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onCreateStory) {
                                onCreateStory();
                            }
                        }}>
                            <div className="w-16 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center hover:border-white/50 transition-colors relative z-50">
                                <Plus className="h-6 w-6 text-white/70 mb-1" />
                                <span className="text-xs text-white/70">Crear historia</span>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm">No hay historias disponibles</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="apple-liquid-card border border-white/20 mb-6">
                <CardContent className="p-4">
                    <div className="relative">
                        {/* Botón de navegación izquierda */}
                        {currentIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0"
                                onClick={scrollLeft}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Botón de navegación derecha */}
                        {currentIndex < stories.length - 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0"
                                onClick={scrollRight}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Carousel de historias */}
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div 
                                className="flex gap-4 transition-transform duration-300 ease-in-out"
                                style={{ transform: `translateX(-${currentIndex * 80}px)` }}
                            >
                                {/* Botón para crear historia */}
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/50 transition-colors relative z-50"
                                         onClick={(e) => {
                                             e.preventDefault();
                                             e.stopPropagation();
                                             if (onCreateStory) {
                                                 onCreateStory();
                                             }
                                         }}>
                                        <Plus className="h-6 w-6 text-white/70 mb-1" />
                                        <span className="text-xs text-white/70">Crear</span>
                                    </div>
                                </div>

                                {/* Historias de usuarios */}
                                {stories.map((storyGroup, groupIndex) => {
                                    const latestStory = getLatestStory(storyGroup);
                                    const isVideo = latestStory.media_type === 'video';
                                    
                                    return (
                                        <div key={storyGroup.user.id} className="flex-shrink-0">
                                            <div 
                                                className="cursor-pointer"
                                                onClick={() => handleStoryClick(groupIndex, 0)}
                                            >
                                                <div className="relative w-16 h-20 rounded-xl overflow-hidden cursor-pointer group">
                                                    {/* Media de fondo */}
                                                    {isVideo ? (
                                                        <video
                                                            src={latestStory.media_url}
                                                            className="w-full h-full object-cover"
                                                            muted
                                                            playsInline
                                                            preload="metadata"
                                                            poster=""
                                                            onLoadedData={(e) => {
                                                                // Pausar en el primer frame para mostrar preview
                                                                const video = e.target as HTMLVideoElement;
                                                                video.currentTime = 0;
                                                                video.pause();
                                                            }}
                                                            onError={(e) => {
                                                                console.log('Error cargando preview de video:', e);
                                                                // Fallback a imagen si el video falla
                                                                const target = e.target as HTMLVideoElement;
                                                                target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={latestStory.media_url}
                                                            alt={storyGroup.user.full_name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                console.log('Error cargando imagen:', e);
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23374151"/%3E%3Cpath d="M40 30l20 15-20 15V30z" fill="%23fff"/%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {/* Overlay con gradiente */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                    
                                                    {/* Avatar del usuario */}
                                                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                                                        <div className={`w-8 h-8 rounded-full border-2 ${
                                                            storyGroup.has_viewed 
                                                                ? 'border-white/30' 
                                                                : 'border-blue-400 shadow-lg shadow-blue-400/50'
                                                        }`}>
                                                            <Avatar className="w-full h-full">
                                                                <AvatarImage src={storyGroup.user.avatar} />
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                                                    {storyGroup.user.full_name?.charAt(0) || storyGroup.user.username?.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                    </div>

                                                    {/* Icono de tipo de media - solo para imágenes */}
                                                    {!isVideo && (
                                                        <div className="absolute top-1 right-1">
                                                            <ImageIcon className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}

                                                    {/* Tiempo de publicación */}
                                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                                        <Badge variant="outline" className="bg-black/50 border-white/30 text-white text-xs px-1 py-0">
                                                            <Clock className="h-2 w-2 mr-1" />
                                                            {formatTimeAgo(latestStory.created_at)}
                                                        </Badge>
                                                    </div>

                                                    {/* Efecto hover */}
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            
                                            {/* Nombre del usuario */}
                                            <p className="text-xs text-white/90 text-center mt-1 truncate max-w-16">
                                                {storyGroup.user.full_name || storyGroup.user.username}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de visualización de historias */}
            <StoriesViewer
                isOpen={showViewer}
                onClose={() => setShowViewer(false)}
                storyGroups={stories}
                initialGroupIndex={selectedGroupIndex}
                initialStoryIndex={selectedStoryIndex}
            />
        </>
    );
}
