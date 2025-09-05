import React, { useState } from 'react';
// Replaced Radix Dialog components with custom modal markup to avoid context requirements
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
    Video, 
    Hash, 
    Code2, 
    Users,
    MessageSquare,
    Eye,
    EyeOff,
    Calendar,
    Clock,
    X,
    Play
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface LiveStreamFormData {
    title: string;
    description: string;
    category: string;
    programming_language: string;
    tags: string[];
    privacy: 'public' | 'private' | 'unlisted';
    allow_chat: boolean;
    allow_code_collaboration: boolean;
    auto_record: boolean;
    scheduled_at?: string;
}

interface CreateLiveStreamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStreamCreated?: (stream: any) => void;
    onError?: (error: string) => void;
    onLoadingChange?: (loading: boolean) => void;
}

const streamCategories = [
    { value: 'coding', label: 'Programación', icon: Code2, description: 'Sesión de programación en vivo' },
    { value: 'tutorial', label: 'Tutorial', icon: Users, description: 'Tutorial técnico paso a paso' },
    { value: 'code_review', label: 'Code Review', icon: Eye, description: 'Revisión de código colaborativa' },
    { value: 'debugging', label: 'Debugging', icon: Hash, description: 'Sesión de depuración' },
    { value: 'project_building', label: 'Construcción de Proyectos', icon: Play, description: 'Construir proyectos en tiempo real' },
    { value: 'interview_prep', label: 'Preparación de Entrevistas', icon: MessageSquare, description: 'Preparación para entrevistas técnicas' }
];

const programmingLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'PHP', 'Java', 'C++', 'C#', 
    'Go', 'Rust', 'Swift', 'Kotlin', 'Ruby', 'HTML/CSS', 'SQL', 'Other'
];

const privacyOptions = [
    { value: 'public', label: 'Público', description: 'Visible para todos', icon: Users },
    { value: 'unlisted', label: 'No listado', description: 'Solo con enlace directo', icon: Eye },
    { value: 'private', label: 'Privado', description: 'Solo invitados', icon: EyeOff }
];

export default function CreateLiveStreamModal({ 
    isOpen, 
    onClose, 
    onStreamCreated, 
    onError, 
    onLoadingChange 
}: CreateLiveStreamModalProps) {
    console.log('CreateLiveStreamModal render - isOpen:', isOpen);
    
    const [formData, setFormData] = useState<LiveStreamFormData>({
        title: '',
        description: '',
        category: '',
        programming_language: '',
        tags: [],
        privacy: 'public',
        allow_chat: true,
        allow_code_collaboration: false,
        auto_record: false
    });
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.category) {
            onError?.('Por favor completa todos los campos requeridos');
            return;
        }

        setIsSubmitting(true);
        onLoadingChange?.(true);
        
        try {
            // Preparar datos para envío
            const submitData = {
                ...formData,
                scheduled_at: isScheduled ? formData.scheduled_at : null,
                tips_enabled: false,
                min_tip_amount: null,
                subscribers_only: false,
                allow_screen_control: false,
                max_participants: 100,
                // Asegurar que los tags sean un array válido
                tags: Array.isArray(formData.tags) ? formData.tags : []
            };

            console.log('Submitting stream data:', submitData);

            const response = await fetch('/api/livestreams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();
            console.log('Response:', { status: response.status, data });

            if (response.ok && data.success) {
                console.log('Stream creation successful:', data);
                onStreamCreated?.(data);
            } else {
                console.error('Stream creation failed:', { status: response.status, data });
                let errorMessage = 'Error al crear el stream';
                
                if (data.validation_errors) {
                    const errors = Object.values(data.validation_errors).flat();
                    errorMessage = errors.join(', ');
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (data.message) {
                    errorMessage = data.message;
                }
                
                onError?.(errorMessage);
            }
        } catch (error) {
            console.error('Network error creating stream:', error);
            onError?.('Error de conexión. Por favor intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
            onLoadingChange?.(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            handleAddTag();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center create-livestream-modal"
            onClick={onClose}
            style={{
                zIndex: 999999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(4px)'
            }}
        >
            <div 
                className="max-w-2xl max-h-[90vh] overflow-y-auto text-white rounded-lg p-6 modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ 
                    position: 'relative',
                    zIndex: 1000000,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '600px',
                    width: '90vw',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                }}
            >
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Video className="h-6 w-6 text-red-500" />
                        Crear Live Stream
                    </h2>
                    <p className="text-white/70">
                        Configura tu sesión de streaming en vivo para compartir con la comunidad
                    </p>
                </div>

                <div className="space-y-6 py-4">
                    {/* Título */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white uppercase tracking-wider">Título *</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ej: Construyendo una API REST con Node.js"
                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white uppercase tracking-wider">Descripción</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe de qué tratará tu stream..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                        />
                    </div>

                    {/* Categoría y Lenguaje */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white uppercase tracking-wider">Categoría *</label>
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <SelectValue placeholder="Selecciona categoría" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white" style={{ zIndex: 1000003 }}>
                                    {streamCategories.map(category => {
                                        const Icon = category.icon;
                                        return (
                                            <SelectItem key={category.value} value={category.value} className="text-white hover:bg-white/20">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-medium">{category.label}</div>
                                                        <div className="text-xs text-white/60">{category.description}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white uppercase tracking-wider">Lenguaje</label>
                            <Select value={formData.programming_language} onValueChange={(value) => setFormData(prev => ({ ...prev, programming_language: value }))}>
                                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <SelectValue placeholder="Lenguaje principal" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white" style={{ zIndex: 1000003 }}>
                                    {programmingLanguages.map(lang => (
                                        <SelectItem key={lang} value={lang.toLowerCase()} className="text-white hover:bg-white/20">
                                            {lang}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Privacidad */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white uppercase tracking-wider">Privacidad</label>
                        <Select value={formData.privacy} onValueChange={(value: 'public' | 'private' | 'unlisted') => setFormData(prev => ({ ...prev, privacy: value }))}>
                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white" style={{ zIndex: 1000003 }}>
                                {privacyOptions.map(option => {
                                    const Icon = option.icon;
                                    return (
                                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/20">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">{option.label}</div>
                                                    <div className="text-xs text-white/60">{option.description}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Configuraciones */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-white uppercase tracking-wider">Configuraciones</label>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-white">Chat en vivo</div>
                                        <div className="text-sm text-gray-400">Permitir que los espectadores chateen</div>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.allow_chat}
                                    onCheckedChange={(checked) => {
                                        console.log('Chat switch clicked:', checked);
                                        setFormData(prev => ({ ...prev, allow_chat: checked }));
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Code2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-white">Colaboración de código</div>
                                        <div className="text-sm text-gray-400">Permitir edición colaborativa de código</div>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.allow_code_collaboration}
                                    onCheckedChange={(checked) => {
                                        console.log('Code collaboration switch clicked:', checked);
                                        setFormData(prev => ({ ...prev, allow_code_collaboration: checked }));
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Video className="h-5 w-5 text-red-400 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-white">Grabación automática</div>
                                        <div className="text-sm text-gray-400">Grabar automáticamente el stream</div>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.auto_record}
                                    onCheckedChange={(checked) => {
                                        console.log('Auto record switch clicked:', checked);
                                        setFormData(prev => ({ ...prev, auto_record: checked }));
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-white">Programar stream</div>
                                        <div className="text-sm text-gray-400">Programar para más tarde</div>
                                    </div>
                                </div>
                                <Switch
                                    checked={isScheduled}
                                    onCheckedChange={(checked) => {
                                        console.log('Schedule switch clicked:', checked);
                                        setIsScheduled(checked);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fecha programada */}
                    {isScheduled && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white uppercase tracking-wider">Fecha y hora</label>
                            <Input
                                type="datetime-local"
                                value={formData.scheduled_at || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                                className="bg-gray-800/50 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                    )}

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white uppercase tracking-wider">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                    #{tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1 text-blue-300 hover:text-blue-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Agregar tag..."
                                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <Button type="button" onClick={handleAddTag} className="bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30">
                                <Hash className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-white/60">
                            Separa las etiquetas con comas o presiona Enter
                        </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="bg-gray-700/50 hover:bg-gray-600/70 text-white border-gray-600 hover:border-gray-500 h-11 px-6 transition-all"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.title.trim() || !formData.category}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-lg shadow-red-500/25 button-primary h-11 px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    {isScheduled ? 'Programando...' : 'Iniciando...'}
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    {isScheduled ? 'Programar Stream' : 'Iniciar Stream'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}