import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Download, 
    ShoppingCart,
    CreditCard,
    Clock,
    RefreshCw,
    ArrowLeft,
    Package,
    User,
    Calendar,
    DollarSign,
    ExternalLink
} from 'lucide-react';

interface Purchase {
    id: number;
    order_number: string;
    amount: string;
    currency: string;
    status: string;
    payment_method: string;
    delivery_status: string;
    created_at: string;
    download_token?: string;
    can_download: boolean;
    product: {
        id: number;
        title: string;
        type: string;
        delivery_method: string;
        images: string[];
    };
    seller: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface PaymentStatusProps {
    type: 'success' | 'cancelled' | 'error';
    purchase?: Purchase;
    error_message?: string;
    retry_url?: string;
    session_id?: string;
}

const statusIcons = {
    success: CheckCircle,
    cancelled: XCircle,
    error: AlertTriangle,
};

const statusColors = {
    success: 'text-green-400',
    cancelled: 'text-yellow-400',
    error: 'text-red-400',
};

const statusBgColors = {
    success: 'bg-green-500/10 border-green-500/20',
    cancelled: 'bg-yellow-500/10 border-yellow-500/20',
    error: 'bg-red-500/10 border-red-500/20',
};

const statusTitles = {
    success: '¡Pago Exitoso!',
    cancelled: 'Pago Cancelado',
    error: 'Error en el Pago',
};

const statusMessages = {
    success: 'Tu compra se ha procesado exitosamente',
    cancelled: 'Has cancelado el proceso de pago',
    error: 'Ha ocurrido un error al procesar tu pago',
};

const deliveryMethods = {
    github_release: 'GitHub Release',
    zip_file: 'Archivo ZIP',
    git_access: 'Acceso Git',
};

const paymentMethods = {
    card: 'Tarjeta de Crédito/Débito',
    paypal: 'PayPal',
    bank_transfer: 'Transferencia Bancaria',
};

export default function PaymentStatus({ 
    type, 
    purchase, 
    error_message, 
    retry_url,
    session_id 
}: PaymentStatusProps) {
    const StatusIcon = statusIcons[type];
    
    // Auto-refresh for processing status
    useEffect(() => {
        if (purchase?.status === 'processing') {
            const interval = setInterval(() => {
                window.location.reload();
            }, 5000); // Refresh every 5 seconds

            return () => clearInterval(interval);
        }
    }, [purchase?.status]);

    const renderSuccessContent = () => (
        <div className="space-y-8">
            {/* Success Message */}
            <Card className={`${statusBgColors.success} apple-liquid-card`}>
                <CardContent className="p-8 text-center">
                    <StatusIcon className={`h-16 w-16 ${statusColors.success} mx-auto mb-4`} />
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {statusTitles.success}
                    </h1>
                    <p className="text-white/70 text-lg">
                        {statusMessages.success}
                    </p>
                    
                    {purchase && (
                        <div className="mt-6 p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-white/60 mb-2">Número de Orden</div>
                            <div className="text-xl font-mono text-white">
                                {purchase.order_number}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Purchase Details */}
            {purchase && (
                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Detalles de la Compra
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-start gap-4 mb-4">
                                    {purchase.product.images?.[0] ? (
                                        <img 
                                            src={purchase.product.images[0]} 
                                            alt={purchase.product.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                                            <Package className="h-8 w-8 text-white/50" />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white mb-1">
                                            {purchase.product.title}
                                        </h3>
                                        <p className="text-white/70 text-sm">
                                            Tipo: {purchase.product.type}
                                        </p>
                                        <p className="text-white/70 text-sm">
                                            Entrega: {deliveryMethods[purchase.product.delivery_method as keyof typeof deliveryMethods]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/70">Monto:</span>
                                    <span className="text-white font-semibold">
                                        {purchase.currency} {purchase.amount}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/70">Método de pago:</span>
                                    <span className="text-white">
                                        {paymentMethods[purchase.payment_method as keyof typeof paymentMethods] || purchase.payment_method}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/70">Estado:</span>
                                    <Badge className={
                                        purchase.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                                        purchase.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                                        'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                    }>
                                        {purchase.status === 'completed' ? 'Completado' :
                                         purchase.status === 'processing' ? 'Procesando' : 
                                         'Pendiente'}
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/70">Fecha:</span>
                                    <span className="text-white/80">
                                        {new Date(purchase.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Download Section */}
            {purchase && (
                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Descarga del Producto
                        </CardTitle>
                        <CardDescription className="text-white/70">
                            {purchase.can_download ? 
                                'Tu producto está listo para descargar' : 
                                'Tu descarga se está preparando'
                            }
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        {purchase.can_download ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                    <div>
                                        <p className="text-green-300 font-medium">Descarga disponible</p>
                                        <p className="text-green-200/80 text-sm">
                                            Tu producto está listo para descargar
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {purchase.download_token && (
                                        <Link href={route('marketplace.download.info', purchase.download_token)}>
                                            <Button className="w-full bg-green-500/80 hover:bg-green-500 text-white apple-liquid-button">
                                                <Download className="h-4 w-4 mr-2" />
                                                Ver Instrucciones
                                            </Button>
                                        </Link>
                                    )}
                                    
                                    <Link href={route('marketplace.purchases')}>
                                        <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                            Mis Compras
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-400" />
                                    <div>
                                        <p className="text-yellow-300 font-medium">Preparando descarga</p>
                                        <p className="text-yellow-200/80 text-sm">
                                            {purchase.status === 'processing' ? 
                                                'Estamos procesando tu compra...' :
                                                'Tu descarga se estará disponible pronto'
                                            }
                                        </p>
                                    </div>
                                </div>
                                
                                {purchase.status === 'processing' && (
                                    <div className="text-center">
                                        <RefreshCw className="h-6 w-6 text-white/50 mx-auto mb-2 animate-spin" />
                                        <p className="text-white/70 text-sm">
                                            Esta página se actualizará automáticamente
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Seller Info */}
            {purchase && (
                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Vendedor
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-lg font-bold text-white">
                                    {purchase.seller.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            
                            <div className="flex-1">
                                <div className="font-semibold text-white">{purchase.seller.username}</div>
                                <div className="text-sm text-white/70">{purchase.seller.full_name}</div>
                            </div>
                            
                            <Link href={route('users.show', purchase.seller.id)}>
                                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                    Ver Perfil <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderCancelledContent = () => (
        <div className="space-y-8">
            <Card className={`${statusBgColors.cancelled} apple-liquid-card`}>
                <CardContent className="p-8 text-center">
                    <StatusIcon className={`h-16 w-16 ${statusColors.cancelled} mx-auto mb-4`} />
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {statusTitles.cancelled}
                    </h1>
                    <p className="text-white/70 text-lg mb-6">
                        {statusMessages.cancelled}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        {retry_url && (
                            <Link href={retry_url}>
                                <Button className="w-full bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Intentar de Nuevo
                                </Button>
                            </Link>
                        )}
                        
                        <Link href={route('marketplace.index')}>
                            <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Marketplace
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderErrorContent = () => (
        <div className="space-y-8">
            <Card className={`${statusBgColors.error} apple-liquid-card`}>
                <CardContent className="p-8 text-center">
                    <StatusIcon className={`h-16 w-16 ${statusColors.error} mx-auto mb-4`} />
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {statusTitles.error}
                    </h1>
                    <p className="text-white/70 text-lg mb-4">
                        {statusMessages.error}
                    </p>
                    
                    {error_message && (
                        <div className="p-4 bg-white/5 rounded-lg mb-6">
                            <p className="text-white/80 text-sm">
                                Error: {error_message}
                            </p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        {retry_url && (
                            <Link href={retry_url}>
                                <Button className="w-full bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Intentar de Nuevo
                                </Button>
                            </Link>
                        )}
                        
                        <Link href={route('marketplace.index')}>
                            <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Marketplace
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {type === 'success' && renderSuccessContent()}
                {type === 'cancelled' && renderCancelledContent()}
                {type === 'error' && renderErrorContent()}
                
                {/* Support Section */}
                <Card className="bg-white/5 border-white/10 apple-liquid-card mt-8">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <h3 className="text-white font-semibold mb-2">¿Necesitas ayuda?</h3>
                            <p className="text-white/70 text-sm mb-4">
                                Si tienes problemas o preguntas sobre tu compra, puedes contactarnos
                            </p>
                            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                Contactar Soporte
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}