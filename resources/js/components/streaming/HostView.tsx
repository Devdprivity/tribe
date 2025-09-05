import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Camera, 
    CameraOff, 
    Mic, 
    MicOff, 
    Monitor, 
    MonitorOff,
    Settings,
    Play,
    Square,
    Users,
    MessageSquare,
    Video,
    Terminal,
    Code2
} from 'lucide-react';
import CameraCapture from './CameraCapture';
import CodeOSS from './CodeOSS';
import StreamSettingsModal from './StreamSettingsModal';

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

interface HostViewProps {
    stream: Stream;
    participants: Participant[];
    isStreaming: boolean;
    onStreamReady: (mediaStream: MediaStream) => void;
    onStreamEnd: () => void;
    onCodeChange: (fileId: string, content: string) => void;
    onTerminalCommand: (command: string, terminalId: string) => void;
    onParticipantPermissionChange: (participantId: string, canEdit: boolean) => void;
}

export default function HostView({
    stream,
    participants,
    isStreaming,
    onStreamReady,
    onStreamEnd,
    onCodeChange,
    onTerminalCommand,
    onParticipantPermissionChange
}: HostViewProps) {
    const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
    const [hostCameraStream, setHostCameraStream] = useState<MediaStream | null>(null);
    const [showCameraControls, setShowCameraControls] = useState(!isStreaming);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [volume, setVolume] = useState(100);

    // Check if this is a coding stream
    const isCodingStream = ['code_review', 'debugging', 'project_building', 'interview_prep'].includes(stream.stream_type);

    const handleStreamReady = async (mediaStream: MediaStream) => {
        console.log('🎬 HostView recibió MediaStream:');
        console.log('- Video tracks:', mediaStream.getVideoTracks().length);
        console.log('- Audio tracks:', mediaStream.getAudioTracks().length);
        
        const audioTracks = mediaStream.getAudioTracks();
        if (audioTracks.length === 0) {
            console.error('❌ HostView: El MediaStream NO tiene audio');
        } else {
            console.log('✅ HostView: El MediaStream tiene audio');
            audioTracks.forEach((track, index) => {
                console.log(`Audio track ${index}:`, { enabled: track.enabled, readyState: track.readyState, muted: track.muted });
            });
        }
        
        // Si es pantalla compartida, también necesitamos la cámara del anfitrión
        if (screenSharing) {
            setCurrentStream(mediaStream); // Pantalla compartida como stream principal
            
            // Crear stream separado para la cámara del anfitrión
            try {
                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        width: { ideal: 320 },
                        height: { ideal: 240 },
                        facingMode: 'user'
                    },
                    audio: false // No necesitamos audio de la cámara, ya lo tenemos del screen share
                });
                setHostCameraStream(cameraStream);
                console.log('📹 Host camera stream created for screen share');
            } catch (error) {
                console.error('Error creating host camera stream:', error);
            }
        } else {
            // Si es solo cámara, usar el mismo stream para ambos
            setCurrentStream(mediaStream);
            setHostCameraStream(mediaStream);
        }
        
        setShowCameraControls(false);
        onStreamReady(mediaStream);
    };

    // Función para iniciar la cámara del anfitrión
    const startHostCamera = async () => {
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 320 },
                    height: { ideal: 240 },
                    facingMode: 'user'
                },
                audio: false
            });
            setHostCameraStream(cameraStream);
            console.log('📹 Host camera started');
        } catch (error) {
            console.error('Error starting host camera:', error);
        }
    };

    const handleStreamEnd = () => {
        // Limpiar ambos streams
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        if (hostCameraStream) {
            hostCameraStream.getTracks().forEach(track => track.stop());
        }
        
        setCurrentStream(null);
        setHostCameraStream(null);
        setShowCameraControls(true);
        onStreamEnd();
    };

    const toggleCamera = () => {
        if (currentStream) {
            const videoTrack = currentStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !cameraEnabled;
                setCameraEnabled(!cameraEnabled);
            }
        }
    };

    const toggleMic = () => {
        if (currentStream) {
            const audioTrack = currentStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !micEnabled;
                setMicEnabled(!micEnabled);
            }
        }
    };

    const handleSettingsChange = {
        camera: async (enabled: boolean) => {
            console.log('🎥 Camera toggle:', enabled);
            setCameraEnabled(enabled);
            
            if (enabled) {
                if (screenSharing) {
                    // Si estamos compartiendo pantalla, solo iniciar la cámara del anfitrión
                    await startHostCamera();
                } else {
                    // Si no hay pantalla compartida, iniciar cámara como stream principal
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: { 
                                width: { ideal: 1280 },
                                height: { ideal: 720 },
                                facingMode: 'user'
                            },
                            audio: { 
                                echoCancellation: true,
                                noiseSuppression: true,
                                autoGainControl: true
                            }
                        });
                        console.log('🎥 Camera stream created:', {
                            videoTracks: stream.getVideoTracks().length,
                            audioTracks: stream.getAudioTracks().length
                        });
                        handleStreamReady(stream);
                    } catch (error) {
                        console.error('Error starting camera:', error);
                    }
                }
            } else {
                // Desactivar cámara
                if (hostCameraStream) {
                    hostCameraStream.getTracks().forEach(track => track.stop());
                    setHostCameraStream(null);
                }
                if (!screenSharing && currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                    setCurrentStream(null);
                    onStreamEnd();
                }
            }
        },
        mic: (enabled: boolean) => {
            setMicEnabled(enabled);
            if (currentStream) {
                const audioTrack = currentStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = enabled;
                }
            }
        },
        screen: async (enabled: boolean) => {
            console.log('🖥️ Screen sharing toggle:', enabled);
            setScreenSharing(enabled);
            
            if (enabled) {
                try {
                    // Solicitar captura de pantalla
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        },
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });
                    console.log('🖥️ Screen share stream created:', {
                        videoTracks: stream.getVideoTracks().length,
                        audioTracks: stream.getAudioTracks().length
                    });
                    
                    // Establecer pantalla compartida como stream principal
                    setCurrentStream(stream);
                    onStreamReady(stream);
                    
                    // Iniciar cámara del anfitrión para el círculo
                    await startHostCamera();
                    
                } catch (error) {
                    console.error('Error starting screen share:', error);
                    setScreenSharing(false);
                }
            } else {
                // Detener pantalla compartida
                if (currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                    setCurrentStream(null);
                }
                onStreamEnd();
            }
        },
        volume: (newVolume: number) => {
            setVolume(newVolume);
            if (currentStream) {
                const audioTrack = currentStream.getAudioTracks()[0];
                if (audioTrack) {
                    // Ajustar volumen del micrófono
                    const gainNode = (audioTrack as any).gainNode;
                    if (gainNode) {
                        gainNode.gain.value = newVolume / 100;
                    }
                }
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900">
            {/* Camera Setup Modal (Before Streaming) */}
            {showCameraControls && !isStreaming && (
                <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center">
                    <div className="max-w-6xl w-full p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Configurar Transmisión</h2>
                            <p className="text-white/70">Configura tu cámara, micrófono y pantalla antes de comenzar</p>
                            <Badge variant="outline" className="mt-2 text-blue-300 border-blue-400">
                                {stream.stream_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </div>
                        
                        <CameraCapture 
                            onStreamReady={handleStreamReady}
                            onStreamEnd={handleStreamEnd}
                            isStreaming={false}
                            streamKey={`stream_${stream.id}`}
                            showIntroManager={true}
                        />
                    </div>
                </div>
            )}

            {/* Main Host Interface (During Streaming) */}
            {isStreaming && (
                <>

                    {/* Stream Controls */}
                    <div className="absolute top-4 right-4 z-30 flex gap-2">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-1">
                            <Button
                                size="sm"
                                variant={cameraEnabled ? "default" : "destructive"}
                                onClick={toggleCamera}
                                className="h-8 w-8 p-0"
                            >
                                {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                            </Button>
                            
                            <Button
                                size="sm"
                                variant={micEnabled ? "default" : "destructive"}
                                onClick={toggleMic}
                                className="h-8 w-8 p-0"
                            >
                                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowSettingsModal(true)}
                                className="h-8 w-8 p-0 text-white border-white/20 hover:bg-white/10"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-white" />
                            <span className="text-white text-sm">{participants.length}</span>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col">
                        {isCodingStream ? (
                            /* Code Stream Layout */
                            <div className="flex-1 relative">
                                {/* Host Screen Share Preview (Small Corner) */}
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-64 h-36 bg-black rounded-lg border border-white/20 overflow-hidden shadow-xl">
                                    <div className="relative w-full h-full">
                                        {currentStream ? (
                                            <video 
                                                className="w-full h-full object-contain"
                                                autoPlay
                                                muted
                                                playsInline
                                                ref={(video) => {
                                                    if (video && currentStream) {
                                                        video.srcObject = currentStream;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/50">
                                                <Monitor className="w-8 h-8" />
                                            </div>
                                        )}
                                        
                                        {/* Host Camera Circle */}
                                        <div className="absolute bottom-1 right-1 w-12 h-12">
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/30 bg-black">
                                                {currentStream && (
                                                    <video 
                                                        className="w-full h-full object-cover"
                                                        autoPlay
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
                                        
                                        <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                                            Tu pantalla
                                        </div>
                                    </div>
                                </div>

                                {/* Code-OSS Interface */}
                                <CodeOSS 
                                    participants={participants}
                                    onCodeChange={onCodeChange}
                                    onTerminalCommand={onTerminalCommand}
                                    onParticipantPermissionChange={onParticipantPermissionChange}
                                    isHost={true}
                                    streamType={stream.stream_type as 'code_review' | 'debugging' | 'project_building' | 'interview_prep'}
                                />
                            </div>
                        ) : (
                            /* Regular Stream Layout */
                            <div className="flex-1 relative bg-black">
                                {currentStream ? (
                                    <div className="relative w-full h-full">
                                        {/* Main Video - Pantalla compartida o cámara principal */}
                                        <video 
                                            className="w-full h-full object-contain"
                                            autoPlay
                                            playsInline
                                            muted
                                            ref={(video) => {
                                                if (video && currentStream) {
                                                    video.srcObject = currentStream;
                                                }
                                            }}
                                        />
                                        
                                        {/* Host Camera Circle - Siempre visible cuando hay stream */}
                                        {(currentStream || hostCameraStream) && (
                                            <div className="absolute bottom-4 right-4 w-32 h-32 z-10">
                                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 bg-black shadow-lg">
                                                    {hostCameraStream ? (
                                                        <video 
                                                            className="w-full h-full object-cover"
                                                            autoPlay
                                                            playsInline
                                                            muted
                                                            ref={(video) => {
                                                                if (video && hostCameraStream) {
                                                                    video.srcObject = hostCameraStream;
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                            <div className="text-center text-white text-xs">
                                                                <div className="w-8 h-8 mx-auto mb-1 bg-gray-600 rounded-full flex items-center justify-center">
                                                                    <span className="text-lg">👤</span>
                                                                </div>
                                                                <div>Anfitrión</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Stream Info Overlay */}
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 z-10">
                                            <div className="flex items-center gap-2 text-white text-sm">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span>EN VIVO</span>
                                                <span className="text-gray-400">•</span>
                                                <span>{stream.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <div className="text-center">
                                            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg mb-4">No hay transmisión activa</p>
                                            <p className="text-sm text-gray-400">
                                                Usa el botón de configuración para iniciar la cámara o compartir pantalla
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Status Info */}
            {isStreaming && (
                <div className="absolute bottom-4 left-4 z-30">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 text-white text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Transmitiendo como anfitrión</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            <StreamSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                onCameraChange={handleSettingsChange.camera}
                onMicChange={handleSettingsChange.mic}
                onScreenChange={handleSettingsChange.screen}
                onVolumeChange={handleSettingsChange.volume}
                currentSettings={{
                    cameraEnabled: cameraEnabled,
                    micEnabled: micEnabled,
                    screenSharing: screenSharing,
                    volume: volume
                }}
            />
        </div>
    );
}