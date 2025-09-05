import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    Upload,
    Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IntroManager from './IntroManager';
import DefaultIntro from './DefaultIntro';

interface CameraCaptureProps {
    onStreamReady?: (stream: MediaStream) => void;
    onStreamEnd?: () => void;
    isStreaming?: boolean;
    streamKey?: string;
    showIntroManager?: boolean;
}

interface MediaDeviceInfo {
    deviceId: string;
    label: string;
    kind: string;
}

export default function CameraCapture({ 
    onStreamReady, 
    onStreamEnd, 
    isStreaming = false,
    streamKey,
    showIntroManager = true
}: CameraCaptureProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const [screenShare, setScreenShare] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [selectedMic, setSelectedMic] = useState<string>('');
    const [introVideo, setIntroVideo] = useState<File | null>(null);
    const [showIntro, setShowIntro] = useState(false);
    const [error, setError] = useState<string>('');
    
    // Intro management
    const [introUrl, setIntroUrl] = useState<string | null>(null);
    const [introEnded, setIntroEnded] = useState(false);
    const [streamPhase, setStreamPhase] = useState<'setup' | 'intro' | 'live'>('setup');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLVideoElement>(null);
    const introRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const combinedStreamRef = useRef<MediaStream | null>(null);

    // Effect para manejar el cambio de fase del stream
    useEffect(() => {
        if (streamPhase === 'live' && combinedStreamRef.current && introEnded) {
            onStreamReady?.(combinedStreamRef.current);
        }
    }, [streamPhase, introEnded, onStreamReady]);

    // Obtener dispositivos disponibles
    useEffect(() => {
        const getDevices = async () => {
            try {
                const deviceList = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
                const audioDevices = deviceList.filter(device => device.kind === 'audioinput');
                
                setDevices([...videoDevices, ...audioDevices]);
                
                if (videoDevices.length > 0) {
                    setSelectedCamera(videoDevices[0].deviceId);
                }
                if (audioDevices.length > 0) {
                    setSelectedMic(audioDevices[0].deviceId);
                }
            } catch (err) {
                setError('Error al acceder a dispositivos de media');
            }
        };

        getDevices();
    }, []);

    // Handle intro ready
    const handleIntroReady = (url: string | null) => {
        setIntroUrl(url);
    };
    
    // Handle intro end
    const handleIntroEnd = () => {
        setIntroEnded(true);
        setStreamPhase('live');
    };
    
    // Función para iniciar streaming
    const startStreaming = async () => {
        try {
            setError('');
            
            // Combinar streams de cámara y pantalla si están disponibles
            const tracks: MediaStreamTrack[] = [];
            
            if (stream) {
                tracks.push(...stream.getTracks());
            }
            
            if (screenRef.current && screenRef.current.srcObject) {
                const screenStream = screenRef.current.srcObject as MediaStream;
                tracks.push(...screenStream.getTracks());
            }
            
            if (tracks.length === 0) {
                throw new Error('No hay streams disponibles para transmitir');
            }
            
            const combinedStream = new MediaStream(tracks);
            combinedStreamRef.current = combinedStream;
            
            // Verificar el stream combinado
            const combinedVideoTracks = combinedStream.getVideoTracks();
            const combinedAudioTracks = combinedStream.getAudioTracks();
            
            console.log('🎥 Stream combinado creado:');
            console.log('- Video tracks:', combinedVideoTracks.length, combinedVideoTracks.map(t => ({ id: t.id, enabled: t.enabled, readyState: t.readyState })));
            console.log('- Audio tracks:', combinedAudioTracks.length, combinedAudioTracks.map(t => ({ id: t.id, enabled: t.enabled, readyState: t.readyState })));
            
            if (combinedAudioTracks.length === 0) {
                console.error('❌ El stream combinado NO tiene audio');
            } else {
                console.log('✅ El stream combinado tiene audio');
            }
            
            // Si hay intro configurado, mostrar intro primero
            if (introUrl && !introEnded) {
                setStreamPhase('intro');
                // El stream real comenzará después del intro
            } else {
                setStreamPhase('live');
                onStreamReady?.(combinedStream);
            }
            
            setIsRecording(true);
            console.log('Streaming iniciado con key:', streamKey);
            console.log('Tracks disponibles:', tracks.map(t => t.kind));
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar streaming');
        }
    };

    // Iniciar captura de cámara y micrófono
    const startCapture = async () => {
        try {
            setError('');
            
            const constraints: MediaStreamConstraints = {
                video: cameraEnabled ? {
                    deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                } : false,
                audio: micEnabled ? {
                    deviceId: selectedMic ? { exact: selectedMic } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            
            setStream(mediaStream);
            
            // Verificar tracks de audio y video
            const videoTracks = mediaStream.getVideoTracks();
            const audioTracks = mediaStream.getAudioTracks();
            
            console.log('Cámara y micrófono iniciados correctamente');
            console.log('Video tracks:', videoTracks.length, videoTracks.map(t => ({ id: t.id, enabled: t.enabled, readyState: t.readyState })));
            console.log('Audio tracks:', audioTracks.length, audioTracks.map(t => ({ id: t.id, enabled: t.enabled, readyState: t.readyState })));
            
            if (audioTracks.length === 0) {
                console.warn('⚠️ No se detectaron tracks de audio en el MediaStream');
            }
            if (videoTracks.length === 0) {
                console.warn('⚠️ No se detectaron tracks de video en el MediaStream');
            }
            
        } catch (err) {
            setError('Error al acceder a cámara/micrófono: ' + (err as Error).message);
        }
    };

    // Detener streaming y captura
    const stopStreaming = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        
        if (screenShare) {
            stopScreenShare();
        }
        
        setIsRecording(false);
        setStreamPhase('setup');
        setIntroEnded(false);
        
        // Limpiar streams
        if (combinedStreamRef.current) {
            combinedStreamRef.current.getTracks().forEach(track => track.stop());
            combinedStreamRef.current = null;
        }
        
        if (onStreamEnd) {
            onStreamEnd();
        }
        
        console.log('Streaming detenido');
    };

    // Compartir pantalla
    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: true
            });
            
            if (screenRef.current) {
                screenRef.current.srcObject = screenStream;
            }
            
            setScreenShare(true);
            
            // Detectar cuando el usuario deja de compartir
            screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                setScreenShare(false);
            });
            
        } catch (err) {
            setError('Error al compartir pantalla: ' + (err as Error).message);
        }
    };

    const stopScreenShare = () => {
        if (screenRef.current && screenRef.current.srcObject) {
            const screenStream = screenRef.current.srcObject as MediaStream;
            screenStream.getTracks().forEach(track => track.stop());
            screenRef.current.srcObject = null;
        }
        setScreenShare(false);
    };

    // Manejar carga de intro
    const handleIntroUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validar duración máxima (20 minutos)
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                if (video.duration > 1200) { // 20 minutos = 1200 segundos
                    setError('El video intro no puede durar más de 20 minutos');
                    return;
                }
                
                setIntroVideo(file);
                setError('');
                
                if (introRef.current) {
                    introRef.current.src = URL.createObjectURL(file);
                }
            };
            
            video.src = URL.createObjectURL(file);
        }
    };

    // Reproducir intro
    const playIntro = () => {
        setShowIntro(true);
        if (introRef.current) {
            introRef.current.play();
        }
    };

    // Alternar cámara
    const toggleCamera = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !cameraEnabled;
            }
        }
        setCameraEnabled(!cameraEnabled);
    };

    // Alternar micrófono
    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !micEnabled;
            }
        }
        setMicEnabled(!micEnabled);
    };

    return (
        <div className="space-y-4">
            {/* Panel de Control */}
            <Card className="apple-liquid-card">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Control de Streaming</h3>
                        <div className="flex items-center gap-2">
                            {isRecording && (
                                <Badge variant="destructive" className="animate-pulse">
                                    🔴 EN VIVO
                                </Badge>
                            )}
                            {streamKey && (
                                <Badge variant="outline">
                                    Key: {streamKey.slice(-8)}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Controles principales */}
                    <div className="flex items-center gap-2 mb-4">
                        <Button 
                            onClick={startCapture}
                            disabled={isRecording || !!stream}
                            className="flex-1 apple-liquid-button"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            {stream ? 'Cámara Activa' : 'Iniciar Cámara'}
                        </Button>
                        
                        <Button 
                             onClick={isRecording ? stopStreaming : startStreaming}
                             className={`flex-1 apple-liquid-button ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                             disabled={!stream && !screenShare}
                         >
                            {isRecording ? (
                                <>
                                    <Square className="w-4 h-4 mr-2" />
                                    Detener Stream
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Iniciar Stream
                                </>
                            )}
                        </Button>
                        
                        <Button 
                            onClick={toggleCamera} 
                            variant={cameraEnabled ? "default" : "destructive"}
                            disabled={!isRecording}
                            className="apple-liquid-button"
                        >
                            {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                        </Button>
                        
                        <Button 
                            onClick={toggleMic} 
                            variant={micEnabled ? "default" : "destructive"}
                            disabled={!isRecording}
                            className="apple-liquid-button"
                        >
                            {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </Button>
                        
                        <Button 
                            onClick={screenShare ? stopScreenShare : startScreenShare}
                            variant={screenShare ? "default" : "outline"}
                            disabled={!isRecording}
                            className="apple-liquid-button"
                        >
                            {screenShare ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Configuración de dispositivos */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="camera-select">Cámara</Label>
                            <select 
                                id="camera-select"
                                value={selectedCamera} 
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                className="w-full p-2 border rounded"
                                disabled={isRecording}
                            >
                                {devices.filter(d => d.kind === 'videoinput').map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Cámara ${device.deviceId.slice(-4)}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <Label htmlFor="mic-select">Micrófono</Label>
                            <select 
                                id="mic-select"
                                value={selectedMic} 
                                onChange={(e) => setSelectedMic(e.target.value)}
                                className="w-full p-2 border rounded"
                                disabled={isRecording}
                            >
                                {devices.filter(d => d.kind === 'audioinput').map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Micrófono ${device.deviceId.slice(-4)}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Carga de intro */}
                    <div className="mb-4">
                        <Label htmlFor="intro-upload">Video Intro (Opcional - Máx 20 min)</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input 
                                ref={fileInputRef}
                                type="file" 
                                accept="video/mp4"
                                onChange={handleIntroUpload}
                                className="flex-1"
                            />
                            {introVideo && (
                                <Button onClick={playIntro} size="sm" className="apple-liquid-button">
                                    <Play className="w-4 h-4 mr-1" />
                                    Reproducir Intro
                                </Button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Intro Manager */}
            {showIntroManager && (
                <IntroManager 
                    onIntroReady={handleIntroReady}
                    streamPhase={streamPhase}
                    onIntroEnd={handleIntroEnd}
                />
            )}

            {/* Default Intro cuando no hay intro personalizado */}
            {streamPhase === 'intro' && !introUrl && (
                <DefaultIntro onEnd={handleIntroEnd} />
            )}

            {/* Vista previa de video */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cámara principal */}
                <Card className="apple-liquid-card">
                    <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Cámara Principal</h4>
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            <video 
                                ref={videoRef}
                                autoPlay 
                                muted 
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {!stream && (
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm opacity-75">Cámara desconectada</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pantalla compartida */}
                <Card className="apple-liquid-card">
                    <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Pantalla Compartida</h4>
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                            <video 
                                ref={screenRef}
                                autoPlay 
                                muted 
                                playsInline
                                className="w-full h-full object-contain"
                            />
                            {!screenShare && (
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm opacity-75">Sin compartir pantalla</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Video intro */}
            {showIntro && (
                <Card className="apple-liquid-card">
                    <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Video Intro</h4>
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            <video 
                                ref={introRef}
                                controls
                                playsInline
                                className="w-full h-full object-contain"
                                onEnded={() => setShowIntro(false)}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}