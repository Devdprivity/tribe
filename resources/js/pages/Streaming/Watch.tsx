import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Users, 
    MessageSquare, 
    Settings, 
    Code2, 
    Play, 
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Heart,
    Share2,
    DollarSign,
    Crown,
    Shield,
    Eye,
    Send,
    Smile,
    Square,
    Camera,
    Monitor,
    X
} from 'lucide-react';
import CollaborativeEditor from '@/components/streaming/CollaborativeEditor';
import StreamChat from '@/components/streaming/StreamChat';
import StreamParticipants from '@/components/streaming/StreamParticipants';
import TipModal from '@/components/streaming/TipModal';
import CameraCapture from '@/components/streaming/CameraCapture';
import IntegratedIDE from '@/components/streaming/IntegratedIDE';
import HostView from '@/components/streaming/HostView';
import ParticipantView from '@/components/streaming/ParticipantView';

interface Stream {
    id: number;
    title: string;
    description: string;
    category: string;
    stream_type: 'programming' | 'tutorial' | 'code_review' | 'debugging' | 'project_building' | 'interview_prep' | 'other';
    programming_language: string;
    tags: string[];
    status: string;
    current_viewers: number;
    peak_viewers: number;
    allow_code_collaboration: boolean;
    allow_chat: boolean;
    tips_enabled: boolean;
    min_tip_amount: number;
    tip_currency: string;
    playback_url: string;
    intro_video_url?: string;
    streamer: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
        bio?: string;
    };
    collaborative_session?: {
        id: number;
        session_id: string;
        language: string;
        theme: string;
        current_code: string[];
        is_active: boolean;
    };
    participants: Array<{
        id: number;
        role: string;
        can_edit_code: boolean;
        user: {
            id: number;
            username: string;
            full_name: string;
            avatar?: string;
        };
    }>;
}

interface Participant {
    id: number;
    role: string;
    can_edit_code: boolean;
    can_control_screen: boolean;
    user: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface WatchStreamProps {
    stream: Stream;
    participant?: Participant;
    can_collaborate: boolean;
    websocket_url?: string;
}

export default function WatchStream({ stream, participant, can_collaborate, websocket_url }: WatchStreamProps) {
    const { auth } = usePage().props as { auth?: { user: any } };
    const user = auth?.user;
    
    // Stream state
    const [viewerCount, setViewerCount] = useState(stream.current_viewers);
    const [isLiked, setIsLiked] = useState(false);
    const [showTipModal, setShowTipModal] = useState(false);
    const [isStreaming, setIsStreaming] = useState(stream.status === 'live');
    const [streamEnded, setStreamEnded] = useState(false);
    const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

    // Layout state
    const [showChatOverlay, setShowChatOverlay] = useState(false);
    const [showParticipantsOverlay, setShowParticipantsOverlay] = useState(false);
    const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'info'>('chat');
    
    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [usingFallback, setUsingFallback] = useState(false);
    const [isEndingStream, setIsEndingStream] = useState(false);
    
    // Video ref
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Streaming state
    const [showIntro, setShowIntro] = useState(false);
    const [introEnded, setIntroEnded] = useState(false);
    
    // IDE state for code streams
    const [showIDE, setShowIDE] = useState(
        stream.stream_type && ['code_review', 'debugging', 'project_building', 'interview_prep'].includes(stream.stream_type)
    );

    // WebSocket connection
    const wsRef = useRef<WebSocket | null>(null);
    
    // Check if current user is the streamer
    const isStreamer = user?.id === stream.streamer?.id || user?.id == stream.streamer?.id;
    const isModerator = participant?.role === 'moderator' || isStreamer;
    const canEditCode = participant?.can_edit_code || isStreamer;
    
    // Determine if IDE should be shown based on stream type
    const shouldShowIDE = stream.stream_type && ['code_review', 'debugging', 'project_building', 'interview_prep'].includes(stream.stream_type);
    
    // Convert participants to IDE format
    const ideParticipants = stream.participants.map(p => ({
        id: p.user.id.toString(),
        name: p.user.full_name || p.user.username,
        avatar: p.user.avatar || '/default-avatar.png',
        canEdit: p.can_edit_code,
        isActive: true // This would come from WebSocket in real implementation
    }));

    useEffect(() => {
        // Initialize video player
        if (videoRef.current) {
            const video = videoRef.current;
            
            if (stream.playback_url) {
                // Check if it's an HLS stream
                if (stream.playback_url.includes('.m3u8')) {
                    // For HLS streams, we would use hls.js in production
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream.playback_url;
                    } else {
                        // Fallback or use hls.js library
                        console.warn('HLS not supported, consider using hls.js');
                        video.src = stream.playback_url;
                    }
                } else {
                    // Direct video URL
                    video.src = stream.playback_url;
                }
            } else {
                // For development - use test video when no real stream
                console.log('No playback_url found, using test stream');
                video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
            }

            // Video event listeners
            video.addEventListener('loadstart', () => {
                console.log('Video load started');
                setVideoError(null);
            });
            
            video.addEventListener('canplay', () => {
                console.log('Video can play');
                setVideoError(null);
            });
            
            video.addEventListener('error', (e) => {
                console.error('Video error:', e);
                const error = e as any;
                
                // Handle different types of video errors
                if (stream.playback_url && stream.playback_url.includes('.m3u8') && !usingFallback) {
                    console.log('HLS stream failed, switching to fallback video');
                    setVideoError('Streaming server unavailable, using test video');
                    setUsingFallback(true);
                    video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                } else {
                    setVideoError('Video playback error');
                }
            });
        }

        // Initialize WebSocket connection
        if (websocket_url && participant) {
            connectWebSocket();
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const connectWebSocket = () => {
        if (!websocket_url || !participant) return;

        const ws = new WebSocket(`${websocket_url}/stream/${stream.id}`);
        
        ws.onopen = () => {
            console.log('Connected to stream WebSocket');
            ws.send(JSON.stringify({
                type: 'join',
                user_id: user?.id,
                stream_id: stream.id
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        ws.onclose = () => {
            console.log('Disconnected from stream WebSocket');
            // Reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
    };

    const handleWebSocketMessage = (data: any) => {
        switch (data.type) {
            case 'viewer_update':
                setViewerCount(data.count);
                break;
            case 'stream_ended':
                setStreamEnded(true);
                // Redirigir a la página principal después de 5 segundos
                setTimeout(() => {
                    window.location.href = '/streaming';
                }, 5000);
                break;
            case 'user_promoted':
                // Handle role changes
                break;
            default:
                console.log('Unhandled WebSocket message:', data);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleLike = async () => {
        try {
            const response = await fetch(`/api/streams/${stream.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                setIsLiked(!isLiked);
            }
        } catch (error) {
            console.error('Error liking stream:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: stream.title,
                    text: `Mira este stream en vivo: ${stream.title}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles');
        }
    };

    const handleEndStream = async () => {
        if (!confirm('¿Estás seguro que quieres terminar el stream? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsEndingStream(true);
        
        try {
            const response = await fetch(`/streaming/${stream.id}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setStreamEnded(true);
                
                // Notificar a través de WebSocket que el stream terminó
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        type: 'stream_ended',
                        stream_id: stream.id,
                        user_id: user?.id
                    }));
                }

                // Redirigir al timeline después de 3 segundos
                setTimeout(() => {
                    window.location.href = '/timeline';
                }, 3000);
            } else {
                alert(data.error || 'Error al terminar el stream');
            }
        } catch (error) {
            console.error('Error ending stream:', error);
            alert('Error al terminar el stream. Por favor, inténtalo de nuevo.');
        } finally {
            setIsEndingStream(false);
        }
    };

    // Handle stream ready
    const handleStreamReady = (mediaStream: MediaStream) => {
        setCurrentStream(mediaStream);
        setIsStreaming(true);
        
        // If there's an intro video, show it first
        if (stream.intro_video_url && !introEnded) {
            setShowIntro(true);
        }
    };

    // Handle stream end
    const handleStreamEnd = () => {
        setCurrentStream(null);
        setIsStreaming(false);
    };

    // Handle code changes in IDE
    const handleCodeChange = (fileId: string, content: string) => {
        // Send code changes via WebSocket
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({
                type: 'code_change',
                fileId,
                content,
                userId: user?.id
            }));
        }
    };

    // Handle terminal commands
    const handleTerminalCommand = (command: string, terminalId: string) => {
        // Send terminal command via WebSocket
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({
                type: 'terminal_command',
                command,
                terminalId,
                userId: user?.id
            }));
        }
    };

    // Handle participant permission changes
    const handleParticipantPermissionChange = (participantId: string, canEdit: boolean) => {
        if (wsRef.current && isModerator) {
            wsRef.current.send(JSON.stringify({
                type: 'permission_change',
                participantId,
                canEdit,
                streamId: stream.id
            }));
        }
    };

    return (
        <>
            <Head title={`${stream.title} - Streaming`} />
            
            <div className="min-h-screen bg-black">
                <div className="flex flex-col h-screen relative">
                    {/* Stream Header - Integrated Layout with Center Island */}
                    <div className="relative p-4 z-10">
                        <div className="flex items-center justify-between">
                            {/* Left Side - Avatar, Name, Badge */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={stream.streamer.avatar} />
                                    <AvatarFallback>
                                        {stream.streamer.full_name?.charAt(0) || stream.streamer.username.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-lg font-bold text-white">SSS</span>
                                <span className="text-sm text-white/70">{stream.streamer.full_name || stream.streamer.username}</span>
                                <Badge variant="outline" className="text-white border-white/20">
                                    {stream.stream_type ? stream.stream_type.replace(/_/g, ' ').toUpperCase() : 'STREAM'}
                                </Badge>
                            </div>
                            
                            {/* Center - Floating Controls Island */}
                            <div className="px-6 py-3">
                            <div className="flex items-center gap-6">
                                {/* Left Side - Stream Status */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                        <span className="text-white text-sm font-medium">
                                            {isStreaming ? 'EN VIVO' : 'OFFLINE'}
                                        </span>
                                    </div>
                                    <div className="w-px h-4 bg-white/20"></div>
                                    <div className="flex items-center gap-1 text-white/70 text-sm">
                                        <Eye className="h-4 w-4" />
                                        <span>{viewerCount}</span>
                                    </div>
                                </div>
                                
                                {/* Center - Action Buttons */}
                                <div className="flex items-center gap-2">
                                    {isStreamer && isStreaming && (
                                        <Button
                                            size="sm"
                                            onClick={handleEndStream}
                                            disabled={isEndingStream}
                                            className="bg-red-500/80 hover:bg-red-500 text-white rounded-full px-4 py-2 transition-all duration-200 hover:scale-105"
                                        >
                                            <Square className="h-4 w-4 mr-2" />
                                            {isEndingStream ? 'Terminando...' : 'Terminar'}
                                        </Button>
                                    )}
                                    
                                    {!isStreamer && stream.tips_enabled && (
                                        <Button
                                            size="sm"
                                            onClick={() => setShowTipModal(true)}
                                            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded-full px-4 py-2 transition-all duration-200 hover:scale-105"
                                        >
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Tip
                                        </Button>
                                    )}
                                    
                                    {!isStreamer && (
                                        <Button
                                            size="sm"
                                            onClick={handleLike}
                                            className={`rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 ${
                                                isLiked 
                                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                            }`}
                                        >
                                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                        </Button>
                                    )}
                                    
                                    <Button
                                        size="sm"
                                        onClick={handleShare}
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-4 py-2 transition-all duration-200 hover:scale-105"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                {/* Right Side - Additional Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-px h-4 bg-white/20"></div>
                                    <div className="text-white/50 text-xs">
                                        {stream.stream_type ? stream.stream_type.replace(/_/g, ' ').toUpperCase() : 'STREAM'}
                                    </div>
                                </div>
                            </div>
                            </div>
                            
                            {/* Right Side - Chat and Participants */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setShowChatOverlay(!showChatOverlay);
                                        setShowParticipantsOverlay(false);
                                    }}
                                    className={`apple-liquid-button ${showChatOverlay ? 'bg-blue-600' : 'bg-white/10'} hover:bg-blue-700 text-white`}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setShowParticipantsOverlay(!showParticipantsOverlay);
                                        setShowChatOverlay(false);
                                    }}
                                    className={`apple-liquid-button ${showParticipantsOverlay ? 'bg-blue-600' : 'bg-white/10'} hover:bg-blue-700 text-white`}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    {stream.participants.length}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - New Component Based Layout */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-black relative">
                        
                        {isStreamer ? (
                            /* Host View */
                            <HostView 
                                stream={stream}
                                participants={ideParticipants}
                                isStreaming={isStreaming}
                                onStreamReady={handleStreamReady}
                                onStreamEnd={handleStreamEnd}
                                onCodeChange={handleCodeChange}
                                onTerminalCommand={handleTerminalCommand}
                                onParticipantPermissionChange={handleParticipantPermissionChange}
                            />
                        ) : (
                            /* Participant View */
                            <ParticipantView 
                                stream={stream}
                                participants={ideParticipants}
                                currentStream={currentStream}
                                isStreaming={isStreaming}
                                onCodeChange={handleCodeChange}
                                onTerminalCommand={handleTerminalCommand}
                                canEditCode={canEditCode}
                                currentParticipant={participant ? {
                                    id: participant.user.id.toString(),
                                    name: participant.user.full_name || participant.user.username,
                                    avatar: participant.user.avatar || '/default-avatar.png',
                                    canEdit: participant.can_edit_code,
                                    isActive: true
                                } : undefined}
                            />
                        )}
                        

                        {/* Chat Overlay */}
                        {showChatOverlay && (
                            <div className="absolute top-16 right-4 w-80 h-96 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden z-50">
                                <div className="flex items-center justify-between p-3 border-b border-white/20">
                                    <h3 className="text-white font-medium">Chat en vivo</h3>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => setShowChatOverlay(false)}
                                        className="text-white hover:bg-white/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="h-full">
                                    <StreamChat
                                        streamId={stream.id}
                                        canChat={stream.allow_chat && !!participant}
                                        websocketUrl={websocket_url}
                                        participant={participant}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Participants Overlay */}
                        {showParticipantsOverlay && (
                            <div className="absolute top-16 right-4 w-80 h-96 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden z-50">
                                <div className="flex items-center justify-between p-3 border-b border-white/20">
                                    <h3 className="text-white font-medium">Participantes ({stream.participants.length})</h3>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => setShowParticipantsOverlay(false)}
                                        className="text-white hover:bg-white/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="h-full">
                                    <StreamParticipants
                                        streamId={stream.id}
                                        participants={stream.participants}
                                        currentUser={participant}
                                        canModerate={isModerator}
                                        websocketUrl={websocket_url}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Stream Ended Overlay */}
                        {streamEnded && (
                            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-60">
                                <div className="text-center text-white">
                                    <Square className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-2xl font-bold mb-2">Stream Terminado</h3>
                                    <p className="text-white/70">¡Gracias por participar!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Intro Video Modal */}
                    {showIntro && stream.intro_video_url && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                <video 
                                    className="w-full h-full object-contain"
                                    autoPlay
                                    onEnded={() => {
                                        setShowIntro(false);
                                        setIntroEnded(true);
                                    }}
                                    src={stream.intro_video_url}
                                />
                                <button 
                                    onClick={() => {
                                        setShowIntro(false);
                                        setIntroEnded(true);
                                    }}
                                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tip Modal */}
                    {showTipModal && (
                        <TipModal
                            isOpen={showTipModal}
                            onClose={() => setShowTipModal(false)}
                            streamer={stream.streamer}
                            streamId={stream.id}
                        />
                    )}
                </div>
            </div>
        </>
    );
}