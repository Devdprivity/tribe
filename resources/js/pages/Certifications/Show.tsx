import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Clock, 
    Trophy, 
    Star, 
    Users, 
    BookOpen, 
    CheckCircle, 
    XCircle,
    AlertTriangle,
    Target,
    Award,
    TrendingUp,
    Calendar,
    DollarSign,
    Shield
} from 'lucide-react';

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
    max_attempts: number;
    is_premium: boolean;
    is_active: boolean;
    skills_covered: string[];
    prerequisites: any[];
    exam_structure: {
        total_questions: number;
        sections: Array<{
            name: string;
            questions: number;
            weight: number;
        }>;
        time_limit_minutes: number;
    };
    learning_path: Array<{
        step: string;
        description: string;
        resources: string[];
    }>;
    validity_label: string;
    estimated_study_time: string;
    passing_rate: number;
    average_score: number;
    completion_count: number;
    popularity: string;
    user_progress?: {
        attempts_used: number;
        attempts_remaining: number;
        best_score: number;
        is_certified: boolean;
        can_retake: boolean;
        last_attempt?: {
            id: number;
            status: string;
            score?: number;
            completed_at?: string;
        };
    };
}

interface Props {
    certification: Certification;
    similar_certifications: Certification[];
    recent_activity: Array<{
        user: { name: string; avatar?: string };
        score: number;
        completed_at: string;
    }>;
    user_stats?: {
        total_attempts: number;
        success_rate: number;
        average_score: number;
    };
}

export default function CertificationShow({ certification, similar_certifications, recent_activity, user_stats }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const handleStartExam = () => {
        window.location.href = `/certifications/${certification.id}/start`;
    };

    const handleContinueExam = () => {
        if (certification.user_progress?.last_attempt) {
            window.location.href = `/certifications/${certification.id}/exam/${certification.user_progress.last_attempt.id}`;
        }
    };

    const handleViewResults = () => {
        if (certification.user_progress?.last_attempt) {
            window.location.href = `/certifications/${certification.id}/results/${certification.user_progress.last_attempt.id}`;
        }
    };

    const getActionButton = () => {
        const progress = certification.user_progress;

        if (!progress) {
            return (
                <Button onClick={handleStartExam} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Trophy className="mr-2 h-4 w-4" />
                    Iniciar Certificación
                </Button>
            );
        }

        if (progress.is_certified) {
            return (
                <div className="space-y-2">
                    <Button variant="outline" className="w-full" disabled>
                        <Award className="mr-2 h-4 w-4" />
                        Certificado Obtenido ({progress.best_score}%)
                    </Button>
                    <Button onClick={() => window.location.href = `/certifications/certificates/${certification.id}`} className="w-full">
                        Ver Certificado
                    </Button>
                </div>
            );
        }

        if (progress.last_attempt?.status === 'in_progress') {
            return (
                <Button onClick={handleContinueExam} className="w-full bg-green-600 hover:bg-green-700">
                    <Clock className="mr-2 h-4 w-4" />
                    Continuar Examen
                </Button>
            );
        }

        if (progress.can_retake) {
            return (
                <Button onClick={handleStartExam} className="w-full bg-orange-600 hover:bg-orange-700">
                    <Trophy className="mr-2 h-4 w-4" />
                    Reintentar ({progress.attempts_remaining} intentos restantes)
                </Button>
            );
        }

        if (progress.attempts_used >= certification.max_attempts) {
            return (
                <Button variant="outline" className="w-full" disabled>
                    <XCircle className="mr-2 h-4 w-4" />
                    Sin intentos disponibles
                </Button>
            );
        }

        return (
            <Button onClick={handleViewResults} variant="outline" className="w-full">
                Ver Últimos Resultados
            </Button>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={certification.name} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <Badge variant="secondary" className={certification.level_color}>
                                    {certification.level_label}
                                </Badge>
                                {certification.is_premium && (
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                        Premium
                                    </Badge>
                                )}
                                <Badge variant="outline">{certification.category_label}</Badge>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">{certification.name}</h1>
                            <p className="text-gray-400 text-lg">{certification.description}</p>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-4 text-center">
                                <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Duración</p>
                                <p className="text-lg font-semibold text-white">{certification.formatted_duration}</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-4 text-center">
                                <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Puntuación Mínima</p>
                                <p className="text-lg font-semibold text-white">{certification.passing_score}%</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-4 text-center">
                                <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Certificados</p>
                                <p className="text-lg font-semibold text-white">{certification.completion_count}</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-4 text-center">
                                <DollarSign className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Precio</p>
                                <p className="text-lg font-semibold text-white">{certification.formatted_price}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Resumen</TabsTrigger>
                                <TabsTrigger value="structure">Estructura</TabsTrigger>
                                <TabsTrigger value="learning">Preparación</TabsTrigger>
                                <TabsTrigger value="activity">Actividad</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                {/* Skills Covered */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <BookOpen className="mr-2 h-5 w-5" />
                                            Habilidades Cubiertas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {certification.skills_covered.map((skill, index) => (
                                                <Badge key={index} variant="outline">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Prerequisites */}
                                {certification.prerequisites.length > 0 && (
                                    <Card className="bg-dark-100 border-dark-200">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center">
                                                <AlertTriangle className="mr-2 h-5 w-5" />
                                                Prerrequisitos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {certification.prerequisites.map((prereq, index) => (
                                                <div key={index} className="flex items-center space-x-3">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="text-gray-300">{prereq.description}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Statistics */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <TrendingUp className="mr-2 h-5 w-5" />
                                            Estadísticas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-400">Tasa de Aprobación</p>
                                                <p className="text-2xl font-bold text-white">{certification.passing_rate}%</p>
                                                <Progress value={certification.passing_rate} className="mt-2" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Puntuación Promedio</p>
                                                <p className="text-2xl font-bold text-white">{certification.average_score}%</p>
                                                <Progress value={certification.average_score} className="mt-2" />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-sm text-gray-400">Popularidad: 
                                                <span className="ml-2 text-white">{certification.popularity}</span>
                                            </p>
                                            <p className="text-sm text-gray-400">Tiempo estimado de estudio: 
                                                <span className="ml-2 text-white">{certification.estimated_study_time}</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="structure" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white">Estructura del Examen</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="text-center p-4 bg-dark-200 rounded-lg">
                                                <p className="text-2xl font-bold text-white">{certification.exam_structure.total_questions}</p>
                                                <p className="text-sm text-gray-400">Preguntas Totales</p>
                                            </div>
                                            <div className="text-center p-4 bg-dark-200 rounded-lg">
                                                <p className="text-2xl font-bold text-white">{certification.exam_structure.time_limit_minutes}m</p>
                                                <p className="text-sm text-gray-400">Tiempo Límite</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {certification.exam_structure.sections.map((section, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                                                    <div>
                                                        <p className="text-white font-medium">{section.name}</p>
                                                        <p className="text-sm text-gray-400">{section.questions} preguntas</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white font-medium">{section.weight}%</p>
                                                        <p className="text-sm text-gray-400">del puntaje</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="learning" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white">Ruta de Aprendizaje</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {certification.learning_path.map((step, index) => (
                                                <div key={index} className="flex space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-white font-medium">{step.step}</h4>
                                                        <p className="text-gray-400 text-sm mb-2">{step.description}</p>
                                                        {step.resources.length > 0 && (
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-gray-500">Recursos recomendados:</p>
                                                                <ul className="list-disc list-inside text-sm text-gray-400">
                                                                    {step.resources.map((resource, rIndex) => (
                                                                        <li key={rIndex}>{resource}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="activity" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white">Actividad Reciente</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recent_activity.map((activity, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 bg-dark-200 rounded-lg">
                                                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                                        <User className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium">{activity.user.name}</p>
                                                        <p className="text-sm text-gray-400">
                                                            Obtuvo {activity.score}% • {activity.completed_at}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        {activity.score >= certification.passing_score ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6">
                                {getActionButton()}
                                
                                {certification.user_progress && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Intentos usados:</span>
                                            <span className="text-white">
                                                {certification.user_progress.attempts_used} / {certification.max_attempts}
                                            </span>
                                        </div>
                                        {certification.user_progress.best_score > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Mejor puntuación:</span>
                                                <span className="text-white">{certification.user_progress.best_score}%</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* User Stats */}
                        {user_stats && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Tus Estadísticas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Intentos totales:</span>
                                        <span className="text-white">{user_stats.total_attempts}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Tasa de éxito:</span>
                                        <span className="text-white">{user_stats.success_rate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Puntuación promedio:</span>
                                        <span className="text-white">{user_stats.average_score}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Certificate Info */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Información del Certificado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Validez:</span>
                                    <span className="text-white">{certification.validity_label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Intentos máximos:</span>
                                    <span className="text-white">{certification.max_attempts}</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    Los certificados son verificables y pueden ser validados por terceros.
                                </div>
                            </CardContent>
                        </Card>

                        {/* Similar Certifications */}
                        {similar_certifications.length > 0 && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white">Certificaciones Relacionadas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {similar_certifications.map((cert) => (
                                            <div key={cert.id} className="p-3 bg-dark-200 rounded-lg hover:bg-dark-300 cursor-pointer transition-colors"
                                                 onClick={() => window.location.href = `/certifications/${cert.id}`}>
                                                <h4 className="text-white text-sm font-medium mb-1">{cert.name}</h4>
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-xs">
                                                        {cert.level_label}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">{cert.formatted_price}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}