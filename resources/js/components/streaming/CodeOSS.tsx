import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    File, 
    Folder, 
    FolderOpen, 
    Plus, 
    Save, 
    Play, 
    Terminal, 
    Settings,
    Search,
    GitBranch,
    Bug,
    Package,
    X,
    Maximize2,
    Minimize2,
    Copy,
    Download,
    Upload
} from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    language?: string;
    children?: FileItem[];
    isOpen?: boolean;
}

interface Terminal {
    id: string;
    name: string;
    content: string[];
    isActive: boolean;
}

interface Participant {
    id: string;
    name: string;
    avatar: string;
    canEdit: boolean;
    isActive: boolean;
    cursor?: {
        line: number;
        column: number;
    };
}

interface CodeOSSProps {
    participants: Participant[];
    onCodeChange?: (fileId: string, content: string) => void;
    onTerminalCommand?: (command: string, terminalId: string) => void;
    onParticipantPermissionChange?: (participantId: string, canEdit: boolean) => void;
    isHost?: boolean;
    streamType?: 'code_review' | 'debugging' | 'project_building' | 'interview_prep';
}

export default function CodeOSS({ 
    participants = [], 
    onCodeChange, 
    onTerminalCommand,
    onParticipantPermissionChange,
    isHost = false,
    streamType = 'code_review'
}: CodeOSSProps) {
    // File system state
    const [fileSystem, setFileSystem] = useState<FileItem[]>([
        {
            id: 'project',
            name: 'streaming-project',
            type: 'folder',
            isOpen: true,
            children: [
                {
                    id: 'src',
                    name: 'src',
                    type: 'folder',
                    isOpen: true,
                    children: [
                        {
                            id: 'main.js',
                            name: 'main.js',
                            type: 'file',
                            language: 'javascript',
                            content: '// Welcome to live coding session!\n\nfunction main() {\n    console.log("Hello, streaming world!");\n}\n\nmain();'
                        },
                        {
                            id: 'index.html',
                            name: 'index.html',
                            type: 'file',
                            language: 'html',
                            content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Live Coding</title>\n</head>\n<body>\n    <h1>Live Coding Session</h1>\n    <script src="main.js"></script>\n</body>\n</html>'
                        }
                    ]
                },
                {
                    id: 'package.json',
                    name: 'package.json',
                    type: 'file',
                    language: 'json',
                    content: '{\n  "name": "streaming-project",\n  "version": "1.0.0",\n  "description": "Live coding session",\n  "main": "src/main.js",\n  "scripts": {\n    "start": "node src/main.js",\n    "dev": "nodemon src/main.js"\n  },\n  "dependencies": {},\n  "devDependencies": {}\n}'
                }
            ]
        }
    ]);

    // Editor state
    const [activeFile, setActiveFile] = useState<FileItem | null>(null);
    const [openTabs, setOpenTabs] = useState<FileItem[]>([]);
    
    // Terminal state
    const [terminals, setTerminals] = useState<Terminal[]>([
        {
            id: 'main',
            name: 'Terminal 1',
            content: [
                '$ Welcome to Code-OSS Integrated Terminal',
                '$ Type commands here to execute in real-time',
                '$ '
            ],
            isActive: true
        }
    ]);
    const [terminalInput, setTerminalInput] = useState('');
    
    // Layout state
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [showTerminal, setShowTerminal] = useState(true);
    
    // Permissions
    const canEdit = isHost || participants.find(p => p.id === 'current')?.canEdit || false;

    // Initialize with first file
    useEffect(() => {
        const firstFile = findFileById(fileSystem, 'main.js');
        if (firstFile && openTabs.length === 0) {
            openFile(firstFile);
        }
    }, []);

    // File system utilities
    const findFileById = (items: FileItem[], id: string): FileItem | null => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.children) {
                const found = findFileById(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const toggleFolder = (folderId: string) => {
        const updateItems = (items: FileItem[]): FileItem[] => {
            return items.map(item => {
                if (item.id === folderId) {
                    return { ...item, isOpen: !item.isOpen };
                }
                if (item.children) {
                    return { ...item, children: updateItems(item.children) };
                }
                return item;
            });
        };
        setFileSystem(updateItems(fileSystem));
    };

    const openFile = (file: FileItem) => {
        if (file.type === 'folder') {
            toggleFolder(file.id);
            return;
        }
        
        setActiveFile(file);
        if (!openTabs.find(tab => tab.id === file.id)) {
            setOpenTabs([...openTabs, file]);
        }
    };

    const closeTab = (fileId: string) => {
        const newTabs = openTabs.filter(tab => tab.id !== fileId);
        setOpenTabs(newTabs);
        if (activeFile?.id === fileId) {
            setActiveFile(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
        }
    };

    const updateFileContent = (fileId: string, content: string) => {
        if (!canEdit) return;

        const updateItems = (items: FileItem[]): FileItem[] => {
            return items.map(item => {
                if (item.id === fileId) {
                    const updated = { ...item, content };
                    // Update active file if it's the same
                    if (activeFile?.id === fileId) {
                        setActiveFile(updated);
                    }
                    // Update open tabs
                    setOpenTabs(tabs => tabs.map(tab => 
                        tab.id === fileId ? updated : tab
                    ));
                    return updated;
                }
                if (item.children) {
                    return { ...item, children: updateItems(item.children) };
                }
                return item;
            });
        };

        setFileSystem(updateItems(fileSystem));
        onCodeChange?.(fileId, content);
    };

    const executeCommand = (command: string) => {
        if (!canEdit) return;

        const activeTerminal = terminals.find(t => t.isActive);
        if (!activeTerminal) return;

        const newContent = [...activeTerminal.content];
        newContent.push(`$ ${command}`);

        // Simulate command execution
        switch (command.trim()) {
            case 'ls':
                newContent.push('src/  package.json  README.md');
                break;
            case 'npm install':
                newContent.push('Installing dependencies...');
                newContent.push('✓ Dependencies installed successfully');
                break;
            case 'npm start':
                newContent.push('Starting application...');
                newContent.push('> streaming-project@1.0.0 start');
                newContent.push('Hello, streaming world!');
                break;
            case 'clear':
                newContent.length = 0;
                break;
            default:
                if (command.trim()) {
                    newContent.push(`Command '${command}' not found`);
                }
                break;
        }

        newContent.push('$ ');

        setTerminals(terminals.map(t => 
            t.id === activeTerminal.id 
                ? { ...t, content: newContent }
                : t
        ));

        onTerminalCommand?.(command, activeTerminal.id);
        setTerminalInput('');
    };

    const renderFileTree = (items: FileItem[], depth = 0) => {
        return items.map(item => (
            <div key={item.id}>
                <div 
                    className={`flex items-center px-2 py-1 cursor-pointer hover:bg-white/5 text-sm ${
                        activeFile?.id === item.id ? 'bg-blue-600/30' : ''
                    }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => openFile(item)}
                >
                    {item.type === 'folder' ? (
                        item.isOpen ? <FolderOpen className="w-4 h-4 mr-2" /> : <Folder className="w-4 h-4 mr-2" />
                    ) : (
                        <File className="w-4 h-4 mr-2" />
                    )}
                    <span className="text-white">{item.name}</span>
                </div>
                {item.type === 'folder' && item.isOpen && item.children && (
                    renderFileTree(item.children, depth + 1)
                )}
            </div>
        ));
    };

    return (
        <div className="h-full bg-gray-900 flex flex-col text-white">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm font-medium text-white">Code-OSS Live Session</span>
                    <Badge variant="outline" className="text-xs">
                        {streamType.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={canEdit ? "default" : "secondary"} className="text-xs">
                        {canEdit ? "Editor" : "Viewer"}
                    </Badge>
                    <span className="text-xs text-white/70">
                        {participants.length} participant{participants.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - File Explorer */}
                <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                    <div className="p-2 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-white flex items-center">
                            <Folder className="w-4 h-4 mr-2" />
                            Explorer
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {renderFileTree(fileSystem)}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Tabs */}
                    {openTabs.length > 0 && (
                        <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
                            {openTabs.map(tab => (
                                <div 
                                    key={tab.id}
                                    className={`flex items-center px-3 py-2 border-r border-gray-700 cursor-pointer min-w-0 ${
                                        activeFile?.id === tab.id ? 'bg-gray-900' : 'hover:bg-gray-700'
                                    }`}
                                    onClick={() => setActiveFile(tab)}
                                >
                                    <File className="w-3 h-3 mr-2 flex-shrink-0" />
                                    <span className="text-sm truncate">{tab.name}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="ml-2 h-4 w-4 p-0 hover:bg-gray-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeTab(tab.id);
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Editor */}
                    <div className="flex-1 relative">
                        {activeFile ? (
                            <div className="h-full flex flex-col">
                                <textarea
                                    className="flex-1 bg-gray-900 text-white p-4 font-mono text-sm resize-none outline-none border-none"
                                    value={activeFile.content || ''}
                                    onChange={(e) => updateFileContent(activeFile.id, e.target.value)}
                                    placeholder="Start coding..."
                                    disabled={!canEdit}
                                    style={{
                                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                        lineHeight: '1.5'
                                    }}
                                />
                                {/* Participants cursors would go here */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {participants.filter(p => p.isActive).map(participant => (
                                        <div
                                            key={participant.id}
                                            className="w-2 h-2 rounded-full border border-white/50"
                                            style={{ backgroundColor: `hsl(${participant.id.charCodeAt(0) * 20}, 70%, 60%)` }}
                                            title={participant.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/50">
                                <div className="text-center">
                                    <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Select a file to start editing</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Terminal */}
                    {showTerminal && (
                        <div className="h-48 bg-black border-t border-gray-700 flex flex-col">
                            <div className="flex items-center justify-between p-2 bg-gray-800">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4" />
                                    <span className="text-sm font-medium">Terminal</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowTerminal(false)}
                                    className="text-white hover:bg-gray-700"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex-1 p-2 overflow-auto font-mono text-sm">
                                {terminals.find(t => t.isActive)?.content.map((line, index) => (
                                    <div key={index} className="text-green-400">
                                        {line}
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 border-t border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">$</span>
                                    <input
                                        type="text"
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                executeCommand(terminalInput);
                                            }
                                        }}
                                        className="flex-1 bg-transparent text-white outline-none font-mono"
                                        placeholder="Type command here..."
                                        disabled={!canEdit}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show Terminal button when hidden */}
                    {!showTerminal && (
                        <div className="p-2 bg-gray-800 border-t border-gray-700">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowTerminal(true)}
                                className="apple-liquid-button bg-gray-700 text-white border-gray-600"
                            >
                                <Terminal className="w-4 h-4 mr-2" />
                                Show Terminal
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}