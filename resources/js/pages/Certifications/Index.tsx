import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trophy, Clock, Users, Star, Filter, BookOpen } from 'lucide-react';

interface Certification {
    id: number;
    name: string;
    description: string;
    category: string;
    category_label: string;
    level: string;
    level_label: string;
    level_color: string;
    duration_hours: number;
    formatted_duration: string;
    price: number;
    formatted_price: string;
    passing_score: number;
    is_premium: boolean;
    skills_covered: string[];
    user_progress?: {
        attempts_used: number;
        attempts_remaining: number;
        best_score: number;
        is_certified: boolean;
        can_retake: boolean;
    };
}

interface Props {
    certifications: {
        data: Certification[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        category?: string;
        level?: string;
        price_range?: string;
        user_status?: string;
    };
    stats: {
        total_certifications: number;
        user_completed: number;
        categories_count: number;
    };
    categories: Record<string, string>;
    levels: Record<string, string>;
}

export default function CertificationsIndex({ certifications, filters, stats, categories, levels }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedLevel, setSelectedLevel] = useState(filters.level || '');
    const [selectedPriceRange, setSelectedPriceRange] = useState(filters.price_range || '');
    const [selectedUserStatus, setSelectedUserStatus] = useState(filters.user_status || '');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedLevel) params.append('level', selectedLevel);
        if (selectedPriceRange) params.append('price_range', selectedPriceRange);
        if (selectedUserStatus) params.append('user_status', selectedUserStatus);
        
        window.location.href = `/certifications?${params.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = '/certifications';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Certificaciones" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Certificaciones Técnicas</h1>
                    <p className="text-gray-400 text-lg">
                        Valida tus conocimientos y obtén certificaciones reconocidas en la industria
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.total_certifications}</p>
                                    <p className="text-gray-400">Certificaciones Disponibles</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.user_completed}</p>
                                    <p className="text-gray-400">Mis Certificaciones</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-green-500 mr-3" />
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.categories_count}</p>
                                    <p className="text-gray-400">Categorías</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="bg-dark-100 border-dark-200 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Filter className="mr-2 h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar certificaciones..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-dark-200 border-dark-300 text-white"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-200 border-dark-300">
                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                    {Object.entries(categories).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                    <SelectValue placeholder="Nivel" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-200 border-dark-300">
                                    <SelectItem value="all">Todos los niveles</SelectItem>
                                    {Object.entries(levels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                                <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                    <SelectValue placeholder="Precio" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-200 border-dark-300">
                                    <SelectItem value="all">Todos los precios</SelectItem>
                                    <SelectItem value="free">Gratis</SelectItem>
                                    <SelectItem value="budget">$1 - $50</SelectItem>
                                    <SelectItem value="premium">$50+</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedUserStatus} onValueChange={setSelectedUserStatus}>
                                <SelectTrigger className="bg-dark-200 border-dark-300 text-white">
                                    <SelectValue placeholder="Mi Estado" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-200 border-dark-300">
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="available">Disponibles</SelectItem>
                                    <SelectItem value="in_progress">En Progreso</SelectItem>
                                    <SelectItem value="completed">Completadas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                                Aplicar Filtros
                            </Button>
                            <Button onClick={clearFilters} variant="outline" className="border-gray-600">
                                Limpiar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Certifications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {certifications.data.map((cert) => (
                        <Card key={cert.id} className="bg-dark-100 border-dark-200 hover:border-blue-500 transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="secondary" className={cert.level_color}>
                                        {cert.level_label}
                                    </Badge>
                                    {cert.is_premium && (
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                            Premium
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-white text-lg line-clamp-2">
                                    {cert.name}
                                </CardTitle>
                                <p className="text-gray-400 text-sm">{cert.category_label}</p>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                                    {cert.description}
                                </p>

                                {/* Skills */}
                                <div className="mb-4">
                                    <p className="text-gray-400 text-xs mb-2">Skills que cubre:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {cert.skills_covered.slice(0, 3).map((skill, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {cert.skills_covered.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{cert.skills_covered.length - 3} más
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Info Row */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center text-gray-400 text-sm">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {cert.formatted_duration}
                                    </div>
                                    <div className="text-white font-semibold">
                                        {cert.formatted_price}
                                    </div>
                                </div>

                                {/* Progress/Status */}
                                {cert.user_progress && (
                                    <div className="mb-4">
                                        {cert.user_progress.is_certified ? (
                                            <div className="flex items-center text-green-500 text-sm">
                                                <Trophy className="h-4 w-4 mr-1" />
                                                Certificado ({cert.user_progress.best_score}%)
                                            </div>
                                        ) : cert.user_progress.attempts_used > 0 ? (
                                            <div className="text-gray-400 text-sm">
                                                Intentos: {cert.user_progress.attempts_used} / {cert.user_progress.attempts_remaining + cert.user_progress.attempts_used}
                                                {cert.user_progress.best_score > 0 && (
                                                    <span className="ml-2">Mejor: {cert.user_progress.best_score}%</span>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {/* Action Button */}
                                <Button 
                                    className="w-full"
                                    onClick={() => window.location.href = `/certifications/${cert.id}`}
                                    disabled={cert.user_progress?.is_certified}
                                    variant={cert.user_progress?.is_certified ? "outline" : "default"}
                                >
                                    {cert.user_progress?.is_certified 
                                        ? "Ver Certificado"
                                        : cert.user_progress?.attempts_used > 0
                                        ? cert.user_progress.can_retake ? "Reintentar" : "Ver Progreso"
                                        : "Empezar"
                                    }
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {certifications && certifications.meta && certifications.meta.last_page && certifications.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex items-center space-x-2">
                            {certifications.links.map((link, index) => (
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
                {certifications.data.length === 0 && (
                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="text-center py-12">
                            <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No se encontraron certificaciones
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
        </AuthenticatedLayout>
    );
}