import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Building,
    Users,
    Plus,
    Search,
    Filter,
    Home,
    Globe,
    Bookmark,
    Send,
    ExternalLink,
    TrendingUp
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import JobsSkeleton from '@/components/jobs-skeleton';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
}

interface Job {
    id: number;
    company_name: string;
    title: string;
    description: string;
    requirements: string[];
    salary_range: string;
    location: string;
    remote_friendly: boolean;
    is_active: boolean;
    applications_count: number;
    posted_by: User;
    created_at: string;
    has_applied?: boolean;
    is_bookmarked?: boolean;
}

interface Props {
    jobs: {
        data: Job[];
        links: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
    filters: {
        search?: string;
        location?: string;
        remote?: boolean;
        salary_min?: number;
        salary_max?: number;
    };
    featured_jobs?: Job[];
    recent_applications?: Job[];
}

const formatSalary = (salary: string) => {
    if (!salary) return 'Salario no especificado';
    return salary;
};

const formatTimeAgo = (date: string) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffInMs = now.getTime() - jobDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;

    return `Hace ${Math.floor(diffInDays / 30)} meses`;
};

function JobCard({ job }: { job: Job }) {
    return (
        <Card className="hover:shadow-md transition-shadow apple-liquid-card">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-white/20">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold">
                                {job.company_name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:underline text-white">
                                    {job.title}
                                </Link>
                                {job.has_applied && (
                                    <Badge variant="secondary" className="bg-green-500/80 text-white border-green-400/50">
                                        Aplicado
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <Building className="h-4 w-4" />
                                <span className="font-medium">{job.company_name}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(job.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button">
                            <Bookmark className={`h-4 w-4 ${job.is_bookmarked ? 'fill-current' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-4">
                    {/* Información del trabajo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/90">
                                {job.location}
                                {job.remote_friendly && (
                                    <Badge variant="outline" className="ml-2 bg-white/10 text-white border-white/20">
                                        Remoto
                                    </Badge>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/90">{formatSalary(job.salary_range)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/90">{job.applications_count} aplicaciones</span>
                        </div>
                    </div>

                    {/* Descripción */}
                    <CardDescription className="line-clamp-3 text-white/80">
                        {job.description}
                    </CardDescription>

                    {/* Requisitos principales */}
                    {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 4).map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                                    {req}
                                </Badge>
                            ))}
                            {job.requirements.length > 4 && (
                                <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                                    +{job.requirements.length - 4} más
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <span>Por @{job.posted_by.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button">
                                <Link href={`/jobs/${job.id}`}>
                                    Ver detalles
                                </Link>
                            </Button>
                            {!job.has_applied && (
                                <Button size="sm" className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-lg apple-liquid-button">
                                    <Send className="h-4 w-4 mr-1" />
                                    Aplicar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function JobSidebar({ featuredJobs, recentApplications }: { featuredJobs?: Job[]; recentApplications?: Job[] }) {
    return (
        <div className="space-y-6">
            {/* Trabajos Destacados */}
            {featuredJobs && featuredJobs.length > 0 && (
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-white font-bold">
                            <TrendingUp className="h-5 w-5 text-yellow-400" />
                            Destacados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {featuredJobs.slice(0, 3).map((job) => (
                            <div key={job.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 group">
                                <Link href={`/jobs/${job.id}`} className="block">
                                    <h4 className="font-medium hover:underline text-white group-hover:text-blue-300 transition-colors">{job.title}</h4>
                                    <p className="text-sm text-white/70 mt-1">{job.company_name}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <MapPin className="h-3 w-3 text-white/70" />
                                        <span className="text-xs text-white/70">{job.location}</span>
                                        {job.remote_friendly && (
                                            <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                                                Remoto
                                            </Badge>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Aplicaciones Recientes */}
            {recentApplications && recentApplications.length > 0 && (
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-lg text-white font-bold">Mis Aplicaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {recentApplications.slice(0, 3).map((job) => (
                            <div key={job.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 group">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                    <div className="flex-1">
                                        <Link href={`/jobs/${job.id}`} className="block">
                                            <p className="font-medium text-sm hover:underline text-white group-hover:text-blue-300 transition-colors">{job.title}</p>
                                            <p className="text-xs text-white/70 mt-1">{job.company_name}</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Link href="/jobs/applications" className="text-sm text-blue-400 hover:text-blue-300 hover:underline block text-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                            Ver todas las aplicaciones →
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Filtros rápidos */}
            <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                <CardHeader className="border-b border-white/10 pb-4">
                    <CardTitle className="text-lg text-white font-bold">Filtros Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <Link href="/jobs?remote=true" className="block bg-white/5 backdrop-blur-sm rounded-xl p-3 hover:bg-white/10 transition-all duration-200 text-white hover:text-white border border-white/10 hover:border-white/20 hover:shadow-lg group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all duration-200">
                                <Home className="h-4 w-4 text-green-400" />
                            </div>
                            <span className="text-sm font-medium">Trabajos remotos</span>
                        </div>
                    </Link>
                    <Link href="/jobs?level=junior" className="block bg-white/5 backdrop-blur-sm rounded-xl p-3 hover:bg-white/10 transition-all duration-200 text-white hover:text-white border border-white/10 hover:border-white/20 hover:shadow-lg group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all duration-200">
                                <Users className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-sm font-medium">Para juniors</span>
                        </div>
                    </Link>
                    <Link href="/jobs?level=senior" className="block bg-white/5 backdrop-blur-sm rounded-xl p-3 hover:bg-white/10 transition-all duration-200 text-white hover:text-white border border-white/10 hover:border-white/20 hover:shadow-lg group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all duration-200">
                                <Users className="h-4 w-4 text-purple-400" />
                            </div>
                            <span className="text-sm font-medium">Para seniors</span>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Jobs({ jobs, filters, featured_jobs, recent_applications }: Props) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Simulate API call
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppLayout>
            <Head title="Trabajos" />

            {loading ? (
                <JobsSkeleton />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Contenido Principal */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Trabajos</h1>
                                <p className="text-white/70">
                                    Encuentra tu próxima oportunidad
                                </p>
                            </div>
                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                <Plus className="h-4 w-4 mr-2" />
                                Publicar Trabajo
                            </Button>
                        </div>

                        {/* Búsqueda y Filtros */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative md:col-span-2">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                                    <Input
                                        placeholder="Buscar trabajos, empresas, tecnologías..."
                                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                        defaultValue={filters.search || ''}
                                    />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                                    <Input
                                        placeholder="Ubicación"
                                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                        defaultValue={filters.location || ''}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20">
                                    <Filter className="h-3 w-3 mr-1" />
                                    Todos los filtros
                                </Badge>
                                <Badge 
                                    variant={filters.remote ? "default" : "outline"}
                                    className={filters.remote ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/jobs?remote=true" className="text-white">
                                        <Home className="h-3 w-3 mr-1" />
                                        Remoto
                                    </Link>
                                </Badge>
                                <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30">
                                    <Link href="/jobs?type=fulltime" className="text-white">Tiempo completo</Link>
                                </Badge>
                                <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30">
                                    <Link href="/jobs?type=contract" className="text-white">Por contrato</Link>
                                </Badge>
                            </div>
                        </div>

                        {/* Lista de Trabajos */}
                        <div className="space-y-4">
                            {jobs.data.length > 0 ? (
                                jobs.data.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))
                            ) : (
                                <Card className="apple-liquid-card">
                                    <CardContent className="pt-6 text-center">
                                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-white/70" />
                                        <h3 className="text-lg font-semibold mb-2 text-white">No hay trabajos disponibles</h3>
                                        <p className="text-white/70 mb-4">
                                            No se encontraron trabajos con los filtros seleccionados.
                                        </p>
                                        <div className="flex items-center justify-center gap-4">
                                            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-xl apple-liquid-button">
                                                Ajustar filtros
                                            </Button>
                                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Publicar trabajo
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <JobSidebar
                            featuredJobs={featured_jobs}
                            recentApplications={recent_applications}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
