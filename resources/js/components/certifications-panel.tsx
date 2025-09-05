import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
    Award, 
    Trophy, 
    Target, 
    Clock, 
    Star, 
    TrendingUp, 
    ChevronRight,
    BookOpen,
    Zap,
    AlertTriangle
} from 'lucide-react';

interface UserCertificationStats {
    total_certificates: number;
    active_certificates: number;
    expired_certificates: number;
    expiring_soon: number;
    average_score: number;
    highest_score: number;
    categories_covered: number;
    recent_activity: Array<{
        certification: string;
        type: 'earned' | 'failed' | 'in_progress';
        date: string;
        score?: number;
    }>;
    recommended: Array<{
        id: number;
        name: string;
        category: string;
        level: string;
        popularity: number;
    }>;
    current_exam?: {
        certification: string;
        time_remaining: number;
        progress: number;
    };
}

export function CertificationsPanel() {
    const [stats, setStats] = useState<UserCertificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const fetchCertificationStats = async () => {
        try {
            const response = await fetch('/api/certifications/user-stats', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching certification stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificationStats();
        
        // Actualizar cada 2 minutos
        const interval = setInterval(fetchCertificationStats, 120000);
        return () => clearInterval(interval);
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'earned': return <Trophy className="h-3 w-3 text-yellow-500" />;
            case 'failed': return <AlertTriangle className="h-3 w-3 text-red-500" />;
            case 'in_progress': return <Clock className="h-3 w-3 text-blue-500" />;
            default: return <BookOpen className="h-3 w-3 text-gray-500" />;
        }
    };

    const getActivityColor = (type: string): string => {
        switch (type) {
            case 'earned': return 'bg-yellow-500/10 border-yellow-500/20';
            case 'failed': return 'bg-red-500/10 border-red-500/20';
            case 'in_progress': return 'bg-blue-500/10 border-blue-500/20';
            default: return 'bg-gray-500/10 border-gray-500/20';
        }
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="space-y-3">
                    <div className="h-4 bg-white/5 rounded animate-pulse"></div>
                    <div className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-white/5 rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-4">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 text-center">
                        <Award className="h-8 w-8 mx-auto mb-2 text-white/50" />
                        <p className="text-sm text-white/70 mb-3">¡Empieza tu journey de certificaciones!</p>
                        <Button asChild size="sm" className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50">
                            <Link href="/certifications">
                                Explorar
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="border-b border-white/10">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        Certificaciones
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                    </Button>
                </div>

                {/* Examen en Progreso (Prioridad Máxima) */}
                {stats.current_exam && (
                    <Card className="bg-blue-500/10 border-blue-500/20 mb-3">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-3 w-3 text-blue-400" />
                                <span className="text-xs font-medium text-blue-400">Examen en Progreso</span>
                            </div>
                            <p className="text-sm text-white font-medium mb-2">{stats.current_exam.certification}</p>
                            <div className="space-y-1">
                                <Progress value={stats.current_exam.progress} className="h-1" />
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/70">{stats.current_exam.progress}% completado</span>
                                    <span className="text-blue-400">{Math.floor(stats.current_exam.time_remaining / 60)}m restantes</span>
                                </div>
                            </div>
                            <Button asChild size="sm" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <Link href="/certifications/current-exam">
                                    Continuar Examen
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Compactas */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span className="text-lg font-bold text-white">{stats.total_certificates}</span>
                        </div>
                        <p className="text-xs text-white/70">Certificados</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span className="text-lg font-bold text-white">{stats.average_score}%</span>
                        </div>
                        <p className="text-xs text-white/70">Promedio</p>
                    </div>
                </div>

                {/* Alertas Importantes */}
                {(stats.expiring_soon > 0 || stats.expired_certificates > 0) && (
                    <div className="space-y-2 mb-3">
                        {stats.expiring_soon > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-yellow-400">
                                    {stats.expiring_soon} certificado{stats.expiring_soon > 1 ? 's' : ''} por vencer
                                </span>
                            </div>
                        )}
                        {stats.expired_certificates > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <Clock className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-400">
                                    {stats.expired_certificates} expirado{stats.expired_certificates > 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Panel Expandido */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3">
                    {/* Actividad Reciente */}
                    {stats.recent_activity.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                Actividad Reciente
                            </h4>
                            <div className="space-y-2">
                                {stats.recent_activity.slice(0, 3).map((activity, index) => (
                                    <div key={index} className={`flex items-start gap-2 p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                                        {getActivityIcon(activity.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-white truncate">
                                                {activity.certification}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-white/60">{activity.date}</span>
                                                {activity.score && (
                                                    <span className="text-xs font-medium text-white">
                                                        {activity.score}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recomendaciones */}
                    {stats.recommended.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                Recomendadas
                            </h4>
                            <div className="space-y-2">
                                {stats.recommended.slice(0, 2).map((cert) => (
                                    <Link key={cert.id} href={`/certifications/${cert.id}`}>
                                        <div className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200">
                                            <div className="flex items-start justify-between mb-1">
                                                <p className="text-xs font-medium text-white truncate flex-1 mr-2">
                                                    {cert.name}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-2 w-2 text-yellow-500" />
                                                    <span className="text-xs text-yellow-400">{cert.popularity}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-xs h-4 px-1">
                                                    {cert.category}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs h-4 px-1">
                                                    {cert.level}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón para Dashboard */}
                    <Button asChild variant="outline" className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-white/30">
                        <Link href="/certifications/dashboard">
                            <BookOpen className="mr-2 h-3 w-3" />
                            Mi Dashboard
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}