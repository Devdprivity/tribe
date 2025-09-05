import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Search, 
    Filter, 
    Users, 
    Eye, 
    Clock,
    Play,
    Calendar,
    Code2,
    Tv,
    TrendingUp,
    Star,
    Plus,
    Radio,
    MessageSquare,
    Settings,
    Zap
} from 'lucide-react';

interface Stream {
    id: number;
    title: string;
    description: string;
    category: string;
    programming_language: string;
    tags: string[];
    status: 'live' | 'scheduled' | 'ended';
    privacy: string;
    current_viewers: number;
    peak_viewers: number;
    total_views: number;
    likes_count: number;
    scheduled_at: string;
    started_at?: string;
    allow_code_collaboration: boolean;
    streamer: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface StreamingIndexProps {
    streams: {
        data: Stream[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Record<string, string>;
    languages: Record<string, string>;
    filters: {
        category?: string;
        language?: string;
        status?: string;
        search?: string;
    };
    stats: {
        live_streams: number;
        total_viewers: number;
        scheduled_today: number;
    };
}

const statusColors = {
    live: 'bg-red-500/20 text-red-300 border-red-400/30',
    scheduled: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    ended: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
};

const statusLabels = {
    live: 'EN VIVO',
    scheduled: 'Programado',
    ended: 'Terminado',
};

const categoryIcons = {
    coding: Code2,
    tutorial: Play,
    code_review: Eye,
    debugging: Settings,
    interview_prep: Users,
    project_building: Plus,
    algorithm_practice: TrendingUp,
    web_development: Tv,
    mobile_development: Tv,
    data_science: Star,
    devops: Settings,
    game_development: Play,
    other: Code2,
};

export default function StreamingIndex({ streams, categories, languages, filters, stats }: StreamingIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedLanguage, setSelectedLanguage] = useState(filters.language || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('streaming.index'), {
            search: searchTerm,
            category: selectedCategory,
            language: selectedLanguage,
            status: selectedStatus,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        setIsLoading(true);
        router.get(route('streaming.index'), {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const StreamCard = ({ stream }: { stream: Stream }) => {
        const CategoryIcon = categoryIcons[stream.category as keyof typeof categoryIcons] || Code2;
        
        return (
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/5 border-white/10 hover:border-white/20 apple-liquid-card">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <CategoryIcon className="h-5 w-5 text-blue-400" />
                            <Badge className={statusColors[stream.status]}>
                                {stream.status === 'live' && <Radio className="h-3 w-3 mr-1" />}
                                {statusLabels[stream.status]}
                            </Badge>
                        </div>
                        {stream.allow_code_collaboration && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                                <Code2 className="h-3 w-3 mr-1" />
                                Colaborativo
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                        <Link href={route('streaming.show', stream.id)}>
                            {stream.title}
                        </Link>
                    </CardTitle>
                    <CardDescription className="text-white/70 text-sm line-clamp-2">
                        {stream.description}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {stream.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80">
                                {tag}
                            </Badge>
                        ))}
                        {stream.programming_language && (
                            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                                {languages[stream.programming_language]}
                            </Badge>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{stream.current_viewers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{stream.total_views}</span>
                        </div>
                        {stream.status === 'scheduled' && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(stream.scheduled_at).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Streamer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                    {stream.streamer.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm text-white/70">{stream.streamer.username}</span>
                        </div>
                        
                        <Link href={route('streaming.show', stream.id)}>
                            <Button size="sm" className="bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button">
                                {stream.status === 'live' ? 'Ver Ahora' : 'Ver Detalles'}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Head title="Streaming - Tribe" />
            
            <div className="min-h-screen bg-black">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                                <Tv className="h-10 w-10 text-purple-400" />
                                Streaming para Desarrolladores
                            </h1>
                            <p className="text-xl text-white/70 mb-8">
                                Aprende, enseña y colabora en tiempo real con código
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-white/5 border-white/10 apple-liquid-card text-center">
                                <CardContent className="p-6">
                                    <div className="text-3xl font-bold text-red-400 mb-2">{stats.live_streams}</div>
                                    <div className="text-white/70">Streams en Vivo</div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-white/5 border-white/10 apple-liquid-card text-center">
                                <CardContent className="p-6">
                                    <div className="text-3xl font-bold text-blue-400 mb-2">{stats.total_viewers}</div>
                                    <div className="text-white/70">Espectadores Activos</div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-white/5 border-white/10 apple-liquid-card text-center">
                                <CardContent className="p-6">
                                    <div className="text-3xl font-bold text-green-400 mb-2">{stats.scheduled_today}</div>
                                    <div className="text-white/70">Streams Hoy</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search and Filters */}
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar streams, streamers, tecnologías..."
                                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 apple-liquid-input h-12"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button h-12 px-6"
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </Button>
                            </div>

                            <div className="flex gap-4 flex-wrap">
                                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="live" className="text-white hover:bg-white/20">
                                            🔴 En Vivo
                                        </SelectItem>
                                        <SelectItem value="scheduled" className="text-white hover:bg-white/20">
                                            📅 Programados
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                                    <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {Object.entries(categories).map(([key, label]) => (
                                            <SelectItem key={key} value={key} className="text-white hover:bg-white/20">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value)}>
                                    <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Lenguaje" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todos los lenguajes</SelectItem>
                                        {Object.entries(languages).map(([key, label]) => (
                                            <SelectItem key={key} value={key} className="text-white hover:bg-white/20">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Stream CTA */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                            Streams Disponibles ({streams.total})
                        </h2>
                        <Link href={route('streaming.create')}>
                            <Button className="bg-purple-500/80 hover:bg-purple-500 text-white apple-liquid-button">
                                <Zap className="h-4 w-4 mr-2" />
                                Crear Stream
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Streams Grid */}
                <div className="max-w-7xl mx-auto px-6 pb-8">
                    {streams.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {streams.data.map(stream => (
                                    <StreamCard key={stream.id} stream={stream} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {streams && streams.last_page && streams.last_page > 1 && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex gap-2">
                                        {Array.from({ length: streams.last_page }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={page === streams.current_page ? "default" : "outline"}
                                                onClick={() => handleFilterChange('page', page.toString())}
                                                className={page === streams.current_page 
                                                    ? "bg-blue-500/80 text-white" 
                                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                                }
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Tv className="h-16 w-16 text-white/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron streams</h3>
                            <p className="text-white/70 mb-6">
                                Intenta ajustar tus filtros o explora otras categorías.
                            </p>
                            <Link href={route('streaming.create')}>
                                <Button className="bg-purple-500/80 hover:bg-purple-500 text-white apple-liquid-button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear el Primer Stream
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}