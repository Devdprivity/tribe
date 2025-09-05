import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    TrendingUp, 
    DollarSign, 
    Package, 
    Users, 
    Star,
    Eye,
    ShoppingCart,
    AlertTriangle,
    Clock,
    CheckCircle,
    Plus,
    Edit,
    BarChart3,
    Calendar,
    Download,
    MessageSquare
} from 'lucide-react';

interface Product {
    id: number;
    title: string;
    price: number;
    currency: string;
    status: string;
    sales_count: number;
    views_count: number;
    avg_rating: number;
    reviews_count: number;
    created_at: string;
    last_sale_at?: string;
}

interface Sale {
    id: number;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
    buyer: {
        username: string;
        full_name: string;
    };
    product: {
        title: string;
    };
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    product: {
        title: string;
    };
    user: {
        username: string;
    };
}

interface Stats {
    total_products: number;
    active_products: number;
    total_sales: number;
    total_revenue: string;
    avg_rating: number;
    total_reviews: number;
    this_month_sales: number;
    this_month_revenue: string;
    pending_reviews: number;
}

interface SellerDashboardProps {
    stats: Stats;
    products: Product[];
    recent_sales: Sale[];
    recent_reviews: Review[];
    notifications: Array<{
        type: string;
        message: string;
        created_at: string;
    }>;
}

const statusColors = {
    active: 'bg-green-500/20 text-green-300 border-green-400/30',
    draft: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    inactive: 'bg-red-500/20 text-red-300 border-red-400/30',
    pending: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
};

const statusLabels = {
    active: 'Activo',
    draft: 'Borrador',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    completed: 'Completado',
    processing: 'Procesando',
};

export default function SellerDashboard({ 
    stats, 
    products, 
    recent_sales, 
    recent_reviews,
    notifications
}: SellerDashboardProps) {
    const renderStars = (rating: number, size = 'h-4 w-4') => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`${size} ${
                    i < Math.floor(rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-white/30'
                }`}
            />
        ));
    };

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Package className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.total_products}</div>
                                <div className="text-sm text-white/70">Productos</div>
                                <div className="text-xs text-green-400">
                                    {stats.active_products} activos
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.total_revenue}
                                </div>
                                <div className="text-sm text-white/70">Ingresos Totales</div>
                                <div className="text-xs text-green-400">
                                    {stats.this_month_revenue} este mes
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <ShoppingCart className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.total_sales}</div>
                                <div className="text-sm text-white/70">Ventas Totales</div>
                                <div className="text-xs text-green-400">
                                    {stats.this_month_sales} este mes
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Star className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.avg_rating.toFixed(1)}
                                </div>
                                <div className="text-sm text-white/70">Rating Promedio</div>
                                <div className="text-xs text-white/50">
                                    {stats.total_reviews} reseñas
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                <CardHeader>
                    <CardTitle className="text-white">Acciones Rápidas</CardTitle>
                </CardHeader>
                
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link href={route('marketplace.create')}>
                            <Button className="w-full bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Producto
                            </Button>
                        </Link>
                        
                        <Link href={route('marketplace.my-products')}>
                            <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                <Package className="h-4 w-4 mr-2" />
                                Mis Productos
                            </Button>
                        </Link>
                        
                        <Link href={route('marketplace.sales')}>
                            <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Ver Ventas
                            </Button>
                        </Link>
                        
                        <Link href={route('marketplace.analytics')}>
                            <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Analíticas
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Products */}
                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Mis Productos</CardTitle>
                            <Link href={route('marketplace.my-products')}>
                                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                    Ver todos
                                </Button>
                            </Link>
                        </div>
                        <CardDescription className="text-white/70">
                            Tus productos más recientes
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        {products.length > 0 ? (
                            <div className="space-y-4">
                                {products.slice(0, 5).map(product => (
                                    <div key={product.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-white truncate">
                                                    {product.title}
                                                </h4>
                                                <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                                                    {statusLabels[product.status as keyof typeof statusLabels]}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm text-white/60">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    <span>{product.currency} {product.price}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ShoppingCart className="h-3 w-3" />
                                                    <span>{product.sales_count}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    <span>{product.views_count}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-400" />
                                                    <span>{product.avg_rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Link href={route('marketplace.edit', product.id)}>
                                            <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-white/30 mx-auto mb-4" />
                                <p className="text-white/70 mb-2">No tienes productos aún</p>
                                <Link href={route('marketplace.create')}>
                                    <Button className="bg-blue-500/80 hover:bg-blue-500 text-white">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear Primer Producto
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Sales */}
                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Ventas Recientes</CardTitle>
                            <Link href={route('marketplace.sales')}>
                                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                    Ver todas
                                </Button>
                            </Link>
                        </div>
                        <CardDescription className="text-white/70">
                            Tus ventas más recientes
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        {recent_sales.length > 0 ? (
                            <div className="space-y-4">
                                {recent_sales.map(sale => (
                                    <div key={sale.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-white">
                                                    {sale.currency} {sale.amount}
                                                </span>
                                                <Badge className={statusColors[sale.status as keyof typeof statusColors]}>
                                                    {statusLabels[sale.status as keyof typeof statusLabels]}
                                                </Badge>
                                            </div>
                                            
                                            <div className="text-sm text-white/60">
                                                {sale.product.title} • {sale.buyer.username}
                                            </div>
                                            
                                            <div className="text-xs text-white/50">
                                                {new Date(sale.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingCart className="h-12 w-12 text-white/30 mx-auto mb-4" />
                                <p className="text-white/70">No hay ventas aún</p>
                                <p className="text-white/50 text-sm">
                                    Las ventas aparecerán aquí una vez que vendas productos
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Reviews */}
            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            Reseñas Recientes
                        </CardTitle>
                        <Link href={route('marketplace.reviews')}>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                Ver todas
                            </Button>
                        </Link>
                    </div>
                    <CardDescription className="text-white/70">
                        Últimas reseñas de tus productos
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {recent_reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recent_reviews.slice(0, 4).map(review => (
                                <div key={review.id} className="p-4 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-sm text-white/70">
                                            por {review.user.username}
                                        </span>
                                    </div>
                                    
                                    <p className="text-white/80 text-sm mb-2 line-clamp-2">
                                        {review.comment}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-blue-400">{review.product.title}</span>
                                        <span className="text-white/50">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Star className="h-12 w-12 text-white/30 mx-auto mb-4" />
                            <p className="text-white/70">No hay reseñas aún</p>
                            <p className="text-white/50 text-sm">
                                Las reseñas de tus productos aparecerán aquí
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notifications */}
            {notifications.length > 0 && (
                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            Notificaciones
                        </CardTitle>
                        <CardDescription className="text-white/70">
                            Actualizaciones importantes sobre tus productos y ventas
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <div className="space-y-3">
                            {notifications.slice(0, 5).map((notification, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                    <div className={`p-1 rounded-full ${
                                        notification.type === 'sale' ? 'bg-green-500/20' :
                                        notification.type === 'review' ? 'bg-yellow-500/20' :
                                        notification.type === 'dispute' ? 'bg-red-500/20' :
                                        'bg-blue-500/20'
                                    }`}>
                                        {notification.type === 'sale' && <DollarSign className="h-3 w-3 text-green-400" />}
                                        {notification.type === 'review' && <Star className="h-3 w-3 text-yellow-400" />}
                                        {notification.type === 'dispute' && <AlertTriangle className="h-3 w-3 text-red-400" />}
                                        {notification.type === 'general' && <CheckCircle className="h-3 w-3 text-blue-400" />}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <p className="text-white/80 text-sm">{notification.message}</p>
                                        <p className="text-white/50 text-xs mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}