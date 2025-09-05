import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Search, 
    Filter,
    MapPin,
    Star,
    Eye,
    DollarSign,
    Users,
    Code,
    Briefcase,
    Globe,
    CheckCircle,
    TrendingUp,
    Award,
    BookOpen,
    ExternalLink,
    Heart,
    Share2,
    MoreVertical,
    Calendar,
    Target
} from 'lucide-react';

interface Portfolio {
    id: number;
    slug: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
    };
    title: string;
    bio: string;
    tagline: string;
    specializations: string[];
    formatted_specializations: string[];
    tech_stack: string[];
    location?: string;
    available_for_hire: boolean;
    availability_status: string;
    availability_color: string;
    hourly_rate?: number;
    formatted_hourly_rate?: string;
    currency: string;
    is_public: boolean;
    views_count: number;
    rating?: number;
    rating_stars: string;
    reviews_count: number;
    profile_completion: {
        percentage: number;
        status: string;
        color: string;
    };
    projects_count: number;
    experience_years: number;
    last_updated: string;
    featured_projects: Array<{
        id: number;
        title: string;
        description: string;
        tech_stack: string[];
        live_url?: string;
        github_url?: string;
        image_url?: string;
    }>;
    primary_skills: Array<{
        skill_name: string;
        proficiency_level: number;
        years_experience: number;
        is_primary: boolean;
    }>;
    social_links: Record<string, string>;
}

interface Props {
    portfolios: {
        data: Portfolio[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        specialization?: string;
        tech?: string;
        location?: string;
        availability?: string;
        rating?: string;
        sort?: string;
    };
    stats: {
        total_portfolios: number;
        available_for_hire: number;
        top_specializations: Array<{ specialization: string; count: number }>;
        top_technologies: Array<{ tech: string; count: number }>;
        top_locations: Array<{ location: string; count: number }>;
    };
    specializations: string[];
    technologies: string[];
    locations: string[];
    is_authenticated: boolean;
    user?: { id: number };
}

export default function PortfoliosIndex({ 
    portfolios, 
    filters, 
    stats, 
    specializations, 
    technologies, 
    locations,
    is_authenticated,
    user
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSpecialization, setSelectedSpecialization] = useState(filters.specialization || '');
    const [selectedTech, setSelectedTech] = useState(filters.tech || '');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');
    const [selectedAvailability, setSelectedAvailability] = useState(filters.availability || '');
    const [selectedRating, setSelectedRating] = useState(filters.rating || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'popular');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedSpecialization) params.append('specialization', selectedSpecialization);
        if (selectedTech) params.append('tech', selectedTech);
        if (selectedLocation) params.append('location', selectedLocation);
        if (selectedAvailability) params.append('availability', selectedAvailability);
        if (selectedRating) params.append('rating', selectedRating);
        if (sortBy) params.append('sort', sortBy);
        
        window.location.href = `/portfolios?${params.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = '/portfolios';
    };

    const handleLike = async (portfolioId: number) => {
        if (!is_authenticated) {
            window.location.href = '/login';
            return;
        }

        try {
            await fetch(`/api/portfolios/${portfolioId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
            });
            // Refresh para actualizar likes
            window.location.reload();
        } catch (error) {
            console.error('Error liking portfolio:', error);
        }
    };

    const handleShare = (portfolio: Portfolio) => {
        const url = `/portfolios/${portfolio.slug}`;
        if (navigator.share) {
            navigator.share({
                title: `Portfolio de ${portfolio.user.name}`,
                text: portfolio.tagline,
                url: url
            });
        } else {
            navigator.clipboard.writeText(window.location.origin + url);
            alert('Enlace copiado al portapapeles');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Descubre Portfolios" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Descubre Portfolios</h1>
                            <p className="text-gray-400">Explora los mejores portfolios de desarrolladores y creativos</p>
                        </div>
                        {is_authenticated && (
                            <Button onClick={() => window.location.href = '/portfolios/create'} className="bg-blue-600 hover:bg-blue-700">
                                <Globe className="mr-2 h-4 w-4" />
                                Crear Mi Portfolio
                            </Button>
                        )}
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{stats.total_portfolios.toLocaleString()}</p>
                                <p className="text-gray-400">Portfolios Públicos</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{stats.available_for_hire.toLocaleString()}</p>
                                <p className="text-gray-400">Disponibles</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <Code className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{stats.top_technologies.length}</p>
                                <p className="text-gray-400">Tecnologías</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{stats.top_locations.length}</p>
                                <p className="text-gray-400">Ubicaciones</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filtros Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-dark-100 border-dark-200 sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Filter className="mr-2 h-5 w-5" />
                                    Filtros
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar portfolios..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-dark-200 border-dark-300 text-white"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                {/* Specialization */}
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Especialización</label>
                                    <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                                        <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todas</SelectItem>
                                            {specializations.map(spec => (
                                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Technology */}
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Tecnología</label>
                                    <Select value={selectedTech} onValueChange={setSelectedTech}>
                                        <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todas</SelectItem>
                                            {technologies.map(tech => (
                                                <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Ubicación</label>
                                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                        <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todas</SelectItem>
                                            {locations.map(location => (
                                                <SelectItem key={location} value={location}>{location}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Availability */}
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Disponibilidad</label>
                                    <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                                        <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="available">Disponible</SelectItem>
                                            <SelectItem value="busy">Ocupado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Calificación</label>
                                    <Select value={selectedRating} onValueChange={setSelectedRating}>
                                        <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="5">5 estrellas</SelectItem>
                                            <SelectItem value="4">4+ estrellas</SelectItem>
                                            <SelectItem value="3">3+ estrellas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleSearch} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                        Aplicar
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline" className="border-gray-600">
                                        Limpiar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Sort Controls */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-400">
                                Mostrando {portfolios.data.length} de {portfolios.meta?.total || 0} portfolios
                            </p>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-48 bg-dark-200 border-dark-300 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-200 border-dark-300">
                                    <SelectItem value="popular">Más populares</SelectItem>
                                    <SelectItem value="recent">Más recientes</SelectItem>
                                    <SelectItem value="rating">Mejor valorados</SelectItem>
                                    <SelectItem value="views">Más vistos</SelectItem>
                                    <SelectItem value="projects">Más proyectos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Portfolios Grid */}
                        <div className="space-y-6">
                            {portfolios.data.map((portfolio) => (
                                <Card key={portfolio.id} className="bg-dark-100 border-dark-200 hover:border-blue-500 transition-all duration-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            {/* Portfolio Info */}
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Avatar */}
                                                <Avatar className="h-16 w-16 ring-2 ring-blue-500/20">
                                                    <AvatarImage src={portfolio.user.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg">
                                                        {portfolio.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-semibold text-white hover:text-blue-400 cursor-pointer"
                                                            onClick={() => window.location.href = `/portfolios/${portfolio.slug}`}>
                                                            {portfolio.user.name}
                                                        </h3>
                                                        {portfolio.available_for_hire && (
                                                            <Badge className="bg-green-600 text-white">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Disponible
                                                            </Badge>
                                                        )}
                                                        {portfolio.rating && (
                                                            <div className="flex items-center">
                                                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                                                <span className="text-white text-sm">{portfolio.rating}</span>
                                                                <span className="text-gray-400 text-sm ml-1">({portfolio.reviews_count})</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-lg text-blue-400 mb-2">{portfolio.title}</p>
                                                    <p className="text-gray-300 mb-3 line-clamp-2">{portfolio.tagline}</p>

                                                    {/* Specializations */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {portfolio.formatted_specializations.slice(0, 3).map((spec, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {spec}
                                                            </Badge>
                                                        ))}
                                                        {portfolio.formatted_specializations.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{portfolio.formatted_specializations.length - 3} más
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Tech Stack */}
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {portfolio.tech_stack.slice(0, 6).map((tech, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {tech}
                                                            </Badge>
                                                        ))}
                                                        {portfolio.tech_stack.length > 6 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{portfolio.tech_stack.length - 6} más
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        {portfolio.location && (
                                                            <div className="flex items-center">
                                                                <MapPin className="h-4 w-4 mr-1" />
                                                                {portfolio.location}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center">
                                                            <Briefcase className="h-4 w-4 mr-1" />
                                                            {portfolio.experience_years} años exp.
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BookOpen className="h-4 w-4 mr-1" />
                                                            {portfolio.projects_count} proyectos
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            {portfolio.views_count} vistas
                                                        </div>
                                                        {portfolio.formatted_hourly_rate && (
                                                            <div className="flex items-center">
                                                                <DollarSign className="h-4 w-4 mr-1" />
                                                                {portfolio.formatted_hourly_rate}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-start gap-2">
                                                {is_authenticated && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleLike(portfolio.id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleShare(portfolio)}
                                                    className="text-gray-400 hover:text-blue-500"
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.location.href = `/portfolios/${portfolio.slug}`}
                                                >
                                                    Ver Portfolio
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Featured Projects Preview */}
                                        {portfolio.featured_projects.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-dark-300">
                                                <h4 className="text-sm font-medium text-white mb-3">Proyectos Destacados</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {portfolio.featured_projects.slice(0, 2).map((project, index) => (
                                                        <div key={index} className="p-3 bg-dark-200 rounded-lg">
                                                            <h5 className="text-white font-medium mb-1">{project.title}</h5>
                                                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{project.description}</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {project.tech_stack.slice(0, 3).map((tech, techIndex) => (
                                                                    <Badge key={techIndex} variant="outline" className="text-xs">
                                                                        {tech}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {portfolios.meta && portfolios.meta.last_page > 1 && (
                            <div className="flex justify-center mt-8">
                                <nav className="flex items-center space-x-2">
                                    {portfolios.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && (window.location.href = link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}

                        {/* Empty State */}
                        {portfolios.data.length === 0 && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardContent className="text-center py-12">
                                    <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        No se encontraron portfolios
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        Intenta ajustar tus filtros de búsqueda
                                    </p>
                                    <Button onClick={clearFilters} variant="outline">
                                        Limpiar Filtros
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Popular Specializations Section */}
                {stats.top_specializations.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Especializaciones Populares</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {stats.top_specializations.slice(0, 12).map((item, index) => (
                                <Card key={index} className="bg-dark-100 border-dark-200 hover:border-blue-500 transition-colors cursor-pointer"
                                      onClick={() => {
                                          setSelectedSpecialization(item.specialization);
                                          handleSearch();
                                      }}>
                                    <CardContent className="p-4 text-center">
                                        <h4 className="text-white font-medium mb-1">{item.specialization}</h4>
                                        <p className="text-gray-400 text-sm">{item.count} portfolios</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}