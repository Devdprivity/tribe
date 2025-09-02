import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Plus, 
    Hash, 
    Code2, 
    FileImage, 
    HelpCircle,
    BookOpen,
    AlertTriangle,
    Play,
    Github,
    Globe,
    Star,
    GitFork,
    Clock,
    Lightbulb,
    CheckCircle,
    X
} from 'lucide-react';
import CreatePostSkeleton from '@/components/create-post-skeleton';

type PostType = 'text' | 'code' | 'project' | 'question' | 'code_snippet' | 'project_showcase' | 'tech_tutorial' | 'problem_solution' | 'code_playground';

interface FormData {
    type: PostType;
    content: string;
    tags: string[];
    // Code Snippet
    code?: string;
    language?: string;
    title?: string;
    description?: string;
    githubUrl?: string;
    isExecutable?: boolean;
    // Project Showcase
    image?: string;
    technologies?: string[];
    liveUrl?: string;
    stats?: {
        stars?: number;
        forks?: number;
        watchers?: number;
    };
    features?: string[];
    // Tech Tutorial
    readTime?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    sections?: Array<{
        title: string;
        content: string;
        code?: string;
        language?: string;
    }>;
    images?: string[];
    // Problem Solution
    problem?: {
        title?: string;
        description?: string;
        code?: string;
        language?: string;
        error?: string;
        context?: string;
    };
    solution?: {
        description?: string;
        code?: string;
        language?: string;
        explanation?: string;
        alternatives?: string[];
    };
    category?: string;
    // Code Playground
    initialCode?: string;
    expectedOutput?: string;
    isInteractive?: boolean;
}

const postTypes = [
    { value: 'text', label: 'Texto', icon: Hash, description: 'Post de texto simple' },
    { value: 'code', label: 'Código', icon: Code2, description: 'Bloque de código básico' },
    { value: 'code_snippet', label: 'Code Snippet', icon: Code2, description: 'Código con syntax highlighting y funciones' },
    { value: 'project_showcase', label: 'Project Showcase', icon: Github, description: 'Mostrar proyecto con tecnologías' },
    { value: 'tech_tutorial', label: 'Tech Tutorial', icon: BookOpen, description: 'Tutorial técnico con secciones' },
    { value: 'problem_solution', label: 'Problem/Solution', icon: AlertTriangle, description: 'Problema técnico y su solución' },
    { value: 'code_playground', label: 'Code Playground', icon: Play, description: 'Código ejecutable interactivo' },
];

const languages = [
    'javascript', 'typescript', 'python', 'php', 'java', 'css', 'html', 
    'sql', 'bash', 'json', 'go', 'rust', 'c++', 'c#', 'swift', 'kotlin'
];

const difficulties = [
    { value: 'beginner', label: 'Principiante', color: 'bg-green-500/20 text-green-300 border-green-400/30' },
    { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' },
    { value: 'advanced', label: 'Avanzado', color: 'bg-red-500/20 text-red-300 border-red-400/30' },
];

export default function CreatePost() {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<FormData>({
        type: 'text',
        content: '',
        tags: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [newSection, setNewSection] = useState({ title: '', content: '', code: '', language: '' });
    const [newFeature, setNewFeature] = useState('');
    const [newAlternative, setNewAlternative] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleTypeChange = (type: PostType) => {
        setFormData(prev => ({ ...prev, type }));
    };

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

    const handleAddSection = () => {
        if (newSection.title.trim()) {
            setFormData(prev => ({
                ...prev,
                sections: [...(prev.sections || []), { ...newSection }]
            }));
            setNewSection({ title: '', content: '', code: '', language: '' });
        }
    };

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const handleAddAlternative = () => {
        if (newAlternative.trim()) {
            setFormData(prev => ({
                ...prev,
                solution: {
                    ...prev.solution,
                    alternatives: [...(prev.solution?.alternatives || []), newAlternative.trim()]
                }
            }));
            setNewAlternative('');
        }
    };

    const renderSpecializedFields = () => {
        switch (formData.type) {
            case 'code_snippet':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Título</label>
                                <Input
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Título del snippet"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Lenguaje</label>
                                <Select value={formData.language || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                        <SelectValue placeholder="Selecciona lenguaje" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        {languages.map(lang => (
                                            <SelectItem key={lang} value={lang} className="text-white hover:bg-white/20">
                                                {lang.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Descripción</label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe qué hace este código"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Código</label>
                            <Textarea
                                value={formData.code || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                placeholder="Pega tu código aquí"
                                className="min-h-[200px] bg-black/40 border-white/20 text-white placeholder:text-white/50 font-mono text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">URL de GitHub (opcional)</label>
                                <Input
                                    value={formData.githubUrl || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                                    placeholder="https://github.com/usuario/repo"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="isExecutable"
                                    checked={formData.isExecutable || false}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isExecutable: e.target.checked }))}
                                    className="rounded border-white/20 bg-white/5"
                                />
                                <label htmlFor="isExecutable" className="text-sm text-white">Es ejecutable</label>
                            </div>
                        </div>
                    </div>
                );

            case 'project_showcase':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Título del Proyecto</label>
                                <Input
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Mi Proyecto Increíble"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">URL de Imagen</label>
                                <Input
                                    value={formData.image || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Descripción</label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe tu proyecto"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">URL de GitHub</label>
                                <Input
                                    value={formData.githubUrl || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                                    placeholder="https://github.com/usuario/repo"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">URL del Demo</label>
                                <Input
                                    value={formData.liveUrl || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                                    placeholder="https://mi-proyecto.com"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Tecnologías</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {(formData.technologies || []).map((tech, index) => (
                                    <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                        {tech}
                                        <button
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                technologies: prev.technologies?.filter((_, i) => i !== index)
                                            }))}
                                            className="ml-1 hover:text-red-400"
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
                                    placeholder="Agregar tecnología"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), setFormData(prev => ({
                                        ...prev,
                                        technologies: [...(prev.technologies || []), tagInput.trim()]
                                    })), setTagInput(''))}
                                />
                                <Button type="button" onClick={() => {
                                    if (tagInput.trim()) {
                                        setFormData(prev => ({
                                            ...prev,
                                            technologies: [...(prev.technologies || []), tagInput.trim()]
                                        }));
                                        setTagInput('');
                                    }
                                }} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Características</label>
                            <div className="space-y-2">
                                {(formData.features || []).map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                        <span className="text-white/80 text-sm">{feature}</span>
                                        <button
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                features: prev.features?.filter((_, i) => i !== index)
                                            }))}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Nueva característica"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                                <Button type="button" onClick={handleAddFeature} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 'tech_tutorial':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Título</label>
                                <Input
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Título del tutorial"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Tiempo de lectura (min)</label>
                                <Input
                                    type="number"
                                    value={formData.readTime || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))}
                                    placeholder="5"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Dificultad</label>
                                <Select value={formData.difficulty || ''} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                        <SelectValue placeholder="Selecciona dificultad" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        {difficulties.map(diff => (
                                            <SelectItem key={diff.value} value={diff.value} className="text-white hover:bg-white/20">
                                                {diff.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Contenido Principal</label>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Escribe el contenido principal del tutorial (soporta markdown básico)"
                                className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Secciones del Tutorial</label>
                            <div className="space-y-3">
                                {(formData.sections || []).map((section, index) => (
                                    <div key={index} className="border border-white/10 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-white font-medium">{section.title}</h4>
                                            <button
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    sections: prev.sections?.filter((_, i) => i !== index)
                                                }))}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-white/70 text-sm mb-2">{section.content}</p>
                                        {section.code && (
                                            <pre className="bg-black/40 p-2 rounded text-xs text-white/80 overflow-x-auto">
                                                <code>{section.code}</code>
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="border border-white/10 rounded-lg p-4 space-y-3">
                                <h4 className="text-white font-medium">Agregar Nueva Sección</h4>
                                <Input
                                    value={newSection.title}
                                    onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Título de la sección"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                                <Textarea
                                    value={newSection.content}
                                    onChange={(e) => setNewSection(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Contenido de la sección"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Textarea
                                        value={newSection.code}
                                        onChange={(e) => setNewSection(prev => ({ ...prev, code: e.target.value }))}
                                        placeholder="Código (opcional)"
                                        className="bg-black/40 border-white/20 text-white placeholder:text-white/50 font-mono text-sm"
                                    />
                                    <Select value={newSection.language} onValueChange={(value) => setNewSection(prev => ({ ...prev, language: value }))}>
                                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                            <SelectValue placeholder="Lenguaje" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/10 border-white/20 text-white">
                                            {languages.map(lang => (
                                                <SelectItem key={lang} value={lang} className="text-white hover:bg-white/20">
                                                    {lang.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="button" onClick={handleAddSection} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Sección
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 'problem_solution':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Título del Problema</label>
                                <Input
                                    value={formData.problem?.title || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        problem: { ...prev.problem, title: e.target.value }
                                    }))}
                                    placeholder="Título del problema"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Categoría</label>
                                <Input
                                    value={formData.category || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="Frontend, Backend, Database, etc."
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Descripción del Problema</label>
                            <Textarea
                                value={formData.problem?.description || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    problem: { ...prev.problem, description: e.target.value }
                                }))}
                                placeholder="Describe el problema que estás enfrentando"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Contexto (opcional)</label>
                            <Textarea
                                value={formData.problem?.context || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    problem: { ...prev.problem, context: e.target.value }
                                }))}
                                placeholder="Proporciona contexto adicional sobre el problema"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Código con Problema (opcional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Textarea
                                    value={formData.problem?.code || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        problem: { ...prev.problem, code: e.target.value }
                                    }))}
                                    placeholder="Código que tiene el problema"
                                    className="bg-black/40 border-white/20 text-white placeholder:text-white/50 font-mono text-sm"
                                />
                                <Select value={formData.problem?.language || ''} onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    problem: { ...prev.problem, language: value }
                                }))}>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                        <SelectValue placeholder="Lenguaje" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        {languages.map(lang => (
                                            <SelectItem key={lang} value={lang} className="text-white hover:bg-white/20">
                                                {lang.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Descripción de la Solución</label>
                            <Textarea
                                value={formData.solution?.description || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    solution: { ...prev.solution, description: e.target.value }
                                }))}
                                placeholder="Describe cómo solucionaste el problema"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Código de la Solución (opcional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Textarea
                                    value={formData.solution?.code || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        solution: { ...prev.solution, code: e.target.value }
                                    }))}
                                    placeholder="Código corregido"
                                    className="bg-black/40 border-white/20 text-white placeholder:text-white/50 font-mono text-sm"
                                />
                                <Select value={formData.solution?.language || ''} onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    solution: { ...prev.solution, language: value }
                                }))}>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                        <SelectValue placeholder="Lenguaje" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        {languages.map(lang => (
                                            <SelectItem key={lang} value={lang} className="text-white hover:bg-white/20">
                                                {lang.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Alternativas</label>
                            <div className="space-y-2">
                                {(formData.solution?.alternatives || []).map((alt, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span className="text-white/80 text-sm">{alt}</span>
                                        <button
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                solution: {
                                                    ...prev.solution,
                                                    alternatives: prev.solution?.alternatives?.filter((_, i) => i !== index)
                                                }
                                            }))}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newAlternative}
                                    onChange={(e) => setNewAlternative(e.target.value)}
                                    placeholder="Nueva alternativa"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                                <Button type="button" onClick={handleAddAlternative} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 'code_playground':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Título</label>
                                <Input
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Título del playground"
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Lenguaje</label>
                                <Select value={formData.language || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                        <SelectValue placeholder="Selecciona lenguaje" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        {languages.map(lang => (
                                            <SelectItem key={lang} value={lang} className="text-white hover:bg-white/20">
                                                {lang.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Descripción</label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe qué hace este playground"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Código Inicial</label>
                            <Textarea
                                value={formData.initialCode || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, initialCode: e.target.value }))}
                                placeholder="Código inicial para el playground"
                                className="min-h-[200px] bg-black/40 border-white/20 text-white placeholder:text-white/50 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Resultado Esperado (opcional)</label>
                            <Textarea
                                value={formData.expectedOutput || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, expectedOutput: e.target.value }))}
                                placeholder="Qué resultado debería mostrar el código"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isInteractive"
                                checked={formData.isInteractive || false}
                                onChange={(e) => setFormData(prev => ({ ...prev, isInteractive: e.target.checked }))}
                                className="rounded border-white/20 bg-white/5"
                            />
                            <label htmlFor="isInteractive" className="text-sm text-white">Es interactivo (permite ejecutar código)</label>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Contenido</label>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="¿Qué quieres compartir con la comunidad?"
                            className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/50"
                        />
                    </div>
                );
        }
    };

    return (
        <AppLayout title="Crear Post" description="Comparte tu conocimiento con la comunidad">
            <Head title="Crear Post" />

            {loading ? (
                <CreatePostSkeleton />
            ) : (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button">
                            <Link href="/posts">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Crear Post</h1>
                            <p className="text-white/70">
                                Comparte tu conocimiento con la comunidad
                            </p>
                        </div>
                    </div>

                    {/* Formulario */}
                    <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-white">Nuevo Post</CardTitle>
                            <CardDescription className="text-white/70">
                                Escribe sobre lo que quieras compartir con la comunidad
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Tipo de Post */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Tipo de contenido</label>
                                <Select value={formData.type} onValueChange={handleTypeChange}>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20">
                                        <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white" sideOffset={4}>
                                        {postTypes.map(type => {
                                            const Icon = type.icon;
                                            return (
                                                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/20 focus:bg-white/20">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">{type.label}</div>
                                                            <div className="text-xs text-white/60">{type.description}</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Campos especializados */}
                            {renderSpecializedFields()}

                            {/* Etiquetas */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Etiquetas</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.tags.map((tag, index) => (
                                        <Badge key={index} className="bg-white/10 text-white/80 border-white/20">
                                            #{tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1 hover:text-red-400"
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
                                        placeholder="laravel, php, vue, etc."
                                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    />
                                    <Button type="button" onClick={handleAddTag} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-white/60">
                                    Separa las etiquetas con comas o presiona Enter
                                </p>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-xl apple-liquid-button">
                                    <Link href="/posts">Cancelar</Link>
                                </Button>
                                <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Publicar Post
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}