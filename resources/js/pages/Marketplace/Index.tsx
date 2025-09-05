import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Search, 
    Filter, 
    Star, 
    Eye, 
    ShoppingCart, 
    Plus,
    Code2,
    Github,
    Globe,
    Package,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    Tag
} from 'lucide-react';

interface Product {
    id: number;
    title: string;
    short_description: string;
    price: number;
    currency: string;
    type: string;
    category: string;
    tech_stack: string[];
    features: string[];
    complexity: string;
    images: string[];
    github_repo?: string;
    demo_url?: string;
    live_preview_url?: string;
    sales_count: number;
    views_count: number;
    avg_rating: number;
    reviews_count: number;
    featured: boolean;
    status: string;
    created_at: string;
    seller: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface Category {
    key: string;
    label: string;
    count: number;
}

interface MarketplaceData {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    featured: Product[];
    categories: Category[];
    filters: {
        search?: string;
        type?: string;
        category?: string;
        min_price?: number;
        max_price?: number;
        min_rating?: number;
        sort?: string;
    };
    stats: {
        total_products: number;
        total_sales: number;
        total_sellers: number;
        avg_rating: number;
    };
}

const productTypes = [
    { value: 'frontend', label: 'Frontend', icon: Code2 },
    { value: 'backend', label: 'Backend', icon: Code2 },
    { value: 'fullstack', label: 'Fullstack', icon: Code2 },
    { value: 'mobile', label: 'Mobile', icon: Package },
    { value: 'wordpress', label: 'WordPress', icon: Globe },
    { value: 'plugin', label: 'Plugin', icon: Package },
    { value: 'theme', label: 'Theme', icon: Globe },
    { value: 'automation', label: 'Automation', icon: Code2 },
    { value: 'api', label: 'API', icon: Code2 },
    { value: 'library', label: 'Library', icon: Package },
    { value: 'template', label: 'Template', icon: Globe },
    { value: 'other', label: 'Other', icon: Package },
];

const complexityColors = {
    basic: 'bg-green-500/20 text-green-300 border-green-400/30',
    intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    advanced: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    expert: 'bg-red-500/20 text-red-300 border-red-400/30',
};

const complexityLabels = {
    basic: 'Básico',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    expert: 'Experto',
};

export default function MarketplaceIndex({ products, featured, categories, filters, stats }: MarketplaceData) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'newest');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('marketplace.index'), {
            search: searchTerm,
            type: selectedType,
            category: selectedCategory,
            sort: sortBy,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        setIsLoading(true);
        router.get(route('marketplace.index'), {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const ProductCard = ({ product }: { product: Product }) => {
        const ProductTypeIcon = productTypes.find(t => t.value === product.type)?.icon || Package;
        
        return (
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/5 border-white/10 hover:border-white/20 apple-liquid-card">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <ProductTypeIcon className="h-5 w-5 text-blue-400" />
                            <Badge className={`text-xs ${complexityColors[product.complexity as keyof typeof complexityColors]}`}>
                                {complexityLabels[product.complexity as keyof typeof complexityLabels]}
                            </Badge>
                        </div>
                        {product.featured && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                                <Star className="h-3 w-3 mr-1" />
                                Destacado
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                        <Link href={route('marketplace.products.show', product.id)}>
                            {product.title}
                        </Link>
                    </CardTitle>
                    <CardDescription className="text-white/70 text-sm line-clamp-2">
                        {product.short_description}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {product.tech_stack.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80">
                                {tech}
                            </Badge>
                        ))}
                        {product.tech_stack.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-white/80">
                                +{product.tech_stack.length - 3}
                            </Badge>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{product.avg_rating.toFixed(1)}</span>
                            <span>({product.reviews_count})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{product.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ShoppingCart className="h-4 w-4" />
                            <span>{product.sales_count}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                    {product.seller.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm text-white/70">{product.seller.username}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-white">
                                {product.currency} {product.price.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        );
    };

    return (
        <>
            <Head title="Marketplace - Tribe" />
            
            <div className="min-h-screen bg-black">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Marketplace de Desarrollo
                            </h1>
                            <p className="text-xl text-white/70 mb-8">
                                Descubre, compra y vende productos digitales para desarrolladores
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar productos, tecnologías, vendedores..."
                                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 apple-liquid-input h-12"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button h-12 px-6"
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </Button>
                            </div>

                            <div className="flex gap-4 flex-wrap">
                                <Select value={selectedType} onValueChange={(value) => setSelectedType(value)}>
                                    <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Tipo de producto" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todos los tipos</SelectItem>
                                        {productTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/20">
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                                    <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map(category => (
                                            <SelectItem key={category.key} value={category.key} className="text-white hover:bg-white/20">
                                                {category.label} ({category.count})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                                    <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white apple-liquid-input">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20 text-white">
                                        <SelectItem value="newest" className="text-white hover:bg-white/20">Más recientes</SelectItem>
                                        <SelectItem value="oldest" className="text-white hover:bg-white/20">Más antiguos</SelectItem>
                                        <SelectItem value="price_low" className="text-white hover:bg-white/20">Precio: menor a mayor</SelectItem>
                                        <SelectItem value="price_high" className="text-white hover:bg-white/20">Precio: mayor a menor</SelectItem>
                                        <SelectItem value="rating" className="text-white hover:bg-white/20">Mejor valorados</SelectItem>
                                        <SelectItem value="sales" className="text-white hover:bg-white/20">Más vendidos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Package className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats.total_products}</div>
                                        <div className="text-sm text-white/70">Productos</div>
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
                                        <div className="text-2xl font-bold text-white">{stats.total_sales}</div>
                                        <div className="text-sm text-white/70">Ventas</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 apple-liquid-card">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Users className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats.total_sellers}</div>
                                        <div className="text-sm text-white/70">Vendedores</div>
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
                                        <div className="text-2xl font-bold text-white">{stats.avg_rating.toFixed(1)}</div>
                                        <div className="text-sm text-white/70">Rating Promedio</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Featured Products */}
                {featured.length > 0 && (
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Star className="h-6 w-6 text-yellow-400" />
                                Productos Destacados
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featured.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* All Products */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            Todos los Productos ({products.total})
                        </h2>
                        <Link href={route('marketplace.create')}>
                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button">
                                <Plus className="h-4 w-4 mr-2" />
                                Vender Producto
                            </Button>
                        </Link>
                    </div>

                    {products.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.data.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {products && products.last_page && products.last_page > 1 && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex gap-2">
                                        {Array.from({ length: products.last_page }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={page === products.current_page ? "default" : "outline"}
                                                onClick={() => handleFilterChange('page', page.toString())}
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
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 text-white/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron productos</h3>
                            <p className="text-white/70 mb-6">
                                Intenta ajustar tus filtros de búsqueda o explora las categorías disponibles.
                            </p>
                            <Link href={route('marketplace.create')}>
                                <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 apple-liquid-button">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Primer Producto
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
