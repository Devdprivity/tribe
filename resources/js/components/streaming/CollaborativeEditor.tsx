import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Code, 
    Users, 
    Play, 
    Pause, 
    Square,
    Download,
    Share2,
    Settings
} from 'lucide-react';

interface EditorUser {
    id: number;
    name: string;
    avatar?: string;
    cursor: {
        line: number;
        column: number;
    };
    color: string;
}

interface CollaborativeEditorProps {
    streamId: string;
    language: string;
    onCodeChange?: (code: string) => void;
    onRunCode?: () => void;
}

export default function CollaborativeEditor({ 
    streamId, 
    language = 'javascript',
    onCodeChange,
    onRunCode 
}: CollaborativeEditorProps) {
    const [code, setCode] = useState(`// Bienvenido al editor colaborativo
function helloWorld() {
    console.log("¡Hola desde el stream!");
    return "Código en vivo";
}

helloWorld();`);
    
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState('');
    const [activeUsers, setActiveUsers] = useState<EditorUser[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Mock data for demonstration
    useEffect(() => {
        const mockUsers: EditorUser[] = [
            {
                id: 1,
                name: 'Streamer',
                cursor: { line: 3, column: 5 },
                color: '#ff6b6b'
            },
            {
                id: 2,
                name: 'Viewer1',
                cursor: { line: 1, column: 10 },
                color: '#4ecdc4'
            }
        ];
        setActiveUsers(mockUsers);
        setIsConnected(true);
    }, [streamId]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newCode = e.target.value;
        setCode(newCode);
        onCodeChange?.(newCode);
    };

    const handleRunCode = async () => {
        if (!onRunCode) return;
        
        setIsRunning(true);
        setOutput('Ejecutando código...\n');
        
        // Simulate code execution
        setTimeout(() => {
            setOutput(prev => prev + '¡Hola desde el stream!\nCódigo en vivo\n');
            setIsRunning(false);
        }, 2000);
        
        onRunCode();
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stream-${streamId}-code.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Código del Stream',
                text: code,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(code);
            // Show toast notification
        }
    };

    const getLanguageDisplayName = (lang: string) => {
        const languages: { [key: string]: string } = {
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'html': 'HTML',
            'css': 'CSS',
            'typescript': 'TypeScript'
        };
        return languages[lang] || lang.toUpperCase();
    };

    return (
        <Card className="h-full bg-white/5 border-white/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Editor Colaborativo
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {getLanguageDisplayName(language)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {activeUsers.length} usuarios
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0 flex flex-col h-full">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="bg-green-500/80 hover:bg-green-500 text-white"
                        >
                            {isRunning ? (
                                <>
                                    <Pause className="h-4 w-4 mr-1" />
                                    Ejecutando...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-1" />
                                    Ejecutar
                                </>
                            )}
                        </Button>
                        
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownload}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                        </Button>
                        
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleShare}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                        >
                            <Share2 className="h-4 w-4 mr-1" />
                            Compartir
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-white/50" />
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={handleCodeChange}
                            className="w-full h-full p-4 bg-black/50 text-white font-mono text-sm resize-none focus:outline-none"
                            placeholder="Escribe tu código aquí..."
                            spellCheck={false}
                        />
                        
                        {/* Line Numbers */}
                        <div className="absolute left-0 top-0 p-4 text-white/50 font-mono text-sm select-none pointer-events-none">
                            {code.split('\n').map((_, index) => (
                                <div key={index} className="h-5 leading-5">
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="border-t border-white/10">
                    <div className="p-3 bg-black/30">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-white/70">Output:</span>
                        </div>
                        <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">
                            {output || 'El output aparecerá aquí...'}
                        </pre>
                    </div>
                </div>

                {/* Active Users */}
                {activeUsers.length > 0 && (
                    <div className="p-3 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-white/50" />
                            <span className="text-xs text-white/70">Usuarios activos:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {activeUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-white/10"
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: user.color }}
                                    />
                                    <span className="text-xs text-white">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
