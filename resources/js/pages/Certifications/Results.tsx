import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Trophy, 
    Award, 
    TrendingUp, 
    Clock, 
    Target, 
    BarChart3,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    Share2,
    RotateCcw,
    Eye,
    Star,
    Calendar,
    Users,
    Medal,
    BookOpen
} from 'lucide-react';

interface ExamResult {
    id: number;
    total_score: number;
    passing_score: number;
    passed: boolean;
    status: string;
    status_label: string;
    status_color: string;
    result_label: string;
    score_percentage: string;
    performance_grade: string;
    duration_label: string;
    completed_at: string;
    formatted_completed_at: string;
    time_spent_minutes: number;
    section_scores: Record<string, {
        score: number;
        percentage: number;
        status: string;
        color: string;
        correct_answers: number;
        total_questions: number;
    }>;
    weakest_section: string | null;
    strongest_section: string | null;
    average_time_per_question: number;
    questions_review?: Array<{
        id: number;
        question: string;
        user_answer: string | string[];
        correct_answer: string | string[];
        is_correct: boolean;
        points: number;
        section: string;
        difficulty: string;
        explanation?: string;
    }>;
}

interface Certification {
    id: number;
    name: string;
    level_label: string;
    level_color: string;
    passing_score: number;
    max_attempts: number;
    validity_label: string;
    formatted_price: string;
}

interface UserProgress {
    attempts_used: number;
    attempts_remaining: number;
    best_score: number;
    can_retake: boolean;
    is_certified: boolean;
    certificate?: {
        id: number;
        certificate_number: string;
        verification_code: string;
        certificate_url: string;
    };
}

interface Props {
    certification: Certification;
    result: ExamResult;
    user_progress: UserProgress;
    percentile_rank: number;
    similar_results: Array<{
        user: { name: string; avatar?: string };
        score: number;
        completed_at: string;
    }>;
    improvement_suggestions: Array<{
        section: string;
        suggestion: string;
        resources: string[];
    }>;
    next_steps: Array<{
        title: string;
        description: string;
        action: string;
        url?: string;
    }>;
}

export default function CertificationResults({ 
    certification, 
    result, 
    user_progress, 
    percentile_rank,
    similar_results,
    improvement_suggestions,
    next_steps 
}: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showQuestionReview, setShowQuestionReview] = useState(false);

    const handleRetakeExam = () => {
        if (user_progress.can_retake) {
            window.location.href = `/certifications/${certification.id}/start`;
        }
    };

    const handleDownloadCertificate = () => {
        if (user_progress.certificate) {
            window.open(user_progress.certificate.certificate_url, '_blank');
        }
    };

    const handleShareResults = () => {
        if (navigator.share) {
            navigator.share({
                title: `Resultado del examen ${certification.name}`,
                text: `Obtuve ${result.total_score}% en la certificación ${certification.name}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles');
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 90) return 'text-green-500';
        if (score >= 80) return 'text-blue-500';
        if (score >= 70) return 'text-yellow-500';
        if (score >= 60) return 'text-orange-500';
        return 'text-red-500';
    };

    const getGradeColor = (grade: string): string => {
        if (['A+', 'A'].includes(grade)) return 'text-green-500';
        if (['B+', 'B'].includes(grade)) return 'text-blue-500';
        if (['C+', 'C'].includes(grade)) return 'text-yellow-500';
        if (['D+', 'D'].includes(grade)) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Resultados - ${certification.name}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Resultados del Examen</h1>
                            <p className="text-gray-400">{certification.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={handleShareResults}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Compartir
                            </Button>
                            {result.passed && user_progress.certificate && (
                                <Button onClick={handleDownloadCertificate} className="bg-green-600 hover:bg-green-700">
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar Certificado
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Result Status */}
                    <Card className={`border-2 mb-6 ${result.passed ? 'border-green-500 bg-green-50/5' : 'border-red-500 bg-red-50/5'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.passed ? 'bg-green-600' : 'bg-red-600'}`}>
                                        {result.passed ? (
                                            <Trophy className="h-8 w-8 text-white" />
                                        ) : (
                                            <XCircle className="h-8 w-8 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                                            {result.result_label}
                                        </h2>
                                        <p className="text-gray-400">
                                            {result.passed 
                                                ? '¡Felicitaciones! Has obtenido tu certificación.' 
                                                : `Necesitas ${certification.passing_score}% para aprobar.`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-4xl font-bold ${getScoreColor(result.total_score)}`}>
                                        {result.total_score}%
                                    </p>
                                    <p className={`text-lg font-semibold ${getGradeColor(result.performance_grade)}`}>
                                        Grado: {result.performance_grade}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <Target className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{result.total_score}%</p>
                                <p className="text-gray-400">Puntuación Final</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <Clock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{result.duration_label}</p>
                                <p className="text-gray-400">Tiempo Total</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <TrendingUp className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{percentile_rank}%</p>
                                <p className="text-gray-400">Percentil</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <RotateCcw className="h-8 w-8 text-green-500 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-white">{user_progress.attempts_remaining}</p>
                                <p className="text-gray-400">Intentos Restantes</p>
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
                                <TabsTrigger value="sections">Secciones</TabsTrigger>
                                <TabsTrigger value="improvement">Mejora</TabsTrigger>
                                <TabsTrigger value="comparison">Comparación</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                {/* Performance Overview */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <BarChart3 className="mr-2 h-5 w-5" />
                                            Resumen de Rendimiento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-white font-medium mb-3">Puntuación General</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Tu puntuación:</span>
                                                        <span className="text-white font-semibold">{result.total_score}%</span>
                                                    </div>
                                                    <Progress value={result.total_score} className="h-3" />
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Mínimo requerido: {certification.passing_score}%</span>
                                                        <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                                                            {result.passed ? '✓ Aprobado' : '✗ Reprobado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-white font-medium mb-3">Tiempo de Examen</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Tiempo usado:</span>
                                                        <span className="text-white font-semibold">{result.duration_label}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Promedio por pregunta:</span>
                                                        <span className="text-white">{Math.round(result.average_time_per_question)}s</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {(result.strongest_section || result.weakest_section) && (
                                            <div className="border-t border-dark-300 pt-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {result.strongest_section && (
                                                        <div className="text-center p-4 bg-green-50/5 rounded-lg">
                                                            <Medal className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                                            <h5 className="text-green-500 font-medium">Mejor Sección</h5>
                                                            <p className="text-white">{result.strongest_section}</p>
                                                        </div>
                                                    )}
                                                    {result.weakest_section && (
                                                        <div className="text-center p-4 bg-red-50/5 rounded-lg">
                                                            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                                            <h5 className="text-red-500 font-medium">Área de Mejora</h5>
                                                            <p className="text-white">{result.weakest_section}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Question Review */}
                                {result.questions_review && (
                                    <Card className="bg-dark-100 border-dark-200">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center justify-between">
                                                <span className="flex items-center">
                                                    <Eye className="mr-2 h-5 w-5" />
                                                    Revisión de Preguntas
                                                </span>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => setShowQuestionReview(!showQuestionReview)}
                                                >
                                                    {showQuestionReview ? 'Ocultar' : 'Mostrar'} Detalles
                                                </Button>
                                            </CardTitle>
                                        </CardHeader>
                                        {showQuestionReview && (
                                            <CardContent className="space-y-4">
                                                {result.questions_review.map((question, index) => (
                                                    <div key={question.id} className="border border-dark-300 rounded-lg p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-400">
                                                                    Pregunta {index + 1}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {question.section}
                                                                </Badge>
                                                                <Badge 
                                                                    variant={question.difficulty === 'easy' ? 'default' : 
                                                                            question.difficulty === 'medium' ? 'secondary' : 'destructive'}
                                                                    className="text-xs"
                                                                >
                                                                    {question.difficulty}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center">
                                                                {question.is_correct ? (
                                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                                )}
                                                                <span className="ml-2 text-sm text-gray-400">
                                                                    {question.points} pts
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <h4 className="text-white font-medium mb-3">{question.question}</h4>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm text-gray-400 mb-1">Tu respuesta:</p>
                                                                <p className={`text-sm ${question.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                                                    {Array.isArray(question.user_answer) 
                                                                        ? question.user_answer.join(', ') 
                                                                        : question.user_answer
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-400 mb-1">Respuesta correcta:</p>
                                                                <p className="text-sm text-green-400">
                                                                    {Array.isArray(question.correct_answer) 
                                                                        ? question.correct_answer.join(', ') 
                                                                        : question.correct_answer
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {question.explanation && (
                                                            <div className="mt-3 p-3 bg-blue-50/5 rounded">
                                                                <p className="text-sm text-blue-400 font-medium mb-1">Explicación:</p>
                                                                <p className="text-sm text-gray-300">{question.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        )}
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="sections" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white">Rendimiento por Sección</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {Object.entries(result.section_scores).map(([section, data]) => (
                                                <div key={section} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-white font-medium">{section}</h4>
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`font-semibold ${data.color}`}>
                                                                {data.percentage}%
                                                            </span>
                                                            <Badge variant="outline" className={data.color}>
                                                                {data.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Progress value={data.percentage} className="h-2" />
                                                    <div className="flex justify-between text-sm text-gray-400">
                                                        <span>
                                                            Correctas: {data.correct_answers} / {data.total_questions}
                                                        </span>
                                                        <span>
                                                            Puntuación: {data.score}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="improvement" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <BookOpen className="mr-2 h-5 w-5" />
                                            Sugerencias de Mejora
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {improvement_suggestions.map((suggestion, index) => (
                                                <div key={index} className="border-l-4 border-blue-500 pl-4">
                                                    <h4 className="text-white font-medium mb-2">{suggestion.section}</h4>
                                                    <p className="text-gray-300 mb-3">{suggestion.suggestion}</p>
                                                    {suggestion.resources.length > 0 && (
                                                        <div>
                                                            <p className="text-sm text-gray-400 mb-2">Recursos recomendados:</p>
                                                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                                                                {suggestion.resources.map((resource, rIndex) => (
                                                                    <li key={rIndex}>{resource}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="comparison" className="space-y-6">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Users className="mr-2 h-5 w-5" />
                                            Comparación con Otros Usuarios
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="text-center p-4 bg-blue-50/5 rounded-lg">
                                                <h3 className="text-xl font-bold text-blue-400">{percentile_rank}%</h3>
                                                <p className="text-gray-400">
                                                    Superaste al {percentile_rank}% de los participantes
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-white font-medium">Resultados Recientes Similares:</h4>
                                                {similar_results.map((result, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-dark-200 rounded">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-medium text-white">
                                                                    {result.user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white">{result.user.name}</p>
                                                                <p className="text-xs text-gray-400">{result.completed_at}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-semibold ${getScoreColor(result.score)}`}>
                                                                {result.score}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Next Actions */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white">Próximos Pasos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {next_steps.map((step, index) => (
                                    <div key={index} className="space-y-2">
                                        <h4 className="text-white font-medium">{step.title}</h4>
                                        <p className="text-sm text-gray-400">{step.description}</p>
                                        {step.url ? (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full"
                                                onClick={() => window.location.href = step.url!}
                                            >
                                                {step.action}
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full"
                                                onClick={step.action === 'Reintentar Examen' ? handleRetakeExam : undefined}
                                                disabled={step.action === 'Reintentar Examen' && !user_progress.can_retake}
                                            >
                                                {step.action}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Certificate Info */}
                        {result.passed && user_progress.certificate && (
                            <Card className="bg-dark-100 border-green-600">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Award className="mr-2 h-5 w-5 text-green-500" />
                                        Tu Certificado
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <Award className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <p className="text-green-500 font-medium">¡Certificación Obtenida!</p>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Número:</span>
                                            <span className="text-white font-mono">
                                                {user_progress.certificate.certificate_number}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Código de verificación:</span>
                                            <span className="text-white font-mono">
                                                {user_progress.certificate.verification_code}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Validez:</span>
                                            <span className="text-white">{certification.validity_label}</span>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleDownloadCertificate}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar Certificado
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Attempt Info */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white">Información del Intento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Fecha:</span>
                                    <span className="text-white">{result.formatted_completed_at}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Intentos usados:</span>
                                    <span className="text-white">
                                        {user_progress.attempts_used} / {certification.max_attempts}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Mejor puntuación:</span>
                                    <span className="text-white">{user_progress.best_score}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}