import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, Copy, Check, Settings } from 'lucide-react';

interface CodePlaygroundProps {
    initialCode: string;
    language: string;
    title?: string;
    description?: string;
    expectedOutput?: string;
    isInteractive?: boolean;
}

const languageConfigs = {
    javascript: {
        runtime: 'javascript',
        template: `// Escribe tu código aquí
console.log("¡Hola desde el playground!");`
    },
    python: {
        runtime: 'python',
        template: `# Escribe tu código aquí
print("¡Hola desde el playground!")`
    },
    html: {
        runtime: 'html',
        template: `<!DOCTYPE html>
<html>
<head>
    <title>Mi Playground</title>
</head>
<body>
    <h1>¡Hola Mundo!</h1>
</body>
</html>`
    },
    css: {
        runtime: 'css',
        template: `/* Escribe tu CSS aquí */
body {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-family: Arial, sans-serif;
}`
    }
};

export default function CodePlayground({
    initialCode,
    language,
    title,
    description,
    expectedOutput,
    isInteractive = true
}: CodePlaygroundProps) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleRun = async () => {
        if (!isInteractive) return;
        
        setIsRunning(true);
        setError('');
        setOutput('');

        try {
            // Simular ejecución de código
            // En un proyecto real, esto se conectaría con un sandbox como CodeSandbox API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (language === 'javascript') {
                // Simular output de JavaScript
                setOutput('¡Hola desde el playground!\nCódigo ejecutado exitosamente.');
            } else if (language === 'python') {
                setOutput('¡Hola desde el playground!\nCódigo ejecutado exitosamente.');
            } else if (language === 'html') {
                // Para HTML, renderizar en iframe
                if (iframeRef.current) {
                    iframeRef.current.srcdoc = code;
                }
                setOutput('HTML renderizado en el preview.');
            } else if (language === 'css') {
                setOutput('CSS aplicado. Revisa el preview para ver los cambios.');
            }
        } catch (err) {
            setError('Error al ejecutar el código: ' + (err as Error).message);
        } finally {
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        const config = languageConfigs[language as keyof typeof languageConfigs];
        setCode(config?.template || initialCode);
        setOutput('');
        setError('');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copying code:', err);
        }
    };

    const getLanguageColor = (lang: string) => {
        const colors: { [key: string]: string } = {
            javascript: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
            python: 'bg-green-500/20 text-green-300 border-green-400/30',
            html: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
            css: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        };
        return colors[lang] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
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
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                        
                        {isInteractive && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRun}
                                disabled={isRunning}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                {isRunning ? (
                                    <Square className="h-4 w-4 mr-1" />
                                ) : (
                                    <Play className="h-4 w-4 mr-1" />
                                )}
                                {isRunning ? 'Ejecutando...' : 'Ejecutar'}
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

                {/* Code Editor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Code Input */}
                    <div className="border-r border-white/10">
                        <div className="p-3 bg-white/5 border-b border-white/10">
                            <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                                Editor
                            </h4>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-64 bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder={`Escribe tu código ${language} aquí...`}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Output/Preview */}
                    <div>
                        <div className="p-3 bg-white/5 border-b border-white/10">
                            <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                                {language === 'html' ? 'Preview' : 'Output'}
                            </h4>
                        </div>
                        <div className="p-4">
                            {language === 'html' ? (
                                <div className="h-64 border border-white/20 rounded-lg overflow-hidden">
                                    <iframe
                                        ref={iframeRef}
                                        className="w-full h-full bg-white"
                                        title="HTML Preview"
                                    />
                                </div>
                            ) : (
                                <div className="h-64 bg-black/40 border border-white/20 rounded-lg p-3 overflow-auto">
                                    {error ? (
                                        <div className="text-red-400 text-sm font-mono">
                                            <div className="font-semibold mb-2">Error:</div>
                                            {error}
                                        </div>
                                    ) : output ? (
                                        <div className="text-green-300 text-sm font-mono whitespace-pre-wrap">
                                            {output}
                                        </div>
                                    ) : (
                                        <div className="text-white/50 text-sm">
                                            {isInteractive 
                                                ? 'Haz clic en "Ejecutar" para ver el resultado'
                                                : 'Este playground no es interactivo'
                                            }
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expected Output */}
                {expectedOutput && (
                    <div className="p-4 border-t border-white/10">
                        <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2">
                            Resultado Esperado
                        </h4>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <pre className="text-blue-300 text-sm font-mono whitespace-pre-wrap">
                                {expectedOutput}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
