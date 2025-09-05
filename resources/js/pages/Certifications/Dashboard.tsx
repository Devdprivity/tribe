import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Trophy, 
    Award, 
    TrendingUp, 
    Clock, 
    Target, 
    BarChart3,
    Calendar,
    Download,
    Eye,
    RotateCcw,
    AlertTriangle,
    CheckCircle,
    Star,
    Users,
    BookOpen,
    Search,
    Filter,
    Plus,
    Medal,
    Zap,
    Globe
} from 'lucide-react';

interface UserCertification {
    id: number;
    certification: {
        id: number;
        name: string;
        category_label: string;
        level_label: string;
        level_color: string;
    };
    score: number;
    performance_grade: string;
    status: string;
    status_color: string;
    formatted_issued_at: string;
    formatted_expires_at: string | null;
    certificate_age: string;
    expiry_warning: string | null;
    certificate_number: string;
    certificate_url: string;
    is_public: boolean;
    badge_color: string;
}

interface AttemptHistory {
    id: number;
    certification: {
        id: number;
        name: string;
        category_label: string;
    };
    score: number | null;
    status_label: string;
    status_color: string;
    result_label: string;
    performance_grade: string;
    attempt_age: string;
    formatted_started_at: string;
    formatted_completed_at: string | null;
}

interface UserStats {
    total_certificates: number;
    active_certificates: number;
    expired_certificates: number;
    expiring_soon: number;
    average_score: number;
    highest_score: number;
    categories_covered: number;
    total_skills_validated: number;
    total_attempts: number;
    success_rate: number;
    total_study_time: number;
}

interface Props {
    user_certifications: UserCertification[];
    attempt_history: AttemptHistory[];
    user_stats: UserStats;
    recent_activity: Array<{
        type: 'certification_earned' | 'exam_completed' | 'exam_failed';
        certification: string;
        score?: number;
        date: string;
        description: string;
    }>;
    recommended_certifications: Array<{
        id: number;
        name: string;
        category_label: string;
        level_label: string;
        level_color: string;
        formatted_price: string;
        completion_count: number;
        passing_rate: number;
    }>;
    skills_progress: Array<{
        skill: string;
        certifications: number;
        level: string;
        progress: number;
    }>;
    achievements: Array<{
        title: string;
        description: string;
        earned_at: string;
        icon: string;
        color: string;
    }>;
}

export default function CertificationsDashboard({ 
    user_certifications,
    attempt_history,
    user_stats,
    recent_activity,
    recommended_certifications,
    skills_progress,
    achievements
}: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Filter certifications
    const filteredCertifications = user_certifications.filter(cert => {
        const matchesSearch = cert.certification.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || cert.certification.category_label === selectedCategory;
        const matchesStatus = !selectedStatus || cert.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Get unique categories
    const categories = [...new Set(user_certifications.map(cert => cert.certification.category_label))];

    const getPerformanceColor = (score: number): string => {
        if (score >= 95) return 'text-green-500';
        if (score >= 90) return 'text-blue-500';
        if (score >= 80) return 'text-yellow-500';
        if (score >= 70) return 'text-orange-500';
        return 'text-red-500';
    };

    const getAchievementIcon = (iconName: string) => {
        switch (iconName) {
            case 'trophy': return Trophy;
            case 'medal': return Medal;
            case 'star': return Star;
            case 'zap': return Zap;
            case 'target': return Target;
            default: return Award;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mi Panel de Certificaciones" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Mi Panel de Certificaciones</h1>
                            <p className="text-gray-400">Gestiona y revisa tus certificaciones técnicas</p>
                        </div>
                        <Button onClick={() => window.location.href = '/certifications'} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Explorar Certificaciones
                        </Button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{user_stats.total_certificates}</p>
                                <p className="text-gray-400">Certificaciones</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <Target className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{user_stats.average_score}%</p>
                                <p className="text-gray-400">Puntuación Promedio</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{user_stats.success_rate}%</p>
                                <p className="text-gray-400">Tasa de Éxito</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{user_stats.categories_covered}</p>
                                <p className="text-gray-400">Categorías Dominadas</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Alerts */}
                    {(user_stats.expiring_soon > 0 || user_stats.expired_certificates > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {user_stats.expiring_soon > 0 && (
                                <Card className="bg-yellow-50/5 border-yellow-600">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                            <div>
                                                <p className="text-yellow-500 font-medium">
                                                    {user_stats.expiring_soon} certificación(es) por vencer
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Considera renovarlas pronto
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {user_stats.expired_certificates > 0 && (
                                <Card className="bg-red-50/5 border-red-600">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <Clock className="h-6 w-6 text-red-500" />
                                            <div>
                                                <p className="text-red-500 font-medium">
                                                    {user_stats.expired_certificates} certificación(es) expirada(s)
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Renuévalas para mantener tu perfil actualizado
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="overview">Resumen</TabsTrigger>
                                <TabsTrigger value="certificates">Certificados</TabsTrigger>
                                <TabsTrigger value="attempts">Intentos</TabsTrigger>
                                <TabsTrigger value="skills">Skills</TabsTrigger>
                                <TabsTrigger value="achievements">Logros</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                {/* Recent Activity */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Actividad Reciente
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recent_activity.map((activity, index) => (
                                                <div key={index} className="flex items-start space-x-3 p-3 bg-dark-200 rounded-lg">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        activity.type === 'certification_earned' 
                                                            ? 'bg-green-600' 
                                                            : activity.type === 'exam_completed'
                                                            ? 'bg-blue-600'
                                                            : 'bg-red-600'
                                                    }`}>
                                                        {activity.type === 'certification_earned' ? (
                                                            <Trophy className="h-5 w-5 text-white" />
                                                        ) : activity.type === 'exam_completed' ? (
                                                            <CheckCircle className="h-5 w-5 text-white" />
                                                        ) : (
                                                            <RotateCcw className="h-5 w-5 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium">{activity.certification}</p>
                                                        <p className="text-sm text-gray-400">{activity.description}</p>
                                                        {activity.score && (
                                                            <p className="text-sm text-gray-500">Puntuación: {activity.score}%</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">{activity.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Performance Chart */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <BarChart3 className="mr-2 h-5 w-5" />
                                            Resumen de Rendimiento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-green-500">{user_stats.highest_score}%</p>
                                                <p className="text-gray-400">Mejor Puntuación</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-blue-500">{user_stats.total_attempts}</p>
                                                <p className="text-gray-400">Intentos Totales</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-purple-500">
                                                    {Math.round(user_stats.total_study_time / 60)}h
                                                </p>
                                                <p className="text-gray-400">Tiempo de Estudio</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="certificates" className="space-y-6">
                                {/* Filters */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Buscar certificaciones..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 bg-dark-200 border-dark-300 text-white"
                                                />
                                            </div>
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger className="w-48 bg-dark-200 border-dark-300 text-white">
                                                    <SelectValue placeholder="Categoría" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-dark-200 border-dark-300">
                                                    <SelectItem value="all">Todas</SelectItem>
                                                    {categories.map(category => (
                                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                <SelectTrigger className="w-48 bg-dark-200 border-dark-300 text-white">
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-dark-200 border-dark-300">
                                                    <SelectItem value="all">Todos</SelectItem>
                                                    <SelectItem value="Vigente">Vigente</SelectItem>
                                                    <SelectItem value="Por Vencer">Por Vencer</SelectItem>
                                                    <SelectItem value="Expirado">Expirado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Certifications List */}
                                <div className="space-y-4">
                                    {filteredCertifications.map((cert) => (
                                        <Card key={cert.id} className="bg-dark-100 border-dark-200 hover:border-blue-500 transition-colors">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <h3 className="text-lg font-semibold text-white">
                                                                {cert.certification.name}
                                                            </h3>
                                                            <Badge variant="secondary" className={cert.certification.level_color}>
                                                                {cert.certification.level_label}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {cert.certification.category_label}
                                                            </Badge>
                                                            <Badge variant="outline" className={cert.status_color}>
                                                                {cert.status}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-400">Puntuación</p>
                                                                <p className={`font-semibold ${getPerformanceColor(cert.score)}`}>
                                                                    {cert.score}% ({cert.performance_grade})
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400">Obtenido</p>
                                                                <p className="text-white">{cert.formatted_issued_at}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400">Vencimiento</p>
                                                                <p className="text-white">
                                                                    {cert.formatted_expires_at || 'Sin vencimiento'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400">Certificado</p>
                                                                <p className="text-white font-mono text-xs">
                                                                    {cert.certificate_number}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {cert.expiry_warning && (
                                                            <div className="mt-3 p-2 bg-yellow-50/5 border-l-4 border-yellow-500 rounded">
                                                                <p className="text-yellow-500 text-sm flex items-center">
                                                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                                                    {cert.expiry_warning}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => window.open(cert.certificate_url, '_blank')}
                                                        >
                                                            <Download className="mr-1 h-4 w-4" />
                                                            Descargar
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => window.location.href = `/certifications/${cert.certification.id}`}
                                                        >
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            Ver
                                                        </Button>
                                                        {cert.is_public && (
                                                            <Globe className="h-4 w-4 text-green-500" title="Público en tu perfil" />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {filteredCertifications.length === 0 && (
                                        <Card className="bg-dark-100 border-dark-200">
                                            <CardContent className="text-center py-12">
                                                <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    No se encontraron certificaciones
                                                </h3>
                                                <p className="text-gray-400 mb-4">
                                                    Ajusta tus filtros o explora nuevas certificaciones
                                                </p>
                                                <Button onClick={() => window.location.href = '/certifications'}>
                                                    Explorar Certificaciones
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="attempts" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white">Historial de Intentos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {attempt_history.map((attempt) => (
                                                <div key={attempt.id} className="flex items-center justify-between p-4 bg-dark-200 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-white font-medium">
                                                                {attempt.certification.name}
                                                            </h4>
                                                            <Badge variant="outline">
                                                                {attempt.certification.category_label}
                                                            </Badge>
                                                            <Badge variant="outline" className={attempt.status_color}>
                                                                {attempt.status_label}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                                                            <div>
                                                                <span>Iniciado: {attempt.formatted_started_at}</span>
                                                            </div>
                                                            <div>
                                                                <span>
                                                                    {attempt.formatted_completed_at 
                                                                        ? `Completado: ${attempt.formatted_completed_at}`
                                                                        : 'En progreso'
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span>{attempt.attempt_age}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {attempt.score !== null && (
                                                            <>
                                                                <p className={`text-lg font-semibold ${getPerformanceColor(attempt.score)}`}>
                                                                    {attempt.score}%
                                                                </p>
                                                                <p className="text-sm text-gray-400">
                                                                    {attempt.performance_grade}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="skills" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Star className="mr-2 h-5 w-5" />
                                            Progreso de Habilidades
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {skills_progress.map((skill, index) => (
                                                <div key={index} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-white font-medium">{skill.skill}</h4>
                                                            <p className="text-sm text-gray-400">
                                                                {skill.certifications} certificación(es) • Nivel {skill.level}
                                                            </p>
                                                        </div>
                                                        <span className="text-white font-semibold">{skill.progress}%</span>
                                                    </div>
                                                    <Progress value={skill.progress} className="h-2" />
                                                </div>
                                            ))}

                                            {skills_progress.length === 0 && (
                                                <div className="text-center py-8">
                                                    <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                                    <p className="text-gray-400">
                                                        Completa certificaciones para ver tu progreso de habilidades
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="achievements" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Medal className="mr-2 h-5 w-5" />
                                            Logros Desbloqueados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {achievements.map((achievement, index) => {
                                                const Icon = getAchievementIcon(achievement.icon);
                                                return (
                                                    <div key={index} className="flex items-start space-x-3 p-4 bg-dark-200 rounded-lg">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.color}`}>
                                                            <Icon className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-medium mb-1">
                                                                {achievement.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-400 mb-2">
                                                                {achievement.description}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Desbloqueado: {achievement.earned_at}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {achievements.length === 0 && (
                                            <div className="text-center py-8">
                                                <Medal className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                                <p className="text-gray-400">
                                                    Completa certificaciones para desbloquear logros
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Estadísticas Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Certificaciones activas:</span>
                                    <span className="text-green-500 font-semibold">{user_stats.active_certificates}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Por vencer:</span>
                                    <span className="text-yellow-500 font-semibold">{user_stats.expiring_soon}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Expiradas:</span>
                                    <span className="text-red-500 font-semibold">{user_stats.expired_certificates}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Skills validadas:</span>
                                    <span className="text-white font-semibold">{user_stats.total_skills_validated}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommended Certifications */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white">Recomendadas para Ti</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recommended_certifications.slice(0, 3).map((cert) => (
                                        <div key={cert.id} 
                                             className="p-3 bg-dark-200 rounded-lg hover:bg-dark-300 cursor-pointer transition-colors"
                                             onClick={() => window.location.href = `/certifications/${cert.id}`}>
                                            <h4 className="text-white text-sm font-medium mb-1">{cert.name}</h4>
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {cert.level_label}
                                                </Badge>
                                                <span className="text-xs text-gray-400">{cert.formatted_price}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{cert.completion_count} certificados</span>
                                                <span>{cert.passing_rate}% éxito</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="w-full mt-4"
                                    onClick={() => window.location.href = '/certifications'}
                                >
                                    Ver Todas
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Progress Summary */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white">Tu Progreso</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Nivel de Experiencia</span>
                                        <span className="text-white font-semibold">
                                            {user_stats.total_certificates >= 10 ? 'Experto' : 
                                             user_stats.total_certificates >= 5 ? 'Avanzado' : 
                                             user_stats.total_certificates >= 2 ? 'Intermedio' : 'Principiante'}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={Math.min((user_stats.total_certificates / 10) * 100, 100)} 
                                        className="h-2" 
                                    />
                                </div>
                                
                                <div className="pt-4 border-t border-dark-300 text-center">
                                    <p className="text-sm text-gray-400 mb-2">
                                        ¡Sigue así! Tu próximo objetivo:
                                    </p>
                                    <p className="text-white font-medium">
                                        {user_stats.total_certificates < 2 ? 'Primera certificación' :
                                         user_stats.total_certificates < 5 ? 'Nivel Intermedio (5 certs)' :
                                         user_stats.total_certificates < 10 ? 'Nivel Avanzado (10 certs)' :
                                         '¡Eres un experto!'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}