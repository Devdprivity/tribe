import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    Star,
    Package,
    Calendar,
    DollarSign,
    Filter,
    MoreVertical,
    TrendingUp,
    Users,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

interface Product {
    id: number;
    title: string;
    short_description: string;
    price: number;
    currency: string;
    type: string;
    category: string;
    status: string;
    featured: boolean;
    images: string[];
    sales_count: number;
    views_count: number;
    avg_rating: number;
    reviews_count: number;
    created_at: string;
    updated_at: string;
}

interface MyProductsProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const statusColors = {
    active: 'bg-green-500/20 text-green-300 border-green-400/30',
    draft: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
    pending_review: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    paused: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-400/30',
    banned: 'bg-red-500/20 text-red-300 border-red-400/30',
};

const statusLabels = {
    active: 'Activo',
    draft: 'Borrador',
    pending_review: 'En Revisión',
    paused: 'Pausado',
    rejected: 'Rechazado',
    banned: 'Baneado',
};

const statusIcons = {
    active: CheckCircle,
    draft: Clock,
    pending_review: Clock,
    paused: AlertCircle,
    rejected: XCircle,
    banned: XCircle,
};

export default function MyProducts({ products }: MyProductsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('marketplace.my-products'), {
            search: searchTerm,
            status: statusFilter,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleToggleStatus = (product: Product) => {
        router.post(route('marketplace.toggle-status', product.id), {}, {
            preserveState: true,
        });
    };

    const handleDelete = (product: Product) => {
        if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
            router.delete(route('marketplace.destroy', product.id), {
                preserveState: true,
            });
        }
    };

    const ProductCard = ({ product }: { product: Product }) => {
        const StatusIcon = statusIcons[product.status as keyof typeof statusIcons];
        
        return (
            <Card className="bg-white/5 border-white/10 apple-liquid-card hover:border-white/20 transition-colors">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-8 w-8 text-white/30" />
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-white mb-1">
                                        <Link 
                                            href={route('marketplace.products.show', product.id)}
                                            className="hover:text-blue-300 transition-colors"
                                        >
                                            {product.title}
                                        </Link>
                                    </h3>
                                    <p className="text-sm text-white/70 line-clamp-2 mb-2">
                                        {product.short_description}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        {product.currency} {product.price.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-white/70">
                                        {product.type} • {product.category}
                                    </div>
                                </div>
                            </div>

                            {/* Status and Stats */}
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusLabels[product.status as keyof typeof statusLabels]}
                                </Badge>
                                {product.featured && (
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                                        <Star className="h-3 w-3 mr-1" />
                                        Destacado
                                    </Badge>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{product.sales_count} ventas</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{product.views_count} vistas</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    <span>{product.avg_rating.toFixed(1)} ({product.reviews_count})</span>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                                <Calendar className="h-3 w-3" />
                                <span>Creado el {new Date(product.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-wrap">
                                <Link href={route('marketplace.products.show', product.id)}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Ver
                                    </Button>
                                </Link>

                                <Link href={route('marketplace.edit', product.id)}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                    >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Editar
                                    </Button>
                                </Link>

                                {product.status === 'active' ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleToggleStatus(product)}
                                        className="bg-orange-500/20 text-orange-300 border-orange-400/30 hover:bg-orange-500/30"
                                    >
                                        Pausar
                                    </Button>
                                ) : product.status === 'paused' ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleToggleStatus(product)}
                                        className="bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30"
                                    >
                                        Activar
                                    </Button>
                                ) : null}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(product)}
                                    className="bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Eliminar
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
            <Head title="Mis Productos - Tribe Marketplace" />
            
            <div className="min-h-screen bg-black">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Mis Productos</h1>
                                <p className="text-white/70">
                                    Gestiona tus productos en el marketplace
                                </p>
                            </div>
                            <Link href={route('marketplace.create')}>
                                <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Producto
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
                                            placeholder="Buscar en mis productos..."
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
                                        <div className="text-2xl font-bold text-white">{products.total}</div>
                                        <div className="text-sm text-white/70">Total Productos</div>
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
                                            {products.data.filter(p => p.status === 'active').length}
                                        </div>
                                        <div className="text-sm text-white/70">Activos</div>
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
                                            {products.data.filter(p => p.status === 'pending_review').length}
                                        </div>
                                        <div className="text-sm text-white/70">En Revisión</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">
                                            {products.data.reduce((sum, p) => sum + p.sales_count, 0)}
                                        </div>
                                        <div className="text-sm text-white/70">Total Ventas</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products List */}
                    {products.data.length > 0 ? (
                        <div className="space-y-4">
                            {products.data.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-12 text-center">
                                <Package className="h-16 w-16 text-white/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No tienes productos aún</h3>
                                <p className="text-white/70 mb-6">
                                    Crea tu primer producto y comienza a vender en nuestro marketplace
                                </p>
                                <Link href={route('marketplace.create')}>
                                    <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear Primer Producto
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                            {products && products.last_page && products.last_page > 1 && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex gap-2">
                                        {Array.from({ length: products.last_page }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={page === products.current_page ? "default" : "outline"}
                                        onClick={() => router.get(route('marketplace.my-products'), { page })}
                                        className={page === products.current_page 
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
