import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Monitor, 
    Users,
    MessageSquare,
    Hand,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Settings,
    Maximize2,
    Code2,
    Terminal,
    Eye,
    X
} from 'lucide-react';
import CodeOSS from './CodeOSS';

interface Stream {
    id: number;
    title: string;
    stream_type: string;
    streamer: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface Participant {
    id: string;
    name: string;
    avatar: string;
    canEdit: boolean;
    isActive: boolean;
}

interface ParticipantViewProps {
    stream: Stream;
    participants: Participant[];
    currentStream?: MediaStream | null;
    isStreaming: boolean;
    onCodeChange: (fileId: string, content: string) => void;
    onTerminalCommand: (command: string, terminalId: string) => void;
    canEditCode: boolean;
    currentParticipant?: Participant;
}

export default function ParticipantView({
    stream,
    participants,
    currentStream,
    isStreaming,
    onCodeChange,
    onTerminalCommand,
    canEditCode,
    currentParticipant
}: ParticipantViewProps) {
    const [showVideoFullscreen, setShowVideoFullscreen] = useState(false);
    const [raiseHand, setRaiseHand] = useState(false);
    const [participantMicEnabled, setParticipantMicEnabled] = useState(false);
    const [participantCameraEnabled, setParticipantCameraEnabled] = useState(false);

    // Check if this is a coding stream
    const isCodingStream = ['code_review', 'debugging', 'project_building', 'interview_prep'].includes(stream.stream_type);

    const handleRaiseHand = () => {
        setRaiseHand(!raiseHand);
        // Would send WebSocket message to host
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 relative">
            {/* Waiting State */}
            {!isStreaming && (
                <div className="flex-1 flex items-center justify-center bg-black">
                    <div className="text-center text-white">
                        <Monitor className="w-20 h-20 mx-auto mb-6 opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">Esperando al anfitrión...</h2>
                        <p className="text-white/70 mb-4">El anfitrión está configurando la transmisión</p>
                        <Badge variant="outline" className="text-blue-300 border-blue-400">
                            {stream.stream_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Active Stream State */}
            {isStreaming && (
                <>
                    {/* Participant Controls */}
                    <div className="absolute top-4 right-4 z-30 flex gap-2">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-1">
                            <Button
                                size="sm"
                                variant={raiseHand ? "default" : "outline"}
                                onClick={handleRaiseHand}
                                className={`h-8 w-8 p-0 ${raiseHand ? 'bg-yellow-600 hover:bg-yellow-700' : 'text-white border-white/20 hover:bg-white/10'}`}
                            >
                                <Hand className="w-4 h-4" />
                            </Button>
                            
                            <Button
                                size="sm"
                                variant={participantMicEnabled ? "default" : "outline"}
                                onClick={() => setParticipantMicEnabled(!participantMicEnabled)}
                                className="h-8 w-8 p-0 text-white border-white/20 hover:bg-white/10"
                            >
                                {participantMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </Button>

                            <Button
                                size="sm"
                                variant={participantCameraEnabled ? "default" : "outline"}
                                onClick={() => setParticipantCameraEnabled(!participantCameraEnabled)}
                                className="h-8 w-8 p-0 text-white border-white/20 hover:bg-white/10"
                            >
                                {participantCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                            </Button>
                        </div>
                        
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-white" />
                            <span className="text-white text-sm">Participante</span>
                        </div>
                    </div>

                    {/* Stream Info */}
                    <div className="absolute top-4 left-4 z-30">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                            <Badge variant="destructive" className="animate-pulse">
                                🔴 EN VIVO
                            </Badge>
                            <span className="text-white text-sm font-medium">{stream.title}</span>
                            <span className="text-white/70 text-sm">por {stream.streamer.full_name || stream.streamer.username}</span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {isCodingStream ? (
                            /* Coding Stream Layout */
                            <div className="flex-1 relative">
                                {/* Host Video - Bottom Right Corner */}
                                <div className="absolute bottom-4 right-4 w-80 h-48 bg-black rounded-lg border border-white/20 overflow-hidden shadow-xl z-20">
                                    <div className="relative w-full h-full">
                                        {currentStream ? (
                                            <video 
                                                className="w-full h-full object-contain cursor-pointer"
                                                autoPlay
                                                playsInline
                                                onClick={() => setShowVideoFullscreen(true)}
                                                ref={(video) => {
                                                    if (video && currentStream) {
                                                        video.srcObject = currentStream;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/50">
                                                <div className="text-center">
                                                    <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">Sin pantalla compartida</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Host Camera Circle */}
                                        <div className="absolute bottom-2 right-2 w-16 h-16">
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/30 bg-black">
                                                {currentStream && (
                                                    <video 
                                                        className="w-full h-full object-cover"
                                                        autoPlay
                                                        muted
                                                        playsInline
                                                        ref={(video) => {
                                                            if (video && currentStream) {
                                                                video.srcObject = currentStream;
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                            🔴 {stream.streamer.full_name || stream.streamer.username}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 h-6 w-6 p-0 text-white hover:bg-white/20"
                                            onClick={() => setShowVideoFullscreen(true)}
                                        >
                                            <Maximize2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Code-OSS Interface */}
                                <CodeOSS 
                                    participants={participants}
                                    onCodeChange={onCodeChange}
                                    onTerminalCommand={onTerminalCommand}
                                    isHost={false}
                                    streamType={stream.stream_type as 'code_review' | 'debugging' | 'project_building' | 'interview_prep'}
                                />
                            </div>
                        ) : (
                            /* Regular Stream Layout */
                            <div className="flex-1 relative bg-black">
                                {currentStream ? (
                                    <video 
                                        className="w-full h-full object-contain"
                                        autoPlay
                                        playsInline
                                        ref={(video) => {
                                            if (video && currentStream) {
                                                video.srcObject = currentStream;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <div className="text-center">
                                            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg">Esperando transmisión...</p>
                                            <p className="text-sm opacity-75">El anfitrión está preparando el contenido</p>
                                        </div>
                                    </div>
                                )}

                                {/* Host Camera Circle */}
                                {currentStream && (
                                    <div className="absolute bottom-4 right-4 w-32 h-32">
                                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 bg-black">
                                            <video 
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                muted
                                                playsInline
                                                ref={(video) => {
                                                    if (video && currentStream) {
                                                        video.srcObject = currentStream;
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fullscreen Video Modal */}
                    {showVideoFullscreen && (
                        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                {currentStream && (
                                    <video 
                                        className="w-full h-full object-contain"
                                        autoPlay
                                        playsInline
                                        ref={(video) => {
                                            if (video && currentStream) {
                                                video.srcObject = currentStream;
                                            }
                                        }}
                                    />
                                )}
                                
                                {/* Host Camera Circle in Fullscreen */}
                                {currentStream && (
                                    <div className="absolute bottom-8 right-8 w-48 h-48">
                                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 bg-black">
                                            <video 
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                muted
                                                playsInline
                                                ref={(video) => {
                                                    if (video && currentStream) {
                                                        video.srcObject = currentStream;
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                                    onClick={() => setShowVideoFullscreen(false)}
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Participation Status */}
                    <div className="absolute bottom-4 left-4 z-30">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 text-white text-sm">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Conectado</span>
                            </div>
                            {canEditCode && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Code2 className="w-3 h-3" />
                                        <span>Puede editar código</span>
                                    </div>
                                </>
                            )}
                            {raiseHand && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Hand className="w-3 h-3" />
                                        <span>Mano levantada</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}