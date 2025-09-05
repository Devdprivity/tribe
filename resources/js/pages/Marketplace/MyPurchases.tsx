import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Search, 
    Download, 
    Star, 
    MessageSquare, 
    AlertTriangle,
    Package,
    User,
    Calendar,
    DollarSign,
    Filter,
    Eye,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

interface Purchase {
    id: number;
    order_number: string;
    amount: number;
    currency: string;
    status: string;
    delivery_status: string;
    delivered_at?: string;
    can_dispute: boolean;
    dispute_deadline?: string;
    review_submitted: boolean;
    created_at: string;
    product: {
        id: number;
        title: string;
        images: string[];
        slug: string;
    };
    seller: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface MyPurchasesProps {
    purchases: {
        data: Purchase[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const statusColors = {
    completed: 'bg-green-500/20 text-green-300 border-green-400/30',
    paid: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    processing: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    failed: 'bg-red-500/20 text-red-300 border-red-400/30',
    cancelled: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
    disputed: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    refunded: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
};

const deliveryStatusColors = {
    delivered: 'bg-green-500/20 text-green-300 border-green-400/30',
    processing: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    failed: 'bg-red-500/20 text-red-300 border-red-400/30',
    pending: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
};

const statusLabels = {
    completed: 'Completado',
    paid: 'Pagado',
    processing: 'Procesando',
    failed: 'Fallido',
    cancelled: 'Cancelado',
    disputed: 'En Disputa',
    refunded: 'Reembolsado',
};

const deliveryStatusLabels = {
    delivered: 'Entregado',
    processing: 'Procesando',
    failed: 'Fallido',
    pending: 'Pendiente',
};

export default function MyPurchases({ purchases }: MyPurchasesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('marketplace.my-purchases'), {
            search: searchTerm,
            status: statusFilter,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDownload = (purchase: Purchase) => {
        if (purchase.delivery_status === 'delivered') {
            // TODO: Implement download functionality
            console.log('Downloading product for purchase:', purchase.id);
        }
    };

    const handleReview = (purchase: Purchase) => {
        if (!purchase.review_submitted) {
            // TODO: Open review modal
            console.log('Opening review for purchase:', purchase.id);
        }
    };

    const handleDispute = (purchase: Purchase) => {
        if (purchase.can_dispute) {
            router.visit(route('disputes.create', purchase.id));
        }
    };

    const PurchaseCard = ({ purchase }: { purchase: Purchase }) => {
        return (
            <Card className="bg-white/5 border-white/10 apple-liquid-card hover:border-white/20 transition-colors">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                            {purchase.product.images.length > 0 ? (
                                <img
                                    src={purchase.product.images[0]}
                                    alt={purchase.product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-8 w-8 text-white/30" />
                                </div>
                            )}
                        </div>

                        {/* Purchase Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-white mb-1">
                                        <Link 
                                            href={route('marketplace.products.show', purchase.product.id)}
                                            className="hover:text-blue-300 transition-colors"
                                        >
                                            {purchase.product.title}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                                        <User className="h-3 w-3" />
                                        <span>{purchase.seller.username}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        {purchase.currency} {purchase.amount.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-white/70">
                                        Orden #{purchase.order_number}
                                    </div>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className={statusColors[purchase.status as keyof typeof statusColors]}>
                                    {statusLabels[purchase.status as keyof typeof statusLabels]}
                                </Badge>
                                <Badge className={deliveryStatusColors[purchase.delivery_status as keyof typeof deliveryStatusColors]}>
                                    {deliveryStatusLabels[purchase.delivery_status as keyof typeof deliveryStatusLabels]}
                                </Badge>
                            </div>

                            {/* Purchase Date */}
                            <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                                <Calendar className="h-3 w-3" />
                                <span>Comprado el {new Date(purchase.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-wrap">
                                {purchase.delivery_status === 'delivered' && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleDownload(purchase)}
                                        className="bg-blue-500/80 hover:bg-blue-500 text-white"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Descargar
                                    </Button>
                                )}

                                {!purchase.review_submitted && purchase.status === 'completed' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReview(purchase)}
                                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                    >
                                        <Star className="h-3 w-3 mr-1" />
                                        Reseñar
                                    </Button>
                                )}

                                {purchase.can_dispute && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDispute(purchase)}
                                        className="bg-orange-500/20 text-orange-300 border-orange-400/30 hover:bg-orange-500/30"
                                    >
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Disputar
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                >
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    Contactar
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Head title="Mis Compras - Tribe Marketplace" />
            
            <div className="min-h-screen bg-black">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Mis Compras</h1>
                                <p className="text-white/70">
                                    Gestiona y descarga tus productos comprados
                                </p>
                            </div>
                            <Link href={route('marketplace.index')}>
                                <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button">
                                    Explorar Marketplace
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Filters */}
                    <Card className="bg-white/5 border-white/10 apple-liquid-card mb-8">
                        <CardContent className="p-6">
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex-1 min-w-64">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar en mis compras..."
                                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 apple-liquid-input"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        {Object.entries(statusLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value} className="text-white hover:bg-white/20">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button 
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button"
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Package className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{purchases.total}</div>
                                        <div className="text-sm text-white/70">Total Compras</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {purchases.data.filter(p => p.status === 'completed').length}
                                        </div>
                                        <div className="text-sm text-white/70">Completadas</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                                        <Clock className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {purchases.data.filter(p => p.status === 'processing').length}
                                        </div>
                                        <div className="text-sm text-white/70">Procesando</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <AlertTriangle className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {purchases.data.filter(p => p.can_dispute).length}
                                        </div>
                                        <div className="text-sm text-white/70">Pueden Disputar</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Purchases List */}
                    {purchases.data.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.data.map(purchase => (
                                <PurchaseCard key={purchase.id} purchase={purchase} />
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-12 text-center">
                                <Package className="h-16 w-16 text-white/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No tienes compras aún</h3>
                                <p className="text-white/70 mb-6">
                                    Explora nuestro marketplace y descubre productos increíbles para desarrolladores
                                </p>
                                <Link href={route('marketplace.index')}>
                                    <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button">
                                        Explorar Marketplace
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                    {purchases && purchases.last_page && purchases.last_page > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex gap-2">
                                {Array.from({ length: purchases.last_page }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={page === purchases.current_page ? "default" : "outline"}
                                        onClick={() => router.get(route('marketplace.my-purchases'), { page })}
                                        className={page === purchases.current_page 
                                            ? "bg-blue-500/80 text-white" 
                                            : "bg-white/10 text-white/70 hover:bg-white/20"
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
