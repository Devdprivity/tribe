import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
    Clock, 
    AlertTriangle, 
    ChevronLeft, 
    ChevronRight, 
    Flag,
    CheckCircle,
    Circle,
    Eye,
    EyeOff,
    Save,
    Send
} from 'lucide-react';

interface Question {
    id: number;
    question: string;
    type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer';
    options?: string[];
    correct_answers?: string[];
    points: number;
    section: string;
    difficulty: string;
    explanation?: string;
}

interface ExamSection {
    name: string;
    questions: number;
    weight: number;
    description: string;
}

interface UserAnswer {
    question_id: number;
    answer: string | string[];
    is_flagged: boolean;
    time_spent: number;
}

interface ExamAttempt {
    id: number;
    certification_id: number;
    started_at: string;
    time_remaining_minutes: number;
    status: string;
    current_question: number;
    answers: UserAnswer[];
}

interface Props {
    certification: {
        id: number;
        name: string;
        level_label: string;
        level_color: string;
        passing_score: number;
        exam_structure: {
            total_questions: number;
            time_limit_minutes: number;
            sections: ExamSection[];
        };
    };
    attempt: ExamAttempt;
    questions: Question[];
    current_section?: {
        name: string;
        current_question: number;
        total_questions: number;
    };
}

export default function CertificationExam({ certification, attempt, questions, current_section }: Props) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(attempt.current_question || 0);
    const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [timeRemaining, setTimeRemaining] = useState(attempt.time_remaining_minutes * 60);
    const [showReview, setShowReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    
    const timerRef = useRef<NodeJS.Timeout>();
    const autoSaveRef = useRef<NodeJS.Timeout>();

    const currentQuestion = questions[currentQuestionIndex];

    // Initialize answers from attempt
    useEffect(() => {
        if (attempt.answers) {
            const answerMap: Record<number, UserAnswer> = {};
            const flagged = new Set<number>();

            attempt.answers.forEach(answer => {
                answerMap[answer.question_id] = answer;
                if (answer.is_flagged) {
                    flagged.add(answer.question_id);
                }
            });

            setAnswers(answerMap);
            setFlaggedQuestions(flagged);
        }
    }, [attempt.answers]);

    // Timer countdown
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Auto-save answers
    useEffect(() => {
        if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        
        autoSaveRef.current = setTimeout(() => {
            saveProgress();
        }, 30000); // Auto-save every 30 seconds

        return () => {
            if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        };
    }, [answers]);

    // Track time spent on each question
    useEffect(() => {
        setQuestionStartTime(Date.now());
    }, [currentQuestionIndex]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = (): string => {
        const percentage = (timeRemaining / (certification.exam_structure.time_limit_minutes * 60)) * 100;
        if (percentage <= 10) return 'text-red-500';
        if (percentage <= 25) return 'text-yellow-500';
        return 'text-white';
    };

    const handleAnswerChange = (value: string | string[]) => {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: {
                question_id: currentQuestion.id,
                answer: value,
                is_flagged: flaggedQuestions.has(currentQuestion.id),
                time_spent: timeSpent
            }
        }));
    };

    const handleFlagQuestion = () => {
        const questionId = currentQuestion.id;
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });

        // Update answer flag status
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                question_id: questionId,
                answer: prev[questionId]?.answer || '',
                is_flagged: !flaggedQuestions.has(questionId),
                time_spent: prev[questionId]?.time_spent || 0
            }
        }));
    };

    const navigateToQuestion = (index: number) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
        }
    };

    const getQuestionStatus = (index: number): 'answered' | 'flagged' | 'unanswered' => {
        const question = questions[index];
        const answer = answers[question.id];
        
        if (flaggedQuestions.has(question.id)) return 'flagged';
        if (answer && answer.answer && (
            (typeof answer.answer === 'string' && answer.answer.length > 0) ||
            (Array.isArray(answer.answer) && answer.answer.length > 0)
        )) return 'answered';
        return 'unanswered';
    };

    const getAnsweredCount = (): number => {
        return questions.filter((_, index) => getQuestionStatus(index) === 'answered').length;
    };

    const getFlaggedCount = (): number => {
        return flaggedQuestions.size;
    };

    const saveProgress = async () => {
        try {
            await fetch(`/certifications/${certification.id}/exam/${attempt.id}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    current_question: currentQuestionIndex,
                    answers: Object.values(answers),
                    time_remaining: timeRemaining
                })
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const handleSubmitExam = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await fetch(`/certifications/${certification.id}/exam/${attempt.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    answers: Object.values(answers),
                    time_spent_minutes: Math.floor((certification.exam_structure.time_limit_minutes * 60 - timeRemaining) / 60)
                })
            });

            if (response.ok) {
                const result = await response.json();
                window.location.href = `/certifications/${certification.id}/results/${attempt.id}`;
            } else {
                throw new Error('Failed to submit exam');
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            setIsSubmitting(false);
            alert('Error al enviar el examen. Por favor, inténtalo de nuevo.');
        }
    };

    const renderQuestion = () => {
        if (!currentQuestion) return null;

        const userAnswer = answers[currentQuestion.id];

        return (
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline">
                                Pregunta {currentQuestionIndex + 1} de {questions.length}
                            </Badge>
                            <Badge variant="secondary">
                                {currentQuestion.section}
                            </Badge>
                            <Badge variant={currentQuestion.difficulty === 'easy' ? 'default' : currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                                {currentQuestion.difficulty === 'easy' ? 'Fácil' : currentQuestion.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                            </Badge>
                            <span className="text-sm text-gray-400">{currentQuestion.points} puntos</span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-4">
                            {currentQuestion.question}
                        </h3>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFlagQuestion}
                        className={flaggedQuestions.has(currentQuestion.id) ? 'border-yellow-500 text-yellow-500' : ''}
                    >
                        <Flag className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-3">
                    {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                        <RadioGroup
                            value={typeof userAnswer?.answer === 'string' ? userAnswer.answer : ''}
                            onValueChange={handleAnswerChange}
                        >
                            {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="text-white cursor-pointer flex-1">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {currentQuestion.type === 'multiple_select' && currentQuestion.options && (
                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`option-${index}`}
                                        checked={Array.isArray(userAnswer?.answer) && userAnswer.answer.includes(option)}
                                        onCheckedChange={(checked) => {
                                            const currentAnswers = Array.isArray(userAnswer?.answer) ? userAnswer.answer : [];
                                            let newAnswers;
                                            if (checked) {
                                                newAnswers = [...currentAnswers, option];
                                            } else {
                                                newAnswers = currentAnswers.filter(a => a !== option);
                                            }
                                            handleAnswerChange(newAnswers);
                                        }}
                                    />
                                    <Label htmlFor={`option-${index}`} className="text-white cursor-pointer flex-1">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'true_false' && (
                        <RadioGroup
                            value={typeof userAnswer?.answer === 'string' ? userAnswer.answer : ''}
                            onValueChange={handleAnswerChange}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="true" />
                                <Label htmlFor="true" className="text-white cursor-pointer">
                                    Verdadero
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="false" />
                                <Label htmlFor="false" className="text-white cursor-pointer">
                                    Falso
                                </Label>
                            </div>
                        </RadioGroup>
                    )}

                    {currentQuestion.type === 'short_answer' && (
                        <Textarea
                            value={typeof userAnswer?.answer === 'string' ? userAnswer.answer : ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            placeholder="Escribe tu respuesta aquí..."
                            className="bg-dark-200 border-dark-300 text-white"
                            rows={4}
                        />
                    )}
                </div>
            </div>
        );
    };

    if (showReview) {
        return (
            <AuthenticatedLayout>
                <Head title={`Revisar Examen - ${certification.name}`} />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-white">Revisar Respuestas</h1>
                            <div className={`text-xl font-mono ${getTimeColor()}`}>
                                <Clock className="inline mr-2 h-5 w-5" />
                                {formatTime(timeRemaining)}
                            </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="text-white">
                                <CheckCircle className="inline mr-1 h-4 w-4 text-green-500" />
                                Respondidas: {getAnsweredCount()}/{questions.length}
                            </span>
                            <span className="text-white">
                                <Flag className="inline mr-1 h-4 w-4 text-yellow-500" />
                                Marcadas: {getFlaggedCount()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                            <Card className="bg-dark-100 border-dark-200">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                        {questions.map((_, index) => {
                                            const status = getQuestionStatus(index);
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setCurrentQuestionIndex(index);
                                                        setShowReview(false);
                                                    }}
                                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                                        status === 'answered' 
                                                            ? 'bg-green-600 text-white' 
                                                            : status === 'flagged'
                                                            ? 'bg-yellow-600 text-white'
                                                            : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="bg-dark-100 border-dark-200">
                                <CardContent className="p-6 space-y-4">
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-white">
                                            {getAnsweredCount()} / {questions.length}
                                        </p>
                                        <p className="text-sm text-gray-400">Preguntas respondidas</p>
                                    </div>
                                    
                                    <Progress 
                                        value={(getAnsweredCount() / questions.length) * 100} 
                                        className="w-full" 
                                    />

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Respondidas:</span>
                                            <span className="text-green-500">{getAnsweredCount()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Sin responder:</span>
                                            <span className="text-gray-300">{questions.length - getAnsweredCount()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Marcadas:</span>
                                            <span className="text-yellow-500">{getFlaggedCount()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Button 
                                            onClick={() => setShowReview(false)}
                                            variant="outline" 
                                            className="w-full"
                                        >
                                            Continuar Examen
                                        </Button>
                                        <Button 
                                            onClick={handleSubmitExam}
                                            disabled={isSubmitting}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {isSubmitting ? 'Enviando...' : 'Enviar Examen'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Examen - ${certification.name}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{certification.name}</h1>
                            <Badge variant="secondary" className={certification.level_color}>
                                {certification.level_label}
                            </Badge>
                        </div>
                        <div className={`text-xl font-mono ${getTimeColor()}`}>
                            <Clock className="inline mr-2 h-5 w-5" />
                            {formatTime(timeRemaining)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">
                                Pregunta {currentQuestionIndex + 1} de {questions.length}
                            </span>
                            {current_section && (
                                <span className="text-sm text-gray-400">
                                    Sección: {current_section.name}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => saveProgress()}>
                                <Save className="mr-1 h-4 w-4" />
                                Guardar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowReview(true)}>
                                <Eye className="mr-1 h-4 w-4" />
                                Revisar
                            </Button>
                        </div>
                    </div>

                    <Progress 
                        value={((currentQuestionIndex + 1) / questions.length) * 100} 
                        className="mt-4" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Question Area */}
                    <div className="lg:col-span-3">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-8">
                                {renderQuestion()}
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Anterior
                            </Button>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => saveProgress()}>
                                    Guardar Progreso
                                </Button>
                                {currentQuestionIndex === questions.length - 1 && (
                                    <Button 
                                        onClick={handleSubmitExam}
                                        disabled={isSubmitting}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Finalizar Examen'}
                                    </Button>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Siguiente
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Progreso</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                                    </p>
                                    <p className="text-sm text-gray-400">Completado</p>
                                </div>
                                
                                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Respondidas:</span>
                                        <span className="text-green-500">{getAnsweredCount()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Restantes:</span>
                                        <span className="text-white">{questions.length - getAnsweredCount()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Marcadas:</span>
                                        <span className="text-yellow-500">{getFlaggedCount()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Navigation */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Navegación Rápida</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-2">
                                    {questions.slice(0, 20).map((_, index) => {
                                        const status = getQuestionStatus(index);
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => navigateToQuestion(index)}
                                                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                                                    index === currentQuestionIndex
                                                        ? 'bg-blue-600 text-white'
                                                        : status === 'answered' 
                                                        ? 'bg-green-600 text-white' 
                                                        : status === 'flagged'
                                                        ? 'bg-yellow-600 text-white'
                                                        : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                {questions.length > 20 && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full mt-3"
                                        onClick={() => setShowReview(true)}
                                    >
                                        Ver Todas
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Exam Info */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Información del Examen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Preguntas totales:</span>
                                    <span className="text-white">{questions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Puntaje mínimo:</span>
                                    <span className="text-white">{certification.passing_score}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tiempo límite:</span>
                                    <span className="text-white">{certification.exam_structure.time_limit_minutes} min</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Warning */}
                        <Card className="bg-dark-100 border-yellow-600">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <div className="text-sm text-gray-300">
                                        <p className="font-medium text-yellow-500 mb-1">¡Importante!</p>
                                        <p>Guarda tu progreso frecuentemente. El examen se enviará automáticamente cuando termine el tiempo.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}