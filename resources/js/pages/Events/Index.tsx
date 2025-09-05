import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Search, 
    Calendar, 
    MapPin, 
    Users, 
    Clock,
    Globe,
    Video,
    DollarSign,
    Plus,
    Filter,
    Star,
    Eye,
    Zap,
    Code2,
    Gamepad2,
    Mic,
    Wrench,
    BookOpen,
    Briefcase,
    Coffee,
    Radio
} from 'lucide-react';

interface TechEvent {
    id: number;
    title: string;
    description: string;
    type: string;
    format: 'virtual' | 'hybrid' | 'in_person';
    location?: string;
    starts_at: string;
    ends_at: string;
    timezone: string;
    max_attendees?: number;
    price: number;
    currency: string;
    technologies: string[];
    difficulty_level: string;
    cover_image?: string;
    status: string;
    organizer: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
    registered_count: number;
    is_registered: boolean;
    is_live: boolean;
    is_upcoming: boolean;
    is_full: boolean;
    spots_remaining: number;
    formatted_duration: string;
    type_icon: string;
    type_label: string;
}

interface EventsIndexProps {
    events: {
        data: TechEvent[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    featured_events: TechEvent[];
    popular_technologies: string[];
    event_types: Record<string, string>;
    filters: {
        search?: string;
        type?: string;
        format?: string;
        difficulty?: string;
        technology?: string;
        date_range?: string;
        price?: string;
    };
    stats: {
        total_events: number;
        live_events: number;
        upcoming_this_week: number;
        registered_users: number;
    };
}

const eventTypeIcons = {
    meetup: Coffee,
    hackathon: Code2,
    conference: Mic,
    workshop: Wrench,
    code_review: Eye,
    interview_prep: Briefcase,
    study_group: BookOpen,
};

const formatIcons = {
    virtual: Globe,
    hybrid: Video,
    in_person: MapPin,
};

const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-300 border-green-400/30',
    intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    advanced: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    expert: 'bg-red-500/20 text-red-300 border-red-400/30',
};

const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    expert: 'Experto',
};

export default function EventsIndex({ 
    events, 
    featured_events, 
    popular_technologies, 
    event_types, 
    filters, 
    stats 
}: EventsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedFormat, setSelectedFormat] = useState(filters.format || '');
    const [selectedDifficulty, setSelectedDifficulty] = useState(filters.difficulty || '');
    const [selectedTech, setSelectedTech] = useState(filters.technology || '');
    const [dateRange, setDateRange] = useState(filters.date_range || '');
    const [priceFilter, setPriceFilter] = useState(filters.price || '');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('events.index'), {
            search: searchTerm,
            type: selectedType,
            format: selectedFormat,
            difficulty: selectedDifficulty,
            technology: selectedTech,
            date_range: dateRange,
            price: priceFilter,
            tab: activeTab,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleRegister = async (eventId: number) => {
        try {
            const response = await fetch(`/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                // Refresh page or update state
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.message || 'Error al registrarse');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Error al registrarse');
        }
    };

    const EventCard = ({ event }: { event: TechEvent }) => {
        const TypeIcon = eventTypeIcons[event.type as keyof typeof eventTypeIcons] || Calendar;
        const FormatIcon = formatIcons[event.format];
        
        return (
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/5 border-white/10 hover:border-white/20 apple-liquid-card">
                {/* Cover Image */}
                {event.cover_image && (
                    <div className="aspect-video w-full bg-white/5 rounded-t-lg overflow-hidden">
                        <img
                            src={event.cover_image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
                
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{event.type_icon}</span>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                                {event.type_label}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                                <FormatIcon className="h-3 w-3 mr-1" />
                                {event.format === 'virtual' ? 'Virtual' : 
                                 event.format === 'hybrid' ? 'Híbrido' : 'Presencial'}
                            </Badge>
                        </div>
                        
                        {event.is_live && (
                            <Badge className="bg-red-500/20 text-red-300 border-red-400/30 animate-pulse">
                                <Radio className="h-3 w-3 mr-1" />
                                EN VIVO
                            </Badge>
                        )}
                    </div>
                    
                    <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors line-clamp-2">
                        <Link href={route('events.show', event.id)}>
                            {event.title}
                        </Link>
                    </CardTitle>
                    
                    <CardDescription className="text-white/70 text-sm line-clamp-2">
                        {event.description}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {/* Event Info */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-white/70">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.starts_at).toLocaleDateString()}</span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{event.formatted_duration}</span>
                        </div>
                        
                        {event.location && (
                            <div className="flex items-center gap-2 text-white/70">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{event.location}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-white/70">
                            <Users className="h-4 w-4" />
                            <span>{event.registered_count} registrados</span>
                            {event.max_attendees && (
                                <span>• {event.spots_remaining} disponibles</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1">
                        {event.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80">
                                {tech}
                            </Badge>
                        ))}
                        {event.technologies.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-white/80">
                                +{event.technologies.length - 3}
                            </Badge>
                        )}
                    </div>
                    
                    {/* Difficulty & Price */}
                    <div className="flex items-center justify-between">
                        <Badge className={difficultyColors[event.difficulty_level as keyof typeof difficultyColors]}>
                            {difficultyLabels[event.difficulty_level as keyof typeof difficultyLabels]}
                        </Badge>
                        
                        <div className="flex items-center gap-2">
                            {event.price > 0 ? (
                                <span className="text-green-400 font-semibold">
                                    {event.currency} {event.price}
                                </span>
                            ) : (
                                <span className="text-green-400 font-semibold">GRATIS</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Organizer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={event.organizer.avatar} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                    {event.organizer.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-white/70">@{event.organizer.username}</span>
                        </div>
                        
                        {event.is_registered ? (
                            <Button size="sm" variant="outline" disabled className="bg-green-500/20 text-green-300 border-green-400/30">
                                Registrado ✓
                            </Button>
                        ) : event.is_full ? (
                            <Button size="sm" variant="outline" disabled className="bg-gray-500/20 text-gray-400">
                                Completo
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => handleRegister(event.id)}
                                className="bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button"
                            >
                                {event.price > 0 ? 'Comprar' : 'Registrarse'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Head title="Eventos Técnicos - Tribe" />
            
            <div className="min-h-screen bg-black">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                                <Calendar className="h-10 w-10 text-green-400" />
                                Eventos para Desarrolladores
                            </h1>
                            <p className="text-xl text-white/70 mb-8">
                                Meetups, hackathons, workshops y más para impulsar tu carrera
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <Card className="bg-white/5 border-white/10 apple-liquid-card text-center">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-green-400 mb-1">{stats.total_events}</div>
                                    <div className="text-white/70 text-sm">Eventos</div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-white/5 border-white/10 apple-liquid-card text-center">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-red-400 mb-1">{stats.live_events}</div>
                                    <div className="text-white/70 text-sm">En Vivo</div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-white/5 border-white/10 apple-liquid-card text-center">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-blue-400 mb-1">{stats.upcoming_this_week}</div>
                                    <div className="text-white/70 text-sm">Esta Semana</div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-white/5 border-white/10 apple-liquid-card text-center">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-purple-400 mb-1">{stats.registered_users}</div>
                                    <div className="text-white/70 text-sm">Participantes</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search */}
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar eventos, tecnologías, organizadores..."
                                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 apple-liquid-input h-12"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="bg-green-500/80 hover:bg-green-500 text-white border-green-400/50 apple-liquid-button h-12 px-6"
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="flex gap-3 flex-wrap">
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todos</SelectItem>
                                        {Object.entries(event_types).map(([key, label]) => (
                                            <SelectItem key={key} value={key} className="text-white hover:bg-white/20">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                                    <SelectTrigger className="w-36 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Formato" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="virtual" className="text-white hover:bg-white/20">Virtual</SelectItem>
                                        <SelectItem value="hybrid" className="text-white hover:bg-white/20">Híbrido</SelectItem>
                                        <SelectItem value="in_person" className="text-white hover:bg-white/20">Presencial</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={priceFilter} onValueChange={setPriceFilter}>
                                    <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Precio" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="free" className="text-white hover:bg-white/20">Gratis</SelectItem>
                                        <SelectItem value="paid" className="text-white hover:bg-white/20">De Pago</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Event CTA */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                            Eventos Disponibles
                        </h2>
                        <Link href={route('events.create')}>
                            <Button className="bg-green-500/80 hover:bg-green-500 text-white apple-liquid-button">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Evento
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pb-8">
                    {/* Featured Events */}
                    {featured_events.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-400" />
                                Eventos Destacados
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featured_events.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Event Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="bg-white/5 border-white/10">
                            <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/10">
                                Todos ({events.total})
                            </TabsTrigger>
                            <TabsTrigger value="live" className="text-white data-[state=active]:bg-white/10">
                                🔴 En Vivo
                            </TabsTrigger>
                            <TabsTrigger value="upcoming" className="text-white data-[state=active]:bg-white/10">
                                📅 Próximos
                            </TabsTrigger>
                            <TabsTrigger value="free" className="text-white data-[state=active]:bg-white/10">
                                🆓 Gratis
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Events Grid */}
                    {events.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.data.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {events && events.last_page && events.last_page > 1 && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex gap-2">
                                        {Array.from({ length: Math.min(events.last_page, 5) }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={page === events.current_page ? "default" : "outline"}
                                                onClick={() => router.get(route('events.index'), { ...filters, page })}
                                                className={page === events.current_page 
                                                    ? "bg-green-500/80 text-white" 
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
                            <Calendar className="h-16 w-16 text-white/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron eventos</h3>
                            <p className="text-white/70 mb-6">
                                Intenta ajustar tus filtros o explora otros tipos de eventos.
                            </p>
                            <Link href={route('events.create')}>
                                <Button className="bg-green-500/80 hover:bg-green-500 text-white apple-liquid-button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear el Primer Evento
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}