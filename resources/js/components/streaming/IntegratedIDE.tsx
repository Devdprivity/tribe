import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    FolderPlus, 
    FileText, 
    Play, 
    Terminal, 
    Download, 
    Upload, 
    Save, 
    Trash2, 
    Settings, 
    Package, 
    GitBranch, 
    Code, 
    Eye, 
    EyeOff,
    Users,
    MessageSquare,
    Share2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileNode[];
    parent?: string;
}

interface Participant {
    id: string;
    name: string;
    avatar: string;
    canEdit: boolean;
    isActive: boolean;
}

interface IntegratedIDEProps {
    streamType: 'code_review' | 'debugging' | 'project_building' | 'interview_prep';
    participants: Participant[];
    onCodeChange?: (fileId: string, content: string) => void;
    onParticipantPermissionChange?: (participantId: string, canEdit: boolean) => void;
    isStreaming?: boolean;
}

export default function IntegratedIDE({ 
    streamType, 
    participants, 
    onCodeChange, 
    onParticipantPermissionChange,
    isStreaming = false 
}: IntegratedIDEProps) {
    const [files, setFiles] = useState<FileNode[]>([
        {
            id: '1',
            name: 'src',
            type: 'folder',
            children: [
                {
                    id: '2',
                    name: 'main.js',
                    type: 'file',
                    content: '// Bienvenido al IDE integrado\nconsole.log("Hello World!");',
                    parent: '1'
                }
            ]
        }
    ]);
    
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [terminal, setTerminal] = useState<string[]>(['$ Bienvenido al terminal integrado']);
    const [terminalInput, setTerminalInput] = useState('');
    const [projectName, setProjectName] = useState('mi-proyecto');
    const [dependencies, setDependencies] = useState<string[]>(['react', 'typescript']);
    const [newDependency, setNewDependency] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [collaborativeMode, setCollaborativeMode] = useState(true);
    const [showParticipants, setShowParticipants] = useState(true);
    const [activeCollaborators, setActiveCollaborators] = useState<{[fileId: string]: string[]}>({});
    const [onlineUsers, setOnlineUsers] = useState<{id: string, name: string, color: string}[]>([]);
    
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminal]);

    // Crear nuevo archivo
    const createFile = (name: string, parentId?: string) => {
        const newFile: FileNode = {
            id: Date.now().toString(),
            name,
            type: 'file',
            content: '',
            parent: parentId
        };

        if (parentId) {
            setFiles(prev => prev.map(file => 
                file.id === parentId 
                    ? { ...file, children: [...(file.children || []), newFile] }
                    : file
            ));
        } else {
            setFiles(prev => [...prev, newFile]);
        }
    };

    // Crear nueva carpeta
    const createFolder = (name: string, parentId?: string) => {
        const newFolder: FileNode = {
            id: Date.now().toString(),
            name,
            type: 'folder',
            children: [],
            parent: parentId
        };

        if (parentId) {
            setFiles(prev => prev.map(file => 
                file.id === parentId 
                    ? { ...file, children: [...(file.children || []), newFolder] }
                    : file
            ));
        } else {
            setFiles(prev => [...prev, newFolder]);
        }
    };

    // Eliminar archivo/carpeta
    const deleteNode = (nodeId: string) => {
        const deleteFromArray = (nodes: FileNode[]): FileNode[] => {
            return nodes.filter(node => {
                if (node.id === nodeId) return false;
                if (node.children) {
                    node.children = deleteFromArray(node.children);
                }
                return true;
            });
        };
        
        setFiles(prev => deleteFromArray(prev));
        if (selectedFile?.id === nodeId) {
            setSelectedFile(null);
        }
    };

    // Guardar archivo
    const saveFile = () => {
        if (selectedFile && editorRef.current) {
            const content = editorRef.current.value;
            
            const updateFileContent = (nodes: FileNode[]): FileNode[] => {
                return nodes.map(node => {
                    if (node.id === selectedFile.id) {
                        return { ...node, content };
                    }
                    if (node.children) {
                        return { ...node, children: updateFileContent(node.children) };
                    }
                    return node;
                });
            };
            
            setFiles(prev => updateFileContent(prev));
            setSelectedFile(prev => prev ? { ...prev, content } : null);
            
            if (onCodeChange) {
                onCodeChange(selectedFile.id, content);
            }
            
            addToTerminal(`Archivo ${selectedFile.name} guardado exitosamente`);
        }
    };

    // Ejecutar comando en terminal
    const executeCommand = async (command: string) => {
        setIsExecuting(true);
        addToTerminal(`$ ${command}`);
        
        // Simular comandos comunes
        setTimeout(() => {
            if (command.startsWith('npm install')) {
                const pkg = command.split(' ')[2] || 'packages';
                addToTerminal(`Installing ${pkg}...`);
                addToTerminal(`✓ ${pkg} installed successfully`);
                
                if (command.split(' ')[2]) {
                    setDependencies(prev => [...prev, command.split(' ')[2]]);
                }
            } else if (command.startsWith('npm run')) {
                addToTerminal('Starting development server...');
                addToTerminal('✓ Server running on http://localhost:3000');
            } else if (command === 'ls' || command === 'dir') {
                const fileList = files.map(f => f.name).join('  ');
                addToTerminal(fileList);
            } else if (command.startsWith('mkdir')) {
                const folderName = command.split(' ')[1];
                if (folderName) {
                    createFolder(folderName);
                    addToTerminal(`Directory ${folderName} created`);
                }
            } else if (command.startsWith('touch')) {
                const fileName = command.split(' ')[1];
                if (fileName) {
                    createFile(fileName);
                    addToTerminal(`File ${fileName} created`);
                }
            } else if (command === 'clear') {
                setTerminal(['$ Terminal cleared']);
            } else {
                addToTerminal(`Command '${command}' executed`);
            }
            
            setIsExecuting(false);
        }, 1000 + Math.random() * 2000);
    };

    const addToTerminal = (message: string) => {
        setTerminal(prev => [...prev, message]);
    };

    const handleTerminalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (terminalInput.trim()) {
            executeCommand(terminalInput.trim());
            setTerminalInput('');
        }
    };

    // Instalar dependencia
    const installDependency = () => {
        if (newDependency.trim()) {
            executeCommand(`npm install ${newDependency.trim()}`);
            setNewDependency('');
        }
    };

    // Simular usuarios online y colaboradores activos
    useEffect(() => {
        if (collaborativeMode && isStreaming) {
            // Simular usuarios online
            setOnlineUsers([
                { id: 'user1', name: 'Ana García', color: '#3B82F6' },
                { id: 'user2', name: 'Carlos López', color: '#10B981' },
                { id: 'user3', name: 'María Rodríguez', color: '#F59E0B' },
                { id: 'user4', name: 'Juan Pérez', color: '#EF4444' }
            ]);
            
            // Simular colaboradores activos en archivos
            setActiveCollaborators({
                'file1': ['user1', 'user2'],
                'file2': ['user3']
            });
            
            addToTerminal('🔗 Conectado al sistema de colaboración');
            addToTerminal('👥 4 colaboradores online');
        } else {
            setOnlineUsers([]);
            setActiveCollaborators({});
        }
    }, [collaborativeMode, isStreaming]);
    
    // WebSocket para colaboración en tiempo real (simulado)
    useEffect(() => {
        if (!isStreaming || !collaborativeMode) return;
        
        // Simular eventos de colaboración cada cierto tiempo
        const interval = setInterval(() => {
            const events = [
                () => addToTerminal('📝 Ana García está editando main.js'),
                () => addToTerminal('💾 Carlos López guardó los cambios'),
                () => addToTerminal('🔍 María Rodríguez está revisando el código'),
            ];
            
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            if (Math.random() > 0.7) { // 30% de probabilidad
                randomEvent();
            }
        }, 10000); // Cada 10 segundos
        
        return () => clearInterval(interval);
    }, [isStreaming, collaborativeMode]);

    // Enviar cambios de código a otros colaboradores
    const handleCodeChangeCollaborative = (content: string) => {
        if (selectedFile && onCodeChange) {
            onCodeChange(selectedFile.id, content);
            
            // Simular envío por WebSocket
            if (isStreaming && collaborativeMode) {
                console.log('Enviando cambio de código a colaboradores:', {
                    type: 'code_change',
                    code: content,
                    fileName: selectedFile.name,
                    userId: 'current_user',
                    userName: 'Usuario Actual'
                });
            }
        }
    };

    // Renderizar árbol de archivos
    const renderFileTree = (nodes: FileNode[], level = 0) => {
        return nodes.map(node => (
            <div key={node.id} style={{ marginLeft: `${level * 20}px` }} className="py-1">
                <div 
                    className={`flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedFile?.id === node.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => node.type === 'file' && setSelectedFile(node)}
                >
                    {node.type === 'folder' ? (
                        <FolderPlus className="w-4 h-4 text-blue-500" />
                    ) : (
                        <FileText className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm flex-1">{node.name}</span>
                    {/* Indicador de colaboradores activos en este archivo */}
                    {node.type === 'file' && activeCollaborators[node.id] && activeCollaborators[node.id].length > 0 && (
                        <div className="flex items-center gap-1">
                            {activeCollaborators[node.id].slice(0, 2).map((userId, index) => {
                                const user = onlineUsers.find(u => u.id === userId);
                                return user ? (
                                    <div 
                                        key={userId}
                                        className="w-3 h-3 rounded-full border border-white"
                                        style={{ backgroundColor: user.color }}
                                        title={`${user.name} está editando`}
                                    />
                                ) : null;
                            })}
                            {activeCollaborators[node.id].length > 2 && (
                                <span className="text-xs text-gray-500">+{activeCollaborators[node.id].length - 2}</span>
                            )}
                        </div>
                    )}
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                        }}
                        className="ml-auto opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
                {node.children && renderFileTree(node.children, level + 1)}
            </div>
        ));
    };

    // Alternar permisos de participante
    const toggleParticipantPermission = (participantId: string) => {
        if (onParticipantPermissionChange) {
            const participant = participants.find(p => p.id === participantId);
            if (participant) {
                onParticipantPermissionChange(participantId, !participant.canEdit);
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            IDE Integrado - {streamType.replace('_', ' ').toUpperCase()}
                        </h2>
                        <Badge variant={isStreaming ? "destructive" : "secondary"}>
                            {isStreaming ? '🔴 EN VIVO' : 'OFFLINE'}
                        </Badge>
                        {collaborativeMode && (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600">Colaborativo</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Usuarios online */}
                        {onlineUsers.length > 0 && (
                            <div className="flex items-center gap-1">
                                {onlineUsers.slice(0, 3).map((user) => (
                                    <div 
                                        key={user.id}
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                        style={{ backgroundColor: user.color }}
                                        title={user.name}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                                {onlineUsers.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
                                        +{onlineUsers.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowParticipants(!showParticipants)}
                        >
                            <Users className="w-4 h-4 mr-1" />
                            Participantes ({participants.length})
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant={collaborativeMode ? "default" : "outline"}
                            onClick={() => setCollaborativeMode(!collaborativeMode)}
                        >
                            <Share2 className="w-4 h-4 mr-1" />
                            Colaborativo
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Explorador de archivos */}
                <div className="w-64 bg-white border-r flex flex-col">
                    <div className="p-3 border-b">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">Explorador</h3>
                            <div className="flex gap-1">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => {
                                        const name = prompt('Nombre del archivo:');
                                        if (name) createFile(name);
                                    }}
                                    className="h-6 w-6 p-0"
                                >
                                    <FileText className="w-3 h-3" />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => {
                                        const name = prompt('Nombre de la carpeta:');
                                        if (name) createFolder(name);
                                    }}
                                    className="h-6 w-6 p-0"
                                >
                                    <FolderPlus className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        
                        <Input 
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Nombre del proyecto"
                            className="text-xs"
                        />
                    </div>
                    
                    <div className="flex-1 overflow-auto p-2">
                        <div className="group">
                            {renderFileTree(files)}
                        </div>
                    </div>
                </div>

                {/* Editor principal */}
                <div className="flex-1 flex flex-col">
                    <Tabs defaultValue="editor" className="flex-1 flex flex-col">
                        <TabsList className="w-full justify-start border-b rounded-none bg-white">
                            <TabsTrigger value="editor">Editor</TabsTrigger>
                            <TabsTrigger value="terminal">Terminal</TabsTrigger>
                            <TabsTrigger value="dependencies">Dependencias</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="editor" className="flex-1 flex flex-col mt-0">
                            {selectedFile ? (
                                <div className="flex-1 flex flex-col">
                                    <div className="bg-white border-b p-2 flex items-center justify-between">
                                        <span className="text-sm font-medium">{selectedFile.name}</span>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={saveFile}>
                                                <Save className="w-4 h-4 mr-1" />
                                                Guardar
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <Textarea 
                                        ref={editorRef}
                                        value={selectedFile.content || ''}
                                        onChange={(e) => {
                                            if (selectedFile) {
                                                const newContent = e.target.value;
                                                setSelectedFile({ ...selectedFile, content: newContent });
                                                
                                                // Enviar cambios en tiempo real si está en modo colaborativo
                                                if (collaborativeMode) {
                                                    handleCodeChangeCollaborative(newContent);
                                                }
                                            }
                                        }}
                                        className="flex-1 font-mono text-sm border-0 rounded-none resize-none focus:ring-0"
                                        placeholder="Escribe tu código aquí..."
                                        disabled={!collaborativeMode && isStreaming && selectedFile && !participants.find(p => p.id === 'current_user')?.canEdit}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Selecciona un archivo para editar</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="terminal" className="flex-1 flex flex-col mt-0">
                            <div className="flex-1 bg-black text-green-400 p-4 font-mono text-sm overflow-auto" ref={terminalRef}>
                                {terminal.map((line, index) => (
                                    <div key={index} className="mb-1">{line}</div>
                                ))}
                                {isExecuting && (
                                    <div className="animate-pulse">Ejecutando...</div>
                                )}
                            </div>
                            
                            <form onSubmit={handleTerminalSubmit} className="bg-black border-t border-gray-700 p-2">
                                <div className="flex items-center text-green-400 font-mono">
                                    <span className="mr-2">$</span>
                                    <Input 
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        className="flex-1 bg-transparent border-0 text-green-400 font-mono focus:ring-0"
                                        placeholder="Escribe un comando..."
                                        disabled={isExecuting}
                                    />
                                </div>
                            </form>
                        </TabsContent>
                        
                        <TabsContent value="dependencies" className="flex-1 mt-0 p-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Instalar Nueva Dependencia</h3>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={newDependency}
                                            onChange={(e) => setNewDependency(e.target.value)}
                                            placeholder="nombre-del-paquete"
                                            onKeyPress={(e) => e.key === 'Enter' && installDependency()}
                                        />
                                        <Button onClick={installDependency}>
                                            <Package className="w-4 h-4 mr-1" />
                                            Instalar
                                        </Button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-semibold mb-2">Dependencias Instaladas</h3>
                                    <div className="space-y-1">
                                        {dependencies.map((dep, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                                                <span className="text-sm">{dep}</span>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    onClick={() => setDependencies(prev => prev.filter((_, i) => i !== index))}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Panel de participantes */}
                {showParticipants && (
                    <div className="w-64 bg-white border-l flex flex-col">
                        <div className="p-3 border-b">
                            <h3 className="font-semibold text-sm">Participantes</h3>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-2">
                            {participants.map(participant => (
                                <div key={participant.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                                    <img 
                                        src={participant.avatar} 
                                        alt={participant.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{participant.name}</div>
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                                participant.isActive ? 'bg-green-500' : 'bg-gray-300'
                                            }`} />
                                            <span className="text-xs text-gray-500">
                                                {participant.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => toggleParticipantPermission(participant.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        {participant.canEdit ? (
                                            <Eye className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <EyeOff className="w-3 h-3 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}