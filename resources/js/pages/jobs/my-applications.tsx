import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Briefcase,
    Calendar,
    MapPin,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    FileText,
    Link as LinkIcon
} from 'lucide-react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

interface Job {
    id: number;
    title: string;
    company_name: string;
    location?: string;
    remote_friendly: boolean;
    salary_range?: string;
    poster: User;
}

interface JobApplication {
    id: number;
    status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
    cover_letter?: string;
    resume_url?: string;
    created_at: string;
    job: Job;
}

interface Props {
    applications: {
        data: JobApplication[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
    };
}

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

const getApplicationStatusColor = (status: string) => {
    switch (status) {
        case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
        case 'interview': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'reviewed': return 'bg-purple-100 text-purple-800 border-purple-200';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
};

export default function MyApplications({ applications, filters }: Props) {
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');

    const handleStatusFilter = (status: string) => {
        setFilterStatus(status);
        router.get('/my-applications', { status: status === 'all' ? undefined : status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const pendingApplications = applications.data.filter(app => app.status === 'pending');
    const reviewedApplications = applications.data.filter(app => app.status === 'reviewed');
    const interviewApplications = applications.data.filter(app => app.status === 'interview');
    const acceptedApplications = applications.data.filter(app => app.status === 'accepted');
    const rejectedApplications = applications.data.filter(app => app.status === 'rejected');

    return (
        <AppLayout title="Mis Aplicaciones" description="Revisa el estado de tus aplicaciones a trabajos">
            <Head title="Mis Aplicaciones" />

            <div className="w-full space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Mis Aplicaciones</h1>
                    <p className="text-muted-foreground">
                        Revisa el estado de tus aplicaciones a trabajos
                    </p>
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
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('all')}
                            >
                                Todas ({applications.total})
                            </Button>
                            <Button
                                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('pending')}
                            >
                                Pendientes ({pendingApplications.length})
                            </Button>
                            <Button
                                variant={filterStatus === 'reviewed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('reviewed')}
                            >
                                Revisadas ({reviewedApplications.length})
                            </Button>
                            <Button
                                variant={filterStatus === 'interview' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('interview')}
                            >
                                Entrevistas ({interviewApplications.length})
                            </Button>
                            <Button
                                variant={filterStatus === 'accepted' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('accepted')}
                            >
                                Aceptadas ({acceptedApplications.length})
                            </Button>
                            <Button
                                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('rejected')}
                            >
                                Rechazadas ({rejectedApplications.length})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de aplicaciones */}
                {applications.data.length > 0 ? (
                    <div className="space-y-4">
                        {applications.data.map((application) => (
                            <Card key={application.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="flex items-center gap-2">
                                                    {getApplicationStatusIcon(application.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold">{application.job.title}</h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={getApplicationStatusColor(application.status)}
                                                        >
                                                            {getApplicationStatusLabel(application.status)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground mb-2">{application.job.company_name}</p>

                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                        {application.job.location && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{application.job.location}</span>
                                                            </div>
                                                        )}
                                                        {application.job.remote_friendly && (
                                                            <Badge variant="outline">Remoto</Badge>
                                                        )}
                                                        {application.job.salary_range && (
                                                            <span>{application.job.salary_range}</span>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>Aplicado el {new Date(application.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Información adicional de la aplicación */}
                                                    <div className="space-y-2">
                                                        {application.cover_letter && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-muted-foreground">Carta de presentación incluida</span>
                                                            </div>
                                                        )}
                                                        {application.resume_url && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                                <a
                                                                    href={application.resume_url}
                                                                    target="_blank"
                                                                    rel="noopener"
                                                                    className="text-primary hover:underline"
                                                                >
                                                                    Ver CV
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/jobs/${application.job.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    Ver Trabajo
                                                </Link>
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
                            <h3 className="text-lg font-medium mb-2">
                                {filterStatus !== 'all' ? 'No tienes aplicaciones con este estado' : 'No has aplicado a trabajos aún'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {filterStatus !== 'all'
                                    ? 'Intenta con otro filtro o aplica a más trabajos.'
                                    : 'Explora las ofertas de trabajo disponibles y aplica a las que te interesen.'
                                }
                            </p>
                            <Button asChild>
                                <Link href="/jobs">
                                    Explorar trabajos
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Paginación */}
                {applications && applications.last_page && applications.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {Array.from({ length: applications.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === applications.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => router.get('/my-applications', {
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
