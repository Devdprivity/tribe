import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Play, 
    Pause, 
    SkipForward, 
    SkipBack,
    Heart,
    MessageCircle,
    Share2,
    Copy,
    GitFork,
    Code2,
    Bug,
    Lightbulb,
    TrendingUp,
    Trophy,
    HelpCircle,
    X,
    Send,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TechStory {
    id: number;
    type: 'code_snippet' | 'progress_update' | 'tip' | 'bug_fix' | 'achievement' | 'question';
    title: string;
    content: string;
    code_data?: {
        code: string;
        dependencies?: string[];
        input?: string;
        expected_output?: string;
        explanation?: string;
    };
    programming_language?: string;
    media_urls?: string[];
    background_color: string;
    is_interactive: boolean;
    duration_seconds: number;
    expires_at: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    tags: string[];
    user: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
    is_liked: boolean;
    is_viewed: boolean;
    can_execute: boolean;
    remaining_time: string;
}

interface TechStoryViewerProps {
    stories: TechStory[];
    currentIndex: number;
    onClose: () => void;
    onStoryChange: (index: number) => void;
    autoPlay?: boolean;
}

const storyTypeIcons = {
    code_snippet: Code2,
    progress_update: TrendingUp,
    tip: Lightbulb,
    bug_fix: Bug,
    achievement: Trophy,
    question: HelpCircle,
};

const storyTypeLabels = {
    code_snippet: '💻 Código',
    progress_update: '📈 Progreso',
    tip: '💡 Tip',
    bug_fix: '🐛 Bug Fix',
    achievement: '🏆 Logro',
    question: '❓ Pregunta',
};

export default function TechStoryViewer({ 
    stories, 
    currentIndex, 
    onClose, 
    onStoryChange,
    autoPlay = true 
}: TechStoryViewerProps) {
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [codeOutput, setCodeOutput] = useState<string>('');
    const [isExecuting, setIsExecuting] = useState(false);
    const progressRef = useRef<NodeJS.Timeout>();

    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (isPlaying && currentStory) {
            startProgress();
        } else {
            stopProgress();
        }

        return () => stopProgress();
    }, [isPlaying, currentIndex]);

    useEffect(() => {
        // Mark story as viewed
        if (currentStory && !currentStory.is_viewed) {
            markAsViewed(currentStory.id);
        }
    }, [currentIndex]);

    const startProgress = () => {
        stopProgress();
        setProgress(0);
        
        const duration = currentStory.duration_seconds * 1000;
        const interval = 50; // Update every 50ms
        let currentProgress = 0;

        progressRef.current = setInterval(() => {
            currentProgress += interval;
            const progressPercent = (currentProgress / duration) * 100;
            
            setProgress(Math.min(progressPercent, 100));
            
            if (progressPercent >= 100) {
                nextStory();
            }
        }, interval);
    };

    const stopProgress = () => {
        if (progressRef.current) {
            clearInterval(progressRef.current);
            progressRef.current = undefined;
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const nextStory = () => {
        if (currentIndex < stories.length - 1) {
            onStoryChange(currentIndex + 1);
        } else {
            onClose();
        }
    };

    const previousStory = () => {
        if (currentIndex > 0) {
            onStoryChange(currentIndex - 1);
        }
    };

    const markAsViewed = async (storyId: number) => {
        try {
            await fetch(`/api/stories/${storyId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
        } catch (error) {
            console.error('Error marking story as viewed:', error);
        }
    };

    const toggleLike = async () => {
        try {
            const response = await fetch(`/api/stories/${currentStory.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Update story state
                currentStory.is_liked = data.is_liked;
                currentStory.likes_count = data.likes_count;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await fetch(`/api/stories/${currentStory.id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ comment: newComment }),
            });

            if (response.ok) {
                setNewComment('');
                setShowComments(false);
                // TODO: Add comment to local state
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const shareStory = async () => {
        const shareUrl = `${window.location.origin}/stories/${currentStory.id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: currentStory.title,
                    text: `Mira este story técnico de @${currentStory.user.username}`,
                    url: shareUrl,
                });
            } catch (error) {
                console.error('Error sharing story:', error);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Enlace copiado al portapapeles');
        }
    };

    const forkStory = async () => {
        if (!currentStory.code_data) return;

        try {
            const response = await fetch(`/api/stories/${currentStory.id}/fork`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                alert(`¡Story forkeado! ID: ${data.fork_id}`);
            }
        } catch (error) {
            console.error('Error forking story:', error);
        }
    };

    const executeCode = async () => {
        if (!currentStory.can_execute || !currentStory.code_data) return;

        setIsExecuting(true);
        setCodeOutput('Ejecutando código...');

        try {
            const response = await fetch(`/api/stories/${currentStory.id}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    code: currentStory.code_data.code,
                    language: currentStory.programming_language,
                    input: currentStory.code_data.input || '',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCodeOutput(data.output || 'Sin salida');
            } else {
                const errorData = await response.json();
                setCodeOutput(`Error: ${errorData.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error executing code:', error);
            setCodeOutput('Error ejecutando el código');
        } finally {
            setIsExecuting(false);
        }
    };

    if (!currentStory) {
        return null;
    }

    const TypeIcon = storyTypeIcons[currentStory.type];
    const backgroundStyle = currentStory.background_color.startsWith('gradient-')
        ? getGradientStyle(currentStory.background_color)
        : { backgroundColor: currentStory.background_color };

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Background */}
            <div 
                className="absolute inset-0 blur-sm opacity-20"
                style={backgroundStyle}
            />

            {/* Main Content */}
            <div className="relative w-full max-w-lg mx-auto h-full flex flex-col">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
                    {stories.map((_, index) => (
                        <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div 
                                className={`h-full bg-white rounded-full transition-all duration-100 ${
                                    index === currentIndex ? '' : 
                                    index < currentIndex ? 'w-full' : 'w-0'
                                }`}
                                style={{
                                    width: index === currentIndex ? `${progress}%` : undefined
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-4 pt-8">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white/30">
                            <AvatarImage src={currentStory.user.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {currentStory.user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-white font-semibold">@{currentStory.user.username}</div>
                            <div className="text-white/70 text-sm flex items-center gap-2">
                                <TypeIcon className="h-3 w-3" />
                                {storyTypeLabels[currentStory.type]}
                                <span>•</span>
                                <span>{currentStory.remaining_time}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={togglePlay}
                            className="text-white hover:bg-white/20"
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onClose}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 pt-0 overflow-y-auto">
                    <div 
                        className="rounded-lg p-6 min-h-full"
                        style={backgroundStyle}
                    >
                        <h2 className="text-white text-xl font-bold mb-4">{currentStory.title}</h2>
                        
                        {currentStory.content && (
                            <p className="text-white/90 mb-4 leading-relaxed">
                                {currentStory.content}
                            </p>
                        )}

                        {/* Tags */}
                        {currentStory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {currentStory.tags.map((tag, index) => (
                                    <Badge key={index} className="bg-white/20 text-white border-white/30 text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Code Block */}
                        {currentStory.code_data && (
                            <div className="mb-6">
                                <div className="bg-black/50 rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between p-3 border-b border-white/20">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="h-4 w-4 text-blue-400" />
                                            <span className="text-white text-sm font-medium">
                                                {currentStory.programming_language}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => navigator.clipboard.writeText(currentStory.code_data!.code)}
                                                className="text-white/70 hover:text-white hover:bg-white/10 h-6 px-2"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            {currentStory.can_execute && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={executeCode}
                                                        disabled={isExecuting}
                                                        className="text-green-400 hover:text-green-300 hover:bg-white/10 h-6 px-2"
                                                    >
                                                        <Play className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={forkStory}
                                                        className="text-purple-400 hover:text-purple-300 hover:bg-white/10 h-6 px-2"
                                                    >
                                                        <GitFork className="h-3 w-3" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <SyntaxHighlighter
                                            language={currentStory.programming_language}
                                            style={vscDarkPlus}
                                            customStyle={{
                                                margin: 0,
                                                padding: 0,
                                                background: 'transparent',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {currentStory.code_data.code}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>

                                {/* Code Output */}
                                {codeOutput && (
                                    <div className="mt-3 bg-black/30 rounded-lg p-3">
                                        <div className="text-white/70 text-sm mb-1">Salida:</div>
                                        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                                            {codeOutput}
                                        </pre>
                                    </div>
                                )}

                                {/* Code Explanation */}
                                {currentStory.code_data.explanation && (
                                    <div className="mt-3 text-white/80 text-sm">
                                        <strong>Explicación:</strong> {currentStory.code_data.explanation}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Media */}
                        {currentStory.media_urls && currentStory.media_urls.length > 0 && (
                            <div className="mb-4">
                                {currentStory.media_urls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Media ${index + 1}`}
                                        className="w-full rounded-lg mb-2"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="relative z-10 p-4 pt-0">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={toggleLike}
                                className={`text-white hover:bg-white/20 ${
                                    currentStory.is_liked ? 'text-red-400' : ''
                                }`}
                            >
                                <Heart className={`h-5 w-5 mr-1 ${currentStory.is_liked ? 'fill-current' : ''}`} />
                                {currentStory.likes_count}
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowComments(!showComments)}
                                className="text-white hover:bg-white/20"
                            >
                                <MessageCircle className="h-5 w-5 mr-1" />
                                Comentar
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={shareStory}
                                className="text-white hover:bg-white/20"
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="text-white/60 text-sm">
                            {currentStory.views_count} vistas
                        </div>
                    </div>

                    {/* Comment Input */}
                    {showComments && (
                        <div className="mt-4 flex gap-2">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                onKeyPress={(e) => e.key === 'Enter' && addComment()}
                            />
                            <Button
                                size="sm"
                                onClick={addComment}
                                disabled={!newComment.trim()}
                                className="bg-blue-500/80 hover:bg-blue-500 text-white"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="absolute inset-y-0 left-0 w-1/3" onClick={previousStory} />
                <div className="absolute inset-y-0 right-0 w-1/3" onClick={nextStory} />
                
                {/* Navigation Arrows */}
                {currentIndex > 0 && (
                    <Button
                        onClick={previousStory}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none rounded-full w-10 h-10 p-0"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                )}
                
                {currentIndex < stories.length - 1 && (
                    <Button
                        onClick={nextStory}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none rounded-full w-10 h-10 p-0"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function getGradientStyle(gradientName: string): React.CSSProperties {
    const gradients = {
        'gradient-blue': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        'gradient-purple': {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        'gradient-green': {
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        'gradient-orange': {
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        },
        'gradient-dark': {
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
        },
    };

    return gradients[gradientName as keyof typeof gradients] || { backgroundColor: '#1a1a1a' };
}