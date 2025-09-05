import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Download, 
    Copy, 
    Check, 
    Github, 
    Terminal, 
    Key, 
    Clock,
    Shield,
    AlertTriangle,
    ExternalLink,
    FileText,
    Code2
} from 'lucide-react';

interface DownloadData {
    delivery_method: string;
    github_repo?: string;
    github_release_url?: string;
    git_clone_url?: string;
    git_credentials?: {
        username: string;
        token: string;
    };
    download_url?: string;
    instructions: string;
    expires_at?: string;
    security_notes?: string[];
}

interface DownloadInstructionsProps {
    data: DownloadData;
    token: string;
    purchase: {
        id: number;
        product: {
            title: string;
            seller: {
                username: string;
            };
        };
        download_attempts: number;
        max_attempts: number;
        first_download_at?: string;
        last_download_at?: string;
    };
}

export default function DownloadInstructions({ data, token, purchase }: DownloadInstructionsProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleDirectDownload = () => {
        if (data.download_url) {
            setIsDownloading(true);
            window.open(data.download_url, '_blank');
            setTimeout(() => setIsDownloading(false), 3000);
        }
    };

    const renderGitHubInstructions = () => (
        <Card className="bg-white/5 border-white/10 apple-liquid-card">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Descargar desde GitHub
                </CardTitle>
                <CardDescription className="text-white/70">
                    Descarga la release más reciente del repositorio
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {data.github_release_url ? (
                    <>
                        <div>
                            <label className="text-sm font-medium text-white/80 mb-2 block">
                                URL de Release:
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 bg-white/5 rounded-lg font-mono text-sm text-white/90">
                                    {data.github_release_url}
                                </div>
                                <Button
                                    onClick={() => copyToClipboard(data.github_release_url!, 'release_url')}
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                >
                                    {copiedField === 'release_url' ? 
                                        <Check className="h-4 w-4" /> : 
                                        <Copy className="h-4 w-4" />
                                    }
                                </Button>
                            </div>
                        </div>
                        
                        <Button
                            onClick={() => window.open(data.github_release_url, '_blank')}
                            className="w-full bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ir a GitHub Release
                        </Button>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <AlertTriangle className="h-12 w-12 text-yellow-400/50 mx-auto mb-4" />
                        <p className="text-white/70">Release no disponible en este momento</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderGitAccessInstructions = () => (
        <Card className="bg-white/5 border-white/10 apple-liquid-card">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Acceso Git
                </CardTitle>
                <CardDescription className="text-white/70">
                    Clona el repositorio usando las credenciales temporales
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {data.git_clone_url && (
                    <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block">
                            Comando de clonado:
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 p-3 bg-black/50 rounded-lg font-mono text-sm text-green-400">
                                git clone {data.git_clone_url}
                            </div>
                            <Button
                                onClick={() => copyToClipboard(`git clone ${data.git_clone_url}`, 'git_clone')}
                                size="sm"
                                variant="outline"
                                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                            >
                                {copiedField === 'git_clone' ? 
                                    <Check className="h-4 w-4" /> : 
                                    <Copy className="h-4 w-4" />
                                }
                            </Button>
                        </div>
                    </div>
                )}

                {data.git_credentials && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-white/80 mb-2 block">
                                Usuario temporal:
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 bg-white/5 rounded-lg font-mono text-sm text-white/90">
                                    {data.git_credentials.username}
                                </div>
                                <Button
                                    onClick={() => copyToClipboard(data.git_credentials!.username, 'git_username')}
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                >
                                    {copiedField === 'git_username' ? 
                                        <Check className="h-4 w-4" /> : 
                                        <Copy className="h-4 w-4" />
                                    }
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-white/80 mb-2 block">
                                Token temporal:
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 bg-white/5 rounded-lg font-mono text-sm text-white/90">
                                    {data.git_credentials.token.substring(0, 20)}...
                                </div>
                                <Button
                                    onClick={() => copyToClipboard(data.git_credentials!.token, 'git_token')}
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                >
                                    {copiedField === 'git_token' ? 
                                        <Check className="h-4 w-4" /> : 
                                        <Copy className="h-4 w-4" />
                                    }
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Key className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-yellow-300 font-medium mb-1">Credenciales temporales</p>
                            <p className="text-yellow-200/80">
                                Estas credenciales son válidas por tiempo limitado y solo para este producto.
                                {data.expires_at && (
                                    <> Expiran el {new Date(data.expires_at).toLocaleString()}.</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderZipDownloadInstructions = () => (
        <Card className="bg-white/5 border-white/10 apple-liquid-card">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Descarga Directa
                </CardTitle>
                <CardDescription className="text-white/70">
                    Descarga el archivo ZIP con todos los archivos del producto
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                <Button
                    onClick={handleDirectDownload}
                    disabled={isDownloading}
                    className="w-full bg-green-500/80 hover:bg-green-500 text-white apple-liquid-button h-12"
                >
                    {isDownloading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Iniciando descarga...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar ZIP
                        </>
                    )}
                </Button>
                
                <div className="text-center text-sm text-white/60">
                    <p>El archivo se descargará automáticamente</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Head title="Instrucciones de Descarga - Marketplace" />
            
            <div className="min-h-screen bg-black">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Instrucciones de Descarga
                        </h1>
                        <p className="text-white/70">
                            {purchase.product.title} por {purchase.product.seller.username}
                        </p>
                    </div>

                    {/* Download Stats */}
                    <Card className="bg-white/5 border-white/10 apple-liquid-card mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {purchase.download_attempts}
                                    </div>
                                    <div className="text-sm text-white/70">Intentos usados</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {purchase.max_attempts}
                                    </div>
                                    <div className="text-sm text-white/70">Límite de intentos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {purchase.max_attempts - purchase.download_attempts}
                                    </div>
                                    <div className="text-sm text-white/70">Intentos restantes</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Method Badge */}
                    <div className="flex justify-center mb-6">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-sm px-4 py-2">
                            Método: {data.delivery_method === 'github_release' ? 'GitHub Release' : 
                                     data.delivery_method === 'git_access' ? 'Acceso Git' : 
                                     'Descarga ZIP'}
                        </Badge>
                    </div>

                    {/* Instructions based on delivery method */}
                    <div className="space-y-6">
                        {data.delivery_method === 'github_release' && renderGitHubInstructions()}
                        {data.delivery_method === 'git_access' && renderGitAccessInstructions()}
                        {data.delivery_method === 'zip_file' && renderZipDownloadInstructions()}

                        {/* General Instructions */}
                        {data.instructions && (
                            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Instrucciones Adicionales
                                    </CardTitle>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-white/80 whitespace-pre-wrap">
                                            {data.instructions}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Security Notes */}
                        {data.security_notes && data.security_notes.length > 0 && (
                            <Card className="bg-red-500/10 border-red-500/20 apple-liquid-card">
                                <CardHeader>
                                    <CardTitle className="text-red-300 flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Notas de Seguridad
                                    </CardTitle>
                                </CardHeader>
                                
                                <CardContent>
                                    <ul className="space-y-2">
                                        {data.security_notes.map((note, index) => (
                                            <li key={index} className="flex items-start gap-2 text-red-200/90">
                                                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Expiration Warning */}
                        {data.expires_at && (
                            <Card className="bg-yellow-500/10 border-yellow-500/20 apple-liquid-card">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-yellow-400" />
                                        <div>
                                            <p className="text-yellow-300 font-medium">
                                                Acceso temporal
                                            </p>
                                            <p className="text-yellow-200/80 text-sm">
                                                Este enlace de descarga expira el {new Date(data.expires_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Support Information */}
                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardHeader>
                                <CardTitle className="text-white">¿Necesitas ayuda?</CardTitle>
                            </CardHeader>
                            
                            <CardContent>
                                <p className="text-white/70 mb-4">
                                    Si tienes problemas para descargar o instalar este producto, puedes:
                                </p>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        Contactar al vendedor
                                    </Button>
                                    <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        Ver mis compras
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}