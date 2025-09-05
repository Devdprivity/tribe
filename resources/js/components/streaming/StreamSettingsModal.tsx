import React, { useState, useEffect } from 'react';
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
    X,
    Check,
    Volume2,
    VolumeX,
    Video,
    VideoOff
} from 'lucide-react';

interface StreamSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCameraChange: (enabled: boolean) => void;
    onMicChange: (enabled: boolean) => void;
    onScreenChange: (enabled: boolean) => void;
    onVolumeChange: (volume: number) => void;
    currentSettings: {
        cameraEnabled: boolean;
        micEnabled: boolean;
        screenSharing: boolean;
        volume: number;
    };
}

export default function StreamSettingsModal({
    isOpen,
    onClose,
    onCameraChange,
    onMicChange,
    onScreenChange,
    onVolumeChange,
    currentSettings
}: StreamSettingsModalProps) {
    const [settings, setSettings] = useState(currentSettings);
    const [availableDevices, setAvailableDevices] = useState<{
        cameras: MediaDeviceInfo[];
        microphones: MediaDeviceInfo[];
        screens: any[];
    }>({
        cameras: [],
        microphones: [],
        screens: []
    });
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
    const [selectedScreen, setSelectedScreen] = useState<string>('');
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadDevices();
        }
    }, [isOpen]);

    const loadDevices = async () => {
        setIsLoadingDevices(true);
        try {
            // Solicitar permisos primero para obtener nombres de dispositivos
            const tempStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // Detener el stream temporal
            tempStream.getTracks().forEach(track => track.stop());
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            const microphones = devices.filter(device => device.kind === 'audioinput');
            
            // Obtener pantallas disponibles
            const screens = await getAvailableScreens();
            
            setAvailableDevices({ 
                cameras, 
                microphones, 
                screens 
            });
            
            // Seleccionar el primer dispositivo por defecto
            if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
            if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId);
            if (screens.length > 0) setSelectedScreen(screens[0].id);
            
            console.log('Dispositivos cargados:', { cameras: cameras.length, microphones: microphones.length, screens: screens.length });
            
        } catch (error) {
            console.error('Error loading devices:', error);
        } finally {
            setIsLoadingDevices(false);
        }
    };

    const getAvailableScreens = async () => {
        try {
            const sources = await (window as any).electron?.desktopCapturer?.getSources({
                types: ['screen', 'window']
            });
            return sources || [];
        } catch (error) {
            console.error('Error getting screens:', error);
            return [];
        }
    };

    const handleCameraToggle = () => {
        const newValue = !settings.cameraEnabled;
        setSettings(prev => ({ ...prev, cameraEnabled: newValue }));
        onCameraChange(newValue);
    };

    const handleMicToggle = () => {
        const newValue = !settings.micEnabled;
        setSettings(prev => ({ ...prev, micEnabled: newValue }));
        onMicChange(newValue);
    };

    const handleScreenToggle = () => {
        const newValue = !settings.screenSharing;
        setSettings(prev => ({ ...prev, screenSharing: newValue }));
        onScreenChange(newValue);
    };

    const handleVolumeChange = (volume: number) => {
        setSettings(prev => ({ ...prev, volume }));
        onVolumeChange(volume);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="max-w-md w-full mx-4">
                <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Configuración
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-gray-800 h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-0">
                        {/* Camera Settings */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                        {settings.cameraEnabled ? (
                                            <Camera className="h-4 w-4 text-green-400" />
                                        ) : (
                                            <CameraOff className="h-4 w-4 text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">Cámara</div>
                                        <div className="text-gray-400 text-xs">
                                            {isLoadingDevices ? 'Cargando...' : `${availableDevices.cameras.length} dispositivos`}
                                        </div>
                                    </div>
                                </div>
                                
                                <Button
                                    onClick={handleCameraToggle}
                                    size="sm"
                                    variant={settings.cameraEnabled ? "destructive" : "default"}
                                    className={settings.cameraEnabled ? "bg-red-600 hover:bg-red-700 h-8" : "bg-green-600 hover:bg-green-700 h-8"}
                                >
                                    {settings.cameraEnabled ? <CameraOff className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                                </Button>
                            </div>

                            {/* Camera Selection */}
                            {availableDevices.cameras.length > 0 && (
                                <select
                                    value={selectedCamera}
                                    onChange={(e) => setSelectedCamera(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    {availableDevices.cameras.map((camera) => (
                                        <option key={camera.deviceId} value={camera.deviceId}>
                                            {camera.label || `Cámara ${camera.deviceId.slice(0, 8)}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Microphone Settings */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                        {settings.micEnabled ? (
                                            <Mic className="h-4 w-4 text-green-400" />
                                        ) : (
                                            <MicOff className="h-4 w-4 text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">Micrófono</div>
                                        <div className="text-gray-400 text-xs">
                                            {isLoadingDevices ? 'Cargando...' : `${availableDevices.microphones.length} dispositivos`}
                                        </div>
                                    </div>
                                </div>
                                
                                <Button
                                    onClick={handleMicToggle}
                                    size="sm"
                                    variant={settings.micEnabled ? "destructive" : "default"}
                                    className={settings.micEnabled ? "bg-red-600 hover:bg-red-700 h-8" : "bg-green-600 hover:bg-green-700 h-8"}
                                >
                                    {settings.micEnabled ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                                </Button>
                            </div>

                            {/* Microphone Selection */}
                            {availableDevices.microphones.length > 0 && (
                                <select
                                    value={selectedMicrophone}
                                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    {availableDevices.microphones.map((mic) => (
                                        <option key={mic.deviceId} value={mic.deviceId}>
                                            {mic.label || `Micrófono ${mic.deviceId.slice(0, 8)}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Volume Control */}
                        <div className="space-y-2">
                            <div className="p-3 bg-gray-800/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <VolumeX className="h-4 w-4 text-gray-400" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={settings.volume}
                                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <Volume2 className="h-4 w-4 text-gray-400" />
                                    <span className="text-white text-sm font-medium w-8 text-right">
                                        {settings.volume}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Screen Sharing Settings */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                        {settings.screenSharing ? (
                                            <Monitor className="h-4 w-4 text-green-400" />
                                        ) : (
                                            <MonitorOff className="h-4 w-4 text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">Pantalla</div>
                                        <div className="text-gray-400 text-xs">
                                            {isLoadingDevices ? 'Cargando...' : `${availableDevices.screens.length} pantallas`}
                                        </div>
                                    </div>
                                </div>
                                
                                <Button
                                    onClick={handleScreenToggle}
                                    size="sm"
                                    variant={settings.screenSharing ? "destructive" : "default"}
                                    className={settings.screenSharing ? "bg-red-600 hover:bg-red-700 h-8" : "bg-green-600 hover:bg-green-700 h-8"}
                                >
                                    {settings.screenSharing ? <MonitorOff className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                                </Button>
                            </div>

                            {/* Screen Selection */}
                            {availableDevices.screens.length > 0 && (
                                <select
                                    value={selectedScreen}
                                    onChange={(e) => setSelectedScreen(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    {availableDevices.screens.map((screen) => (
                                        <option key={screen.id} value={screen.id}>
                                            {screen.name || `Pantalla ${screen.id.slice(0, 8)}`}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {availableDevices.screens.length === 0 && !isLoadingDevices && (
                                <div className="p-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                                    <div className="text-yellow-300 text-xs">
                                        ⚠️ No se detectaron pantallas
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-700">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                className="text-white border-gray-600 hover:bg-gray-800 h-8"
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={onClose}
                                className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Aplicar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
