import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown,
    Users, 
    Trophy, 
    Clock,
    Target,
    DollarSign,
    Calendar,
    Download,
    Filter,
    RefreshCw,
    Award,
    BookOpen,
    AlertTriangle,
    CheckCircle,
    Star,
    Globe,
    Activity,
    PieChart,
    LineChart
} from 'lucide-react';

interface AnalyticsData {
    global_stats: {
        total_certifications: number;
        total_attempts: number;
        total_certificates_issued: number;
        average_pass_rate: number;
        total_revenue: number;
        active_users: number;
        growth_rate: number;
        completion_rate: number;
    };
    time_series: {
        attempts_by_day: Array<{
            date: string;
            count: number;
        }>;
        certificates_by_month: Array<{
            month: string;
            count: number;
            revenue: number;
        }>;
        pass_rates_trend: Array<{
            month: string;
            rate: number;
        }>;
    };
    category_breakdown: Array<{
        category: string;
        label: string;
        certifications_count: number;
        attempts_count: number;
        pass_rate: number;
        revenue: number;
        color: string;
    }>;
    level_breakdown: Array<{
        level: string;
        label: string;
        certifications_count: number;
        attempts_count: number;
        pass_rate: number;
        average_score: number;
        color: string;
    }>;
    top_performing: {
        certifications: Array<{
            id: number;
            name: string;
            category: string;
            attempts: number;
            certificates_issued: number;
            pass_rate: number;
            revenue: number;
        }>;
        users: Array<{
            id: number;
            name: string;
            certificates_count: number;
            average_score: number;
            total_attempts: number;
        }>;
    };
    recent_activity: Array<{
        type: 'exam_completed' | 'certificate_issued' | 'new_user' | 'certification_created';
        user?: string;
        certification?: string;
        timestamp: string;
        details: string;
    }>;
    problem_areas: Array<{
        type: 'low_pass_rate' | 'high_abandonment' | 'technical_issues';
        certification: string;
        category: string;
        metric: number;
        description: string;
        severity: 'high' | 'medium' | 'low';
    }>;
    geographic_data: Array<{
        country: string;
        users_count: number;
        certificates_count: number;
        revenue: number;
    }>;
}

interface Props {
    analytics: AnalyticsData;
    date_range: string;
    filters: {
        category?: string;
        level?: string;
        date_range?: string;
    };
    categories: Record<string, string>;
    levels: Record<string, string>;
}

export default function CertificationAnalytics({ analytics, date_range, filters, categories, levels }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDateRange, setSelectedDateRange] = useState(filters.date_range || '30');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedLevel, setSelectedLevel] = useState(filters.level || '');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            window.location.reload();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleFilterChange = () => {
        const params = new URLSearchParams();
        if (selectedDateRange) params.append('date_range', selectedDateRange);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedLevel) params.append('level', selectedLevel);
        
        window.location.href = `/admin/certifications/analytics?${params.toString()}`;
    };

    const handleExport = (format: string) => {
        const params = new URLSearchParams();
        params.append('format', format);
        if (selectedDateRange) params.append('date_range', selectedDateRange);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedLevel) params.append('level', selectedLevel);
        
        window.open(`/admin/certifications/analytics/export?${params.toString()}`, '_blank');
    };

    const getSeverityColor = (severity: string): string => {
        switch (severity) {
            case 'high': return 'text-red-500 bg-red-50/10 border-red-500';
            case 'medium': return 'text-yellow-500 bg-yellow-50/10 border-yellow-500';
            case 'low': return 'text-blue-500 bg-blue-50/10 border-blue-500';
            default: return 'text-gray-500';
        }
    };

    const getGrowthIcon = (rate: number) => {
        return rate >= 0 
            ? <TrendingUp className="h-4 w-4 text-green-500" />
            : <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    const getGrowthColor = (rate: number): string => {
        return rate >= 0 ? 'text-green-500' : 'text-red-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Analíticas de Certificaciones" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Analíticas de Certificaciones</h1>
                        <p className="text-gray-400">Dashboard completo de métricas y tendencias</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                            <SelectTrigger className="w-32 bg-dark-200 border-dark-300 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-200 border-dark-300">
                                <SelectItem value="7">7 días</SelectItem>
                                <SelectItem value="30">30 días</SelectItem>
                                <SelectItem value="90">90 días</SelectItem>
                                <SelectItem value="365">1 año</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleFilterChange} className="bg-blue-600 hover:bg-blue-700">
                            <Filter className="mr-2 h-4 w-4" />
                            Aplicar
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Intentos Totales</p>
                                    <p className="text-2xl font-bold text-white">{analytics.global_stats.total_attempts.toLocaleString()}</p>
                                    <div className="flex items-center mt-1">
                                        {getGrowthIcon(analytics.global_stats.growth_rate)}
                                        <span className={`text-sm ml-1 ${getGrowthColor(analytics.global_stats.growth_rate)}`}>
                                            {analytics.global_stats.growth_rate > 0 ? '+' : ''}{analytics.global_stats.growth_rate}%
                                        </span>
                                    </div>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Certificados Emitidos</p>
                                    <p className="text-2xl font-bold text-white">{analytics.global_stats.total_certificates_issued.toLocaleString()}</p>
                                    <div className="flex items-center mt-1">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-500 ml-1">
                                            {analytics.global_stats.completion_rate}% completado
                                        </span>
                                    </div>
                                </div>
                                <Trophy className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Tasa de Aprobación</p>
                                    <p className="text-2xl font-bold text-white">{analytics.global_stats.average_pass_rate}%</p>
                                    <div className="mt-2">
                                        <Progress value={analytics.global_stats.average_pass_rate} className="h-2" />
                                    </div>
                                </div>
                                <Target className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Ingresos Totales</p>
                                    <p className="text-2xl font-bold text-white">${analytics.global_stats.total_revenue.toLocaleString()}</p>
                                    <div className="flex items-center mt-1">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-500 ml-1">
                                            {analytics.global_stats.active_users} usuarios activos
                                        </span>
                                    </div>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Resumen</TabsTrigger>
                        <TabsTrigger value="categories">Categorías</TabsTrigger>
                        <TabsTrigger value="levels">Niveles</TabsTrigger>
                        <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                        <TabsTrigger value="users">Usuarios</TabsTrigger>
                        <TabsTrigger value="issues">Problemas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Time Series Chart */}
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <LineChart className="mr-2 h-5 w-5" />
                                        Tendencia de Intentos (Últimos 30 días)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.time_series.attempts_by_day.map((day, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">{day.date}</span>
                                                <div className="flex items-center">
                                                    <div className="w-32 bg-dark-300 rounded-full h-2 mr-3">
                                                        <div 
                                                            className="bg-blue-500 h-2 rounded-full" 
                                                            style={{ width: `${Math.min((day.count / Math.max(...analytics.time_series.attempts_by_day.map(d => d.count))) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-white w-8">{day.count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Activity className="mr-2 h-5 w-5" />
                                        Actividad Reciente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.recent_activity.map((activity, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    activity.type === 'certificate_issued' ? 'bg-green-600' :
                                                    activity.type === 'exam_completed' ? 'bg-blue-600' :
                                                    activity.type === 'new_user' ? 'bg-purple-600' :
                                                    'bg-yellow-600'
                                                }`}>
                                                    {activity.type === 'certificate_issued' && <Award className="h-4 w-4 text-white" />}
                                                    {activity.type === 'exam_completed' && <CheckCircle className="h-4 w-4 text-white" />}
                                                    {activity.type === 'new_user' && <Users className="h-4 w-4 text-white" />}
                                                    {activity.type === 'certification_created' && <BookOpen className="h-4 w-4 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm">{activity.details}</p>
                                                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Monthly Revenue Chart */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <BarChart3 className="mr-2 h-5 w-5" />
                                    Ingresos Mensuales y Certificados Emitidos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {analytics.time_series.certificates_by_month.map((month, index) => (
                                        <div key={index} className="text-center p-4 bg-dark-200 rounded-lg">
                                            <h4 className="text-white font-medium mb-2">{month.month}</h4>
                                            <p className="text-2xl font-bold text-green-500 mb-1">${month.revenue.toLocaleString()}</p>
                                            <p className="text-sm text-gray-400">{month.count} certificados</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-6">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <PieChart className="mr-2 h-5 w-5" />
                                    Análisis por Categorías
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {analytics.category_breakdown.map((category, index) => (
                                        <div key={index} className="p-4 bg-dark-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <div className={`w-4 h-4 rounded mr-3`} style={{ backgroundColor: category.color }}></div>
                                                    <h4 className="text-white font-medium">{category.label}</h4>
                                                </div>
                                                <Badge variant="outline">{category.certifications_count} certificaciones</Badge>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Intentos</p>
                                                    <p className="text-white font-semibold">{category.attempts_count.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Tasa de Aprobación</p>
                                                    <p className="text-white font-semibold">{category.pass_rate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Ingresos</p>
                                                    <p className="text-white font-semibold">${category.revenue.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <Progress value={category.pass_rate} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="levels" className="space-y-6">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Star className="mr-2 h-5 w-5" />
                                    Análisis por Niveles de Dificultad
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {analytics.level_breakdown.map((level, index) => (
                                        <div key={index} className="p-4 bg-dark-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <Badge variant="secondary" className={level.color}>
                                                        {level.label}
                                                    </Badge>
                                                </div>
                                                <span className="text-sm text-gray-400">{level.certifications_count} certificaciones</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Intentos</p>
                                                    <p className="text-white font-semibold">{level.attempts_count.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Tasa de Aprobación</p>
                                                    <p className="text-white font-semibold">{level.pass_rate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Puntuación Promedio</p>
                                                    <p className="text-white font-semibold">{level.average_score}%</p>
                                                </div>
                                                <div>
                                                    <Progress value={level.pass_rate} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Performing Certifications */}
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                                        Certificaciones Más Populares
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.top_performing.certifications.map((cert, index) => (
                                            <div key={cert.id} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-medium">{cert.name}</h4>
                                                        <p className="text-xs text-gray-400">{cert.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-semibold">{cert.attempts} intentos</p>
                                                    <p className="text-xs text-green-500">{cert.pass_rate}% aprobación</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Geographic Distribution */}
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Globe className="mr-2 h-5 w-5 text-blue-500" />
                                        Distribución Geográfica
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics.geographic_data.map((country, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-white">{country.country}</span>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm text-gray-400">{country.users_count} usuarios</span>
                                                    <span className="text-sm text-blue-400">{country.certificates_count} certificados</span>
                                                    <span className="text-sm text-green-400">${country.revenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Users className="mr-2 h-5 w-5" />
                                    Usuarios Destacados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.top_performing.users.map((user, index) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 bg-dark-200 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium">{user.name}</h4>
                                                    <p className="text-sm text-gray-400">{user.certificates_count} certificados</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-semibold">{user.average_score}%</p>
                                                <p className="text-xs text-gray-400">promedio</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="issues" className="space-y-6">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                                    Áreas Problemáticas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.problem_areas.map((problem, index) => (
                                        <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(problem.severity)}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <AlertTriangle className={`h-4 w-4 mr-2 ${
                                                            problem.severity === 'high' ? 'text-red-500' :
                                                            problem.severity === 'medium' ? 'text-yellow-500' :
                                                            'text-blue-500'
                                                        }`} />
                                                        <h4 className="text-white font-medium">{problem.certification}</h4>
                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                            {problem.category}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-300 text-sm mb-2">{problem.description}</p>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-400 mr-2">Métrica:</span>
                                                        <span className="text-white font-semibold">{problem.metric}%</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`${
                                                    problem.severity === 'high' ? 'border-red-500 text-red-500' :
                                                    problem.severity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                                    'border-blue-500 text-blue-500'
                                                }`}>
                                                    {problem.severity === 'high' ? 'Alta' :
                                                     problem.severity === 'medium' ? 'Media' : 'Baja'} Prioridad
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Export Actions */}
                <Card className="bg-dark-100 border-dark-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium mb-2">Exportar Datos</h3>
                                <p className="text-gray-400 text-sm">Descarga los datos de analíticas en diferentes formatos</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => handleExport('csv')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    CSV
                                </Button>
                                <Button variant="outline" onClick={() => handleExport('excel')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Excel
                                </Button>
                                <Button variant="outline" onClick={() => handleExport('pdf')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    PDF Report
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}