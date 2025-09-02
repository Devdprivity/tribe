import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Code, Lightbulb, Copy, Check } from 'lucide-react';

interface ProblemSolutionProps {
    problem: {
        title: string;
        description: string;
        code?: string;
        language?: string;
        error?: string;
        context?: string;
    };
    solution: {
        description: string;
        code?: string;
        language?: string;
        explanation?: string;
        alternatives?: string[];
    };
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
}

const difficultyColors = {
    easy: 'bg-green-500/20 text-green-300 border-green-400/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    hard: 'bg-red-500/20 text-red-300 border-red-400/30',
};

export default function ProblemSolution({
    problem,
    solution,
    tags,
    difficulty,
    category
}: ProblemSolutionProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = async (code: string, type: 'problem' | 'solution') => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(type);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Error copying code:', err);
        }
    };

    return (
        <Card className="apple-liquid-card border border-white/20">
            <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-xl mb-2">
                            {problem.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <Badge className={`${difficultyColors[difficulty]} text-xs`}>
                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20 text-xs">
                                {category}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="bg-white/10 text-white/80 border-white/20 text-xs"
                        >
                            #{tag}
                        </Badge>
                    ))}
                </div>

                {/* Problem Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <h3 className="text-white font-semibold text-lg">Problema</h3>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-white/90 text-sm leading-relaxed mb-3">
                            {problem.description}
                        </p>
                        
                        {problem.context && (
                            <div className="mb-3">
                                <h4 className="text-white/80 text-sm font-medium mb-2">Contexto:</h4>
                                <p className="text-white/70 text-sm">{problem.context}</p>
                            </div>
                        )}
                        
                        {problem.error && (
                            <div className="mb-3">
                                <h4 className="text-white/80 text-sm font-medium mb-2">Error:</h4>
                                <div className="bg-black/40 p-3 rounded border border-red-500/30">
                                    <code className="text-red-300 text-sm">{problem.error}</code>
                                </div>
                            </div>
                        )}
                        
                        {problem.code && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-white/80 text-sm font-medium">Código con problema:</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopyCode(problem.code!, 'problem')}
                                        className="text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                        {copiedCode === 'problem' ? (
                                            <Check className="h-4 w-4 mr-1" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-1" />
                                        )}
                                        {copiedCode === 'problem' ? 'Copiado!' : 'Copiar'}
                                    </Button>
                                </div>
                                <div className="bg-black/40 p-4 rounded-lg border border-white/20">
                                    <pre className="text-sm overflow-x-auto">
                                        <code className={`language-${problem.language || 'text'}`}>
                                            {problem.code}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Solution Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <h3 className="text-white font-semibold text-lg">Solución</h3>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <p className="text-white/90 text-sm leading-relaxed mb-3">
                            {solution.description}
                        </p>
                        
                        {solution.explanation && (
                            <div className="mb-3">
                                <h4 className="text-white/80 text-sm font-medium mb-2">Explicación:</h4>
                                <p className="text-white/70 text-sm">{solution.explanation}</p>
                            </div>
                        )}
                        
                        {solution.code && (
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-white/80 text-sm font-medium">Código corregido:</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopyCode(solution.code!, 'solution')}
                                        className="text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                        {copiedCode === 'solution' ? (
                                            <Check className="h-4 w-4 mr-1" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-1" />
                                        )}
                                        {copiedCode === 'solution' ? 'Copiado!' : 'Copiar'}
                                    </Button>
                                </div>
                                <div className="bg-black/40 p-4 rounded-lg border border-white/20">
                                    <pre className="text-sm overflow-x-auto">
                                        <code className={`language-${solution.language || 'text'}`}>
                                            {solution.code}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        )}
                        
                        {solution.alternatives && solution.alternatives.length > 0 && (
                            <div>
                                <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-1">
                                    <Lightbulb className="h-4 w-4" />
                                    Alternativas:
                                </h4>
                                <ul className="space-y-2">
                                    {solution.alternatives.map((alternative, index) => (
                                        <li key={index} className="text-white/70 text-sm flex items-start">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                                            {alternative}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
