import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Play, ExternalLink } from 'lucide-react';

interface CodeSnippetProps {
    code: string;
    language: string;
    title?: string;
    description?: string;
    githubUrl?: string;
    isExecutable?: boolean;
}

const languageColors: { [key: string]: string } = {
    javascript: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    typescript: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    python: 'bg-green-500/20 text-green-300 border-green-400/30',
    php: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    java: 'bg-red-500/20 text-red-300 border-red-400/30',
    css: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
    html: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    sql: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    bash: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
    json: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
};

export default function CodeSnippet({ 
    code, 
    language, 
    title, 
    description, 
    githubUrl,
    isExecutable = false 
}: CodeSnippetProps) {
    const [copied, setCopied] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copying code:', err);
        }
    };

    const handleExecute = async () => {
        if (!isExecutable) return;
        
        setIsExecuting(true);
        // Aquí iría la lógica para ejecutar el código
        setTimeout(() => setIsExecuting(false), 2000);
    };

    const getLanguageColor = (lang: string) => {
        return languageColors[lang.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    };

    return (
        <Card className="apple-liquid-card border border-white/20">
            <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Badge className={`${getLanguageColor(language)} text-xs`}>
                            {language.toUpperCase()}
                        </Badge>
                        {title && (
                            <h3 className="text-white font-semibold text-sm">{title}</h3>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isExecutable && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleExecute}
                                disabled={isExecuting}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <Play className="h-4 w-4 mr-1" />
                                {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
                            </Button>
                        )}
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 mr-1" />
                            ) : (
                                <Copy className="h-4 w-4 mr-1" />
                            )}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                        
                        {githubUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div className="p-4 border-b border-white/10">
                        <p className="text-white/80 text-sm">{description}</p>
                    </div>
                )}

                {/* Code Block */}
                <div className="relative">
                    <pre className="bg-black/40 p-4 overflow-x-auto text-sm">
                        <code className={`language-${language}`}>{code}</code>
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}
