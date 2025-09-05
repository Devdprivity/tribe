import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Download, 
    CheckCircle, 
    Clock,
    AlertTriangle,
    Package,
    User,
    Calendar,
    BarChart3,
    Shield,
    ExternalLink,
    ArrowLeft
} from 'lucide-react';

interface Purchase {
    id: number;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
    download_attempts: number;
    first_download_at?: string;
    last_download_at?: string;
    can_download: boolean;
    product: {
        id: number;
        title: string;
        type: string;
        delivery_method: string;
        includes_support: boolean;
        support_duration_days?: number;
    };
    seller: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface DeliveryData {
    delivery_method: string;
    download_limits: {
        max_attempts: number;
        expires_at?: string;
    };
    support_info?: {
        included: boolean;
        duration_days?: number;
        expires_at?: string;
    };
}

interface DownloadStats {
    attempts: number;
    max_attempts: number;
    first_download?: string;
    last_download?: string;
}

interface DownloadInfoProps {
    purchase: Purchase;
    delivery_data: DeliveryData;
    download_url: string;
    can_download: boolean;
    download_stats: DownloadStats;
}

const deliveryMethods = {
    github_release: 'GitHub Release',
    zip_file: 'Archivo ZIP',
    git_access: 'Acceso Git',
};

const statusColors = {
    completed: 'bg-green-500/20 text-green-300 border-green-400/30',
    processing: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    failed: 'bg-red-500/20 text-red-300 border-red-400/30',
    disputed: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
};

const statusLabels = {
    completed: 'Completada',
    processing: 'Procesando',
    failed: 'Fallida',
    disputed: 'En disputa',
};

export default function DownloadInfo({ 
    purchase, 
    delivery_data, 
    download_url, 
    can_download, 
    download_stats 
}: DownloadInfoProps) {
    const remainingAttempts = download_stats.max_attempts - download_stats.attempts;
    const hasExpired = delivery_data.download_limits.expires_at && 
                       new Date() > new Date(delivery_data.download_limits.expires_at);
    
    const canDownloadNow = can_download && !hasExpired && remainingAttempts > 0;

    return (
        <>
            <Head title={`Descarga: ${purchase.product.title}`} />
            
            <div className="min-h-screen bg-black">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Link href={route('marketplace.purchases')}>
                                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Mis Compras
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Información de Descarga
                            </h1>
                            <p className="text-white/70">
                                {purchase.product.title} por {purchase.seller.username}
                            </p>
                        </div>
                    </div>

                    {/* Purchase Status */}
                    <Card className="bg-white/5 border-white/10 apple-liquid-card mb-8">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Estado de la Compra
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className={statusColors[purchase.status as keyof typeof statusColors]}>
                                            {statusLabels[purchase.status as keyof typeof statusLabels]}
                                        </Badge>
                                        <span className="text-white/70">•</span>
                                        <span className="text-white font-semibold">
                                            {purchase.currency} {purchase.amount}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Calendar className="h-4 w-4" />
                                            <span>Comprado: {new Date(purchase.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Package className="h-4 w-4" />
                                            <span>Tipo: {purchase.product.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Download className="h-4 w-4" />
                                            <span>Entrega: {deliveryMethods[purchase.product.delivery_method as keyof typeof deliveryMethods]}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">
                                            {purchase.seller.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{purchase.seller.username}</div>
                                        <div className="text-sm text-white/70">{purchase.seller.full_name}</div>
                                        <Link href={route('users.show', purchase.seller.id)}>
                                            <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                                                Ver perfil <ExternalLink className="h-3 w-3 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Download Statistics */}
                    <Card className="bg-white/5 border-white/10 apple-liquid-card mb-8">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Estadísticas de Descarga
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {download_stats.attempts}
                                    </div>
                                    <div className="text-sm text-white/70">Intentos usados</div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {remainingAttempts}
                                    </div>
                                    <div className="text-sm text-white/70">Restantes</div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {download_stats.first_download ? 
                                            new Date(download_stats.first_download).toLocaleDateString() : 
                                            'N/A'
                                        }
                                    </div>
                                    <div className="text-sm text-white/70">Primera descarga</div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {download_stats.last_download ? 
                                            new Date(download_stats.last_download).toLocaleDateString() : 
                                            'N/A'
                                        }
                                    </div>
                                    <div className="text-sm text-white/70">Última descarga</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Download Action */}
                    <Card className="bg-white/5 border-white/10 apple-liquid-card mb-8">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Descargar Producto
                            </CardTitle>
                            <CardDescription className="text-white/70">
                                {canDownloadNow ? 
                                    'Tu producto está listo para descargar' :
                                    'La descarga no está disponible en este momento'
                                }
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                            {canDownloadNow ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <div>
                                            <p className="text-green-300 font-medium">Descarga disponible</p>
                                            <p className="text-green-200/80 text-sm">
                                                Tienes {remainingAttempts} intentos restantes
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Link href={download_url}>
                                        <Button className="w-full bg-green-500/80 hover:bg-green-500 text-white apple-liquid-button h-12">
                                            <Download className="h-4 w-4 mr-2" />
                                            Iniciar Descarga
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {remainingAttempts <= 0 && (
                                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                            <div>
                                                <p className="text-red-300 font-medium">Límite de descargas alcanzado</p>
                                                <p className="text-red-200/80 text-sm">
                                                    Has usado todos tus intentos de descarga
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {hasExpired && (
                                        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                            <Clock className="h-5 w-5 text-yellow-400" />
                                            <div>
                                                <p className="text-yellow-300 font-medium">Enlace expirado</p>
                                                <p className="text-yellow-200/80 text-sm">
                                                    El enlace de descarga ha expirado
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!can_download && (
                                        <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                                            <div>
                                                <p className="text-orange-300 font-medium">Descarga no disponible</p>
                                                <p className="text-orange-200/80 text-sm">
                                                    El producto aún no está listo para descarga
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <Button 
                                        disabled 
                                        className="w-full bg-white/5 text-white/50 cursor-not-allowed h-12"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Descarga no disponible
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Support Information */}
                    {purchase.product.includes_support && (
                        <Card className="bg-white/5 border-white/10 apple-liquid-card mb-8">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Soporte Incluido
                                </CardTitle>
                            </CardHeader>
                            
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <span className="text-white">Soporte incluido en tu compra</span>
                                    </div>
                                    
                                    {purchase.product.support_duration_days && (
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-blue-400" />
                                            <span className="text-white/80">
                                                {purchase.product.support_duration_days} días de soporte
                                            </span>
                                        </div>
                                    )}
                                    
                                    {delivery_data.support_info?.expires_at && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-yellow-400" />
                                            <span className="text-white/80">
                                                Expira: {new Date(delivery_data.support_info.expires_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="pt-4">
                                        <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                            <User className="h-4 w-4 mr-2" />
                                            Contactar Soporte
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Additional Actions */}
                    <Card className="bg-white/5 border-white/10 apple-liquid-card">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href={route('marketplace.purchases')}>
                                    <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        Ver Todas Mis Compras
                                    </Button>
                                </Link>
                                
                                <Link href={route('marketplace.products.show', purchase.product.id)}>
                                    <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        Ver Producto
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}