import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Briefcase,
    Users,
    Calendar,
    MapPin,
    ExternalLink,
    Edit,
    Trash2,
    Eye,
    Plus,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

interface JobApplication {
    id: number;
    status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
    cover_letter?: string;
    resume_url?: string;
    created_at: string;
    user: User;
}

interface Job {
    id: number;
    title: string;
    company_name: string;
    description: string;
    requirements?: string[];
    salary_range?: string;
    location?: string;
    remote_friendly: boolean;
    is_active: boolean;
    applications_count: number;
    created_at: string;
    applications: JobApplication[];
}

interface Props {
    jobs: {
        data: Job[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'bg-green-500';
        case 'inactive': return 'bg-gray-500';
        default: return 'bg-blue-500';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'active': return 'Activo';
        case 'inactive': return 'Inactivo';
        default: return 'Todos';
    }
};

const getApplicationStatusIcon = (status: string) => {
    switch (status) {
        case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
        case 'interview': return <Clock className="h-4 w-4 text-blue-500" />;
        case 'reviewed': return <Eye className="h-4 w-4 text-purple-500" />;
        default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
};

const getApplicationStatusLabel = (status: string) => {
    switch (status) {
        case 'pending': return 'Pendiente';
        case 'reviewed': return 'Revisado';
        case 'interview': return 'Entrevista';
        case 'accepted': return 'Aceptado';
        case 'rejected': return 'Rechazado';
        default: return status;
    }
};

export default function MyJobs({ jobs, filters }: Props) {
    const [activeTab, setActiveTab] = useState('active');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');

    const handleStatusFilter = (status: string) => {
        setFilterStatus(status);
        router.get('/my-jobs', { status: status === 'all' ? undefined : status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleActive = async (jobId: number) => {
        try {
            await fetch(`/jobs/${jobId}/toggle-active`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            router.reload();
        } catch (error) {
            console.error('Error toggling job status:', error);
        }
    };

    const handleDelete = async (jobId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
            try {
                await fetch(`/jobs/${jobId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                router.reload();
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    };

    const activeJobs = jobs.data.filter(job => job.is_active);
    const inactiveJobs = jobs.data.filter(job => !job.is_active);

    return (
        <AppLayout title="Mis Trabajos" description="Gestiona los trabajos que has publicado">
            <Head title="Mis Trabajos" />

            <div className="w-full space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Mis Trabajos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los trabajos que has publicado
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/jobs/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Publicar Trabajo
                        </Link>
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <span className="text-sm font-medium">Filtrar por estado:</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('all')}
                            >
                                Todos ({jobs.total})
                            </Button>
                            <Button
                                variant={filterStatus === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('active')}
                            >
                                Activos ({activeJobs.length})
                            </Button>
                            <Button
                                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('inactive')}
                            >
                                Inactivos ({inactiveJobs.length})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de trabajos */}
                {jobs.data.length > 0 ? (
                    <div className="space-y-4">
                        {jobs.data.map((job) => (
                            <Card key={job.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold">{job.title}</h3>
                                                        <Badge
                                                            variant={job.is_active ? "default" : "secondary"}
                                                            className={getStatusColor(job.is_active ? 'active' : 'inactive')}
                                                        >
                                                            {job.is_active ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground mb-2">{job.company_name}</p>

                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                        {job.location && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{job.location}</span>
                                                            </div>
                                                        )}
                                                        {job.remote_friendly && (
                                                            <Badge variant="outline">Remoto</Badge>
                                                        )}
                                                        {job.salary_range && (
                                                            <span>{job.salary_range}</span>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{job.applications_count} aplicaciones</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {job.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Aplicaciones recientes */}
                                            {job.applications.length > 0 && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <h4 className="text-sm font-medium mb-2">Aplicaciones recientes:</h4>
                                                    <div className="space-y-2">
                                                        {job.applications.slice(0, 3).map((application) => (
                                                            <div key={application.id} className="flex items-center justify-between text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    {getApplicationStatusIcon(application.status)}
                                                                    <span className="font-medium">{application.user.full_name}</span>
                                                                    <span className="text-muted-foreground">@{application.user.username}</span>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {getApplicationStatusLabel(application.status)}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {job.applications.length > 3 && (
                                                        <Button variant="link" size="sm" asChild className="mt-2 p-0 h-auto">
                                                            <Link href={`/jobs/${job.id}/applications`}>
                                                                Ver todas las aplicaciones ({job.applications.length})
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/jobs/${job.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/jobs/${job.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleActive(job.id)}
                                            >
                                                {job.is_active ? 'Desactivar' : 'Activar'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(job.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">No has publicado trabajos aún</h3>
                            <p className="text-muted-foreground mb-4">
                                Comienza a publicar ofertas de trabajo para encontrar talento para tu empresa.
                            </p>
                            <Button asChild>
                                <Link href="/jobs/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Publicar primer trabajo
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Paginación */}
                {jobs && jobs.last_page && jobs.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {Array.from({ length: jobs.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === jobs.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => router.get('/my-jobs', {
                                        page,
                                        status: filterStatus === 'all' ? undefined : filterStatus
                                    })}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
