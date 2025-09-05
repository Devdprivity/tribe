import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Upload, 
    File, 
    Trash2, 
    Eye, 
    Download,
    AlertTriangle,
    CheckCircle,
    X,
    Plus,
    Folder,
    FileText,
    Image,
    Code2,
    Archive,
    RefreshCw
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface FileItem {
    name: string;
    path: string;
    size: number;
    size_formatted: string;
    last_modified: number;
}

interface FileManagerProps {
    productId: number;
    files: FileItem[];
    maxFiles?: number;
    maxSizePerFile?: number;
    allowedTypes?: string[];
    onFilesChange?: (files: FileItem[]) => void;
}

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
            return Image;
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'vue':
        case 'html':
        case 'css':
        case 'php':
        case 'py':
        case 'java':
        case 'cs':
        case 'cpp':
        case 'c':
            return Code2;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return Archive;
        case 'txt':
        case 'md':
        case 'pdf':
        case 'doc':
        case 'docx':
            return FileText;
        default:
            return File;
    }
};

const getFileTypeColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
            return 'text-green-400';
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
            return 'text-yellow-400';
        case 'vue':
            return 'text-green-400';
        case 'html':
            return 'text-orange-400';
        case 'css':
            return 'text-blue-400';
        case 'php':
            return 'text-purple-400';
        case 'py':
            return 'text-yellow-400';
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return 'text-red-400';
        default:
            return 'text-white/70';
    }
};

export default function FileManager({ 
    productId, 
    files: initialFiles, 
    maxFiles = 20, 
    maxSizePerFile = 50, // MB
    allowedTypes = ['*'],
    onFilesChange 
}: FileManagerProps) {
    const [files, setFiles] = useState<FileItem[]>(initialFiles);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [dragActive, setDragActive] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        
        const fileArray = Array.from(selectedFiles);
        uploadFiles(fileArray);
    };

    const uploadFiles = async (filesToUpload: File[]) => {
        if (files.length + filesToUpload.length > maxFiles) {
            alert(`Solo puedes subir un máximo de ${maxFiles} archivos`);
            return;
        }

        setUploading(true);
        
        for (const file of filesToUpload) {
            // Check file size
            if (file.size > maxSizePerFile * 1024 * 1024) {
                alert(`El archivo ${file.name} es demasiado grande. Tamaño máximo: ${maxSizePerFile}MB`);
                continue;
            }

            // Check file type if restrictions apply
            if (allowedTypes[0] !== '*') {
                const extension = file.name.split('.').pop()?.toLowerCase();
                if (!extension || !allowedTypes.includes(extension)) {
                    alert(`Tipo de archivo no permitido: ${file.name}`);
                    continue;
                }
            }

            const formData = new FormData();
            formData.append('files[]', file);
            formData.append('overwrite', 'false');

            try {
                setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

                const response = await fetch(route('marketplace.files.upload', productId), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                });

                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.uploaded_files) {
                        // Add new files to the list
                        const newFiles = data.uploaded_files.map((uploadedFile: any) => ({
                            name: uploadedFile.name,
                            path: uploadedFile.path,
                            size: uploadedFile.size,
                            size_formatted: formatFileSize(uploadedFile.size),
                            last_modified: Date.now()
                        }));
                        
                        setFiles(prevFiles => [...prevFiles, ...newFiles]);
                        
                        if (onFilesChange) {
                            onFilesChange([...files, ...newFiles]);
                        }
                    }
                } else {
                    const errorData = await response.json();
                    alert(`Error al subir ${file.name}: ${errorData.error || 'Error desconocido'}`);
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert(`Error al subir ${file.name}`);
            } finally {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[file.name];
                    return newProgress;
                });
            }
        }

        setUploading(false);
    };

    const deleteFile = async (fileName: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${fileName}"?`)) {
            return;
        }

        try {
            const response = await fetch(route('marketplace.files.delete', { productId, fileName }), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const updatedFiles = files.filter(file => file.name !== fileName);
                    setFiles(updatedFiles);
                    
                    if (onFilesChange) {
                        onFilesChange(updatedFiles);
                    }
                }
            } else {
                const errorData = await response.json();
                alert(`Error al eliminar archivo: ${errorData.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error al eliminar archivo');
        }
    };

    const refreshFileList = async () => {
        setRefreshing(true);
        try {
            const response = await fetch(route('marketplace.files.list', productId));
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFiles(data.files);
                    if (onFilesChange) {
                        onFilesChange(data.files);
                    }
                }
            }
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, []);

    const formatFileSize = (bytes: number): string => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unitIndex]}`;
    };

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Folder className="h-5 w-5" />
                            Gestor de Archivos
                        </div>
                        <Button
                            onClick={refreshFileList}
                            disabled={refreshing}
                            size="sm"
                            variant="outline"
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardTitle>
                    <CardDescription className="text-white/70">
                        Sube y gestiona los archivos de tu producto ({files.length}/{maxFiles} archivos)
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {/* Drop Zone */}
                    <div
                        onDragEnter={handleDragIn}
                        onDragLeave={handleDragOut}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                            dragActive 
                                ? 'border-blue-400 bg-blue-400/10' 
                                : 'border-white/20 hover:border-white/30'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                            accept={allowedTypes[0] === '*' ? '*' : allowedTypes.map(t => `.${t}`).join(',')}
                        />
                        
                        <div className="space-y-4">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                                dragActive ? 'bg-blue-400/20' : 'bg-white/10'
                            }`}>
                                <Upload className={`h-8 w-8 ${dragActive ? 'text-blue-400' : 'text-white/70'}`} />
                            </div>
                            
                            <div>
                                <p className="text-white font-medium mb-2">
                                    {dragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o'}
                                </p>
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="bg-blue-500/80 hover:bg-blue-500 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Seleccionar Archivos
                                </Button>
                            </div>
                            
                            <p className="text-white/50 text-sm">
                                Máximo {maxSizePerFile}MB por archivo • Tipos permitidos: {allowedTypes.join(', ')}
                            </p>
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {Object.keys(uploadProgress).length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="text-white font-medium">Subiendo archivos:</h4>
                            {Object.entries(uploadProgress).map(([fileName, progress]) => (
                                <div key={fileName} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-white/70">{fileName}</span>
                                            <span className="text-white/50">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* File List */}
            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Archivos Subidos</CardTitle>
                            <CardDescription className="text-white/70">
                                {files.length} archivos • {formatFileSize(totalSize)} total
                            </CardDescription>
                        </div>
                        
                        {files.length > 0 && (
                            <Badge variant="secondary" className="bg-white/10 text-white/80">
                                {files.length}/{maxFiles} archivos
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                
                <CardContent>
                    {files.length > 0 ? (
                        <div className="space-y-3">
                            {files.map((file, index) => {
                                const FileIcon = getFileIcon(file.name);
                                const iconColor = getFileTypeColor(file.name);
                                
                                return (
                                    <div 
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <FileIcon className={`h-6 w-6 ${iconColor} flex-shrink-0`} />
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-medium truncate">
                                                {file.name}
                                            </div>
                                            <div className="text-white/50 text-sm">
                                                {file.size_formatted} • {new Date(file.last_modified * 1000).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => deleteFile(file.name)}
                                                size="sm"
                                                variant="outline"
                                                className="text-red-400 border-red-400/30 hover:bg-red-400/20 hover:border-red-400/50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Folder className="h-16 w-16 text-white/30 mx-auto mb-4" />
                            <p className="text-white/70 mb-2">No hay archivos subidos</p>
                            <p className="text-white/50 text-sm">
                                Los archivos que subas aparecerán aquí
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* File Limits Warning */}
            {files.length >= maxFiles * 0.8 && (
                <Card className="bg-yellow-500/10 border-yellow-500/20 apple-liquid-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            <div>
                                <p className="text-yellow-300 font-medium">
                                    Límite de archivos
                                </p>
                                <p className="text-yellow-200/80 text-sm">
                                    Estás cerca del límite máximo de archivos ({files.length}/{maxFiles})
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}