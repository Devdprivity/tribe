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
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {job.company_name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:underline">
                                    {job.title}
                                </Link>
                                {job.has_applied && (
                                    <Badge variant="secondary">Aplicado</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building className="h-4 w-4" />
                                <span className="font-medium">{job.company_name}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(job.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
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
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                                {job.location}
                                {job.remote_friendly && (
                                    <Badge variant="outline" className="ml-2">
                                        Remoto
                                    </Badge>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatSalary(job.salary_range)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{job.applications_count} aplicaciones</span>
                        </div>
                    </div>

                    {/* Descripción */}
                    <CardDescription className="line-clamp-3">
                        {job.description}
                    </CardDescription>

                    {/* Requisitos principales */}
                    {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 4).map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {req}
                                </Badge>
                            ))}
                            {job.requirements.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                    +{job.requirements.length - 4} más
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Por @{job.posted_by.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/jobs/${job.id}`}>
                                    Ver detalles
                                </Link>
                            </Button>
                            {!job.has_applied && (
                                <Button size="sm">
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Destacados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {featuredJobs.slice(0, 3).map((job) => (
                            <div key={job.id} className="border-l-2 border-primary pl-4">
                                <Link href={`/jobs/${job.id}`} className="block">
                                    <h4 className="font-medium hover:underline">{job.title}</h4>
                                    <p className="text-sm text-muted-foreground">{job.company_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{job.location}</span>
                                        {job.remote_friendly && (
                                            <Badge variant="outline" className="text-xs">
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Mis Aplicaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentApplications.slice(0, 3).map((job) => (
                            <div key={job.id} className="flex items-center gap-3">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                    <Link href={`/jobs/${job.id}`} className="block">
                                        <p className="font-medium text-sm hover:underline">{job.title}</p>
                                        <p className="text-xs text-muted-foreground">{job.company_name}</p>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        <Link href="/jobs/applications" className="text-sm text-primary hover:underline">
                            Ver todas las aplicaciones →
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Filtros rápidos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link href="/jobs?remote=true" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            <span className="text-sm">Trabajos remotos</span>
                        </div>
                    </Link>
                    <Link href="/jobs?level=junior" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">Para juniors</span>
                        </div>
                    </Link>
                    <Link href="/jobs?level=senior" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">Para seniors</span>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Jobs({ jobs, filters, featured_jobs, recent_applications }: Props) {
    return (
        <AppLayout>
            <Head title="Trabajos" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Contenido Principal */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Trabajos</h1>
                            <p className="text-muted-foreground">
                                Encuentra tu próxima oportunidad
                            </p>
                        </div>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Publicar Trabajo
                        </Button>
                    </div>

                    {/* Búsqueda y Filtros */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar trabajos, empresas, tecnologías..."
                                    className="pl-10"
                                    defaultValue={filters.search || ''}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Ubicación"
                                    className="pl-10"
                                    defaultValue={filters.location || ''}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="cursor-pointer">
                                <Filter className="h-3 w-3 mr-1" />
                                Todos los filtros
                            </Badge>
                            <Badge variant={filters.remote ? "default" : "outline"}>
                                <Link href="/jobs?remote=true">
                                    <Home className="h-3 w-3 mr-1" />
                                    Remoto
                                </Link>
                            </Badge>
                            <Badge variant="outline">
                                <Link href="/jobs?type=fulltime">Tiempo completo</Link>
                            </Badge>
                            <Badge variant="outline">
                                <Link href="/jobs?type=contract">Por contrato</Link>
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
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">No hay trabajos disponibles</h3>
                                    <p className="text-muted-foreground mb-4">
                                        No se encontraron trabajos con los filtros seleccionados.
                                    </p>
                                    <div className="flex items-center justify-center gap-4">
                                        <Button variant="outline">
                                            Ajustar filtros
                                        </Button>
                                        <Button>
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
        </AppLayout>
    );
}
