import React, { useState, useRef, useEffect } from 'react';
// Dialog components removed - using custom modal
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    X, 
    Upload, 
    Image as ImageIcon, 
    Video, 
    Clock,
    Send,
    Camera,
    Square,
    Play
} from 'lucide-react';
import { apiRequest } from '@/utils/csrf';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onStoryCreated?: () => void;
}

export default function CreateStoryModal({ 
    isOpen, 
    onClose, 
    currentUser, 
    onStoryCreated 
}: CreateStoryModalProps) {

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [isLoadingCamera, setIsLoadingCamera] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Limpiar cámara al desmontar
    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaStream]);

    // Manejar el video de la cámara
    useEffect(() => {
        if (mediaStream && videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(console.error);
        }
    }, [mediaStream]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('Selected file:', file);
            console.log('File size:', file.size);
            console.log('File type:', file.type);
            
            // Validar que el archivo no esté vacío
            if (file.size === 0) {
                alert('Error: El archivo seleccionado está vacío. Por favor, selecciona un archivo válido.');
                event.target.value = ''; // Limpiar el input
                return;
            }
            
            // Validar tamaño máximo (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Error: El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
                event.target.value = ''; // Limpiar el input
                return;
            }
            
            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/mov', 'video/avi', 'video/webm'];
            if (!allowedTypes.includes(file.type)) {
                alert('Error: Tipo de archivo no permitido. Formatos válidos: JPEG, PNG, JPG, GIF, MP4, MOV, AVI, WEBM.');
                event.target.value = ''; // Limpiar el input
                return;
            }
            
            setSelectedFile(file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || isUploading) {
            if (!selectedFile) {
                alert('Por favor, selecciona un archivo antes de continuar.');
            }
            return;
        }

        // Validación adicional antes del envío
        if (selectedFile.size === 0) {
            alert('Error: El archivo seleccionado está vacío. Por favor, selecciona un archivo válido.');
            return;
        }

        setIsUploading(true);

        try {
            console.log('Uploading file:', selectedFile.name, selectedFile.size, 'bytes');
            console.log('Selected file:', selectedFile);
            console.log('File size:', selectedFile.size);
            console.log('File type:', selectedFile.type);
            
            const formData = new FormData();
            formData.append('media', selectedFile);
            if (caption.trim()) {
                formData.append('caption', caption.trim());
            }
            
            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await fetch('/stories', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Expected JSON but received:', text.substring(0, 200));
                throw new Error('El servidor devolvió una respuesta inválida. Por favor, intenta de nuevo.');
            }
            
            const data = await response.json();
            
            if (data.success) {
                console.log('Story created successfully:', data.story);
                alert('¡Historia publicada exitosamente!');
                
                // Reset form
                setSelectedFile(null);
                setPreview(null);
                setCaption('');
                
                // Close modal and refresh stories
                onClose();
                onStoryCreated?.();
            } else {
                console.error('Error creating story:', data.error);
                alert(`Error: ${data.error || 'No se pudo crear la historia. Intenta de nuevo.'}`);
            }
        } catch (error) {
            console.error('Error creating story:', error);
            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            } else {
                alert('Error inesperado al crear la historia. Por favor, intenta de nuevo.');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        setCaption('');
        stopCamera();
        onClose();
    };

    const startCamera = async () => {
        setIsLoadingCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }, 
                audio: true 
            });
            setMediaStream(stream);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('No se pudo acceder a la cámara. Verifica los permisos.');
        } finally {
            setIsLoadingCamera(false);
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
        setIsRecording(false);
        setRecordedChunks([]);
    };

    const startRecording = () => {
        if (!mediaStream) return;

        // Limpiar chunks anteriores
        setRecordedChunks([]);

        // Verificar compatibilidad de codec
        let mimeType = 'video/webm';
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
        }
        
        console.log('Using MIME type:', mimeType);

        // Array local para almacenar chunks durante la grabación
        const recordingChunks: Blob[] = [];

        const mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: mimeType
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            console.log('Data available:', event.data.size, 'bytes');
            if (event.data.size > 0) {
                recordingChunks.push(event.data);
                console.log('Total chunks now:', recordingChunks.length);
                // También actualizar el estado para UI
                setRecordedChunks(prev => [...prev, event.data]);
            }
        };

        mediaRecorder.onstop = () => {
            console.log('Recording stopped, processing chunks...');
            console.log('Final chunks count:', recordingChunks.length);
            
            if (recordingChunks.length === 0) {
                console.error('No data recorded');
                alert('Error: No se pudo grabar el video. Intenta de nuevo.');
                return;
            }
            
            const blob = new Blob(recordingChunks, { type: mimeType });
            console.log('Final blob size:', blob.size, 'bytes');
            
            if (blob.size === 0) {
                console.error('Recorded blob is empty');
                alert('Error: El video grabado está vacío. Intenta de nuevo.');
                return;
            }
            
            const file = new File([blob], `recording-${Date.now()}.webm`, { 
                type: mimeType,
                lastModified: Date.now()
            });
            
            console.log('Created file:', file.name, file.size, 'bytes');
            setSelectedFile(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(blob);
            
            stopCamera();
        };

        mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            alert('Error durante la grabación. Intenta de nuevo.');
        };

        mediaRecorder.onstart = () => {
            console.log('Recording started successfully');
        };

        // Iniciar grabación - usar timeslice más grande para asegurar datos
        mediaRecorder.start(1000); // Capturar datos cada segundo
        setIsRecording(true);
        console.log('Starting recording with MIME type:', mimeType);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            console.log('Stopping recording...');
            setIsRecording(false);
            mediaRecorderRef.current.stop();
        }
    };

    const isVideo = selectedFile?.type.startsWith('video/');
    const fileSize = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(1) : 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
            <div className="apple-liquid-card border border-white/20 max-w-md mx-4 w-full relative z-50" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 relative z-50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-white text-xl font-bold">Crear Historia</h2>
                    </div>
                    <p className="text-white/70 text-sm mb-6">
                        Comparte una imagen o video que será visible por 24 horas
                    </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Usuario actual */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                {currentUser.full_name?.charAt(0) || currentUser.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-white font-medium">{currentUser.full_name}</p>
                            <p className="text-white/70 text-sm">@{currentUser.username}</p>
                        </div>
                    </div>

                    {/* Selección de archivo o cámara */}
                    {!selectedFile && !mediaStream ? (
                        <div className="space-y-3">
                            <Label className="text-white">Seleccionar o grabar contenido</Label>
                            
                            {/* Opciones de selección */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Subir archivo */}
                                <div 
                                    className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-white/50 transition-colors relative z-50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8 text-white/50 mx-auto mb-2" />
                                    <p className="text-white/70 text-sm mb-1">Subir archivo</p>
                                    <p className="text-white/50 text-xs">JPG, PNG, MP4</p>
                                </div>

                                {/* Usar cámara */}
                                <div 
                                    className={`border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-white/50 transition-colors relative z-50 ${isLoadingCamera ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={isLoadingCamera ? undefined : startCamera}
                                >
                                    <Camera className="h-8 w-8 text-white/50 mx-auto mb-2" />
                                    <p className="text-white/70 text-sm mb-1">Usar cámara</p>
                                    <p className="text-white/50 text-xs">Grabar video</p>
                                </div>
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    ) : isLoadingCamera ? (
                        /* Cargando cámara */
                        <div className="space-y-3">
                            <Label className="text-white">Accediendo a la cámara...</Label>
                            <div className="w-full h-48 bg-black/50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-white/70 text-sm">Cargando cámara...</p>
                                </div>
                            </div>
                        </div>
                    ) : mediaStream ? (
                        /* Interfaz de cámara */
                        <div className="space-y-3">
                            <Label className="text-white">Grabar video</Label>
                            
                            {/* Video de la cámara */}
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-48 object-cover rounded-lg bg-black"
                                    style={{ transform: 'scaleX(-1)' }} // Espejo para que se vea natural
                                />
                                
                                {/* Controles de grabación */}
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                                    {!isRecording ? (
                                        <Button
                                            type="button"
                                            onClick={startRecording}
                                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 p-0 z-50"
                                        >
                                            <Play className="h-6 w-6" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={stopRecording}
                                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 p-0 z-50"
                                        >
                                            <Square className="h-6 w-6" />
                                        </Button>
                                    )}
                                </div>
                                
                                {/* Botón para cancelar cámara */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0 z-50"
                                    onClick={stopCamera}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Estado de grabación */}
                            {isRecording && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-red-400 text-sm">Grabando...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Preview de archivo seleccionado */
                        <div className="space-y-3">
                            {/* Preview */}
                            <div className="relative">
                                {isVideo ? (
                                    <video
                                        src={preview || undefined}
                                        className="w-full h-48 object-cover rounded-lg"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={preview || undefined}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                )}
                                
                                {/* Botón para cambiar archivo */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0 z-50"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Información del archivo */}
                            <div className="flex items-center gap-2 text-sm">
                                {isVideo ? (
                                    <Video className="h-4 w-4 text-blue-400" />
                                ) : (
                                    <ImageIcon className="h-4 w-4 text-green-400" />
                                )}
                                <span className="text-white/70">
                                    {selectedFile.name} ({fileSize}MB)
                                </span>
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <Label className="text-white">Descripción (opcional)</Label>
                                <Textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Agrega una descripción a tu historia..."
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 apple-liquid-input"
                                    maxLength={200}
                                    rows={3}
                                />
                                <p className="text-white/50 text-xs text-right">
                                    {caption.length}/200
                                </p>
                            </div>

                            {/* Información de duración */}
                            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                                <Clock className="h-4 w-4 text-blue-400" />
                                <span className="text-blue-400 text-sm">
                                    Tu historia será visible por 24 horas
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex items-center gap-3 pt-4 relative z-50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 relative z-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={(!selectedFile && !mediaStream) || isUploading || isRecording}
                            className="flex-1 bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button relative z-50"
                        >
                            {isUploading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Subiendo...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    Publicar
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}
