import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Star, 
    Eye, 
    ShoppingCart, 
    Github, 
    Globe, 
    ExternalLink,
    Download,
    Shield,
    Clock,
    CheckCircle,
    Code2,
    Package,
    User,
    Calendar,
    Tag,
    ArrowLeft,
    Heart,
    Share2,
    AlertTriangle,
    Play
} from 'lucide-react';

interface Product {
    id: number;
    title: string;
    description: string;
    short_description: string;
    price: number;
    currency: string;
    type: string;
    category: string;
    tech_stack: string[];
    features: string[];
    complexity: string;
    images: string[];
    videos?: string[];
    github_repo?: string;
    github_verified: boolean;
    demo_url?: string;
    live_preview_url?: string;
    demo_credentials?: {
        username?: string;
        password?: string;
    };
    installation_guide?: string;
    documentation_url?: string;
    delivery_method: string;
    includes_support: boolean;
    support_duration_days?: number;
    included_files: string[];
    tags: string[];
    sales_count: number;
    views_count: number;
    avg_rating: number;
    reviews_count: number;
    featured: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    seller: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
        bio?: string;
        level?: string;
    };
    reviews?: Review[];
    is_purchased?: boolean;
    can_review?: boolean;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
}

interface ProductShowProps {
    product: Product;
    auth: {
        user?: {
            id: number;
            username: string;
        };
    };
}

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

const deliveryMethods = {
    github_release: 'GitHub Release',
    zip_file: 'Archivo ZIP',
    git_access: 'Acceso Git',
};

export default function ProductShow({ product, auth }: ProductShowProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showDemoCredentials, setShowDemoCredentials] = useState(false);

    const handlePurchase = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }

        if (auth.user.id === product.seller.id) {
            alert('No puedes comprar tu propio producto');
            return;
        }

        setIsPurchasing(true);
        router.post(route('marketplace.purchase', product.id), {}, {
            onFinish: () => setIsPurchasing(false),
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-white/30'
                }`}
            />
        ));
    };

    return (
        <>
            <Head title={`${product.title} - Marketplace`} />
            
            <div className="min-h-screen bg-black">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Link href={route('marketplace.index')}>
                                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver al Marketplace
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <span>{product.seller.username}</span>
                            <span>•</span>
                            <span>{product.type}</span>
                            <span>•</span>
                            <span>{product.category}</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Product Images */}
                            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                <CardContent className="p-6">
                                    <div className="aspect-video bg-white/5 rounded-lg mb-4 overflow-hidden">
                                        {product.images.length > 0 ? (
                                            <img
                                                src={product.images[selectedImage]}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-16 w-16 text-white/30" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {product.images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto">
                                            {product.images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(index)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                                        selectedImage === index 
                                                            ? 'border-blue-400' 
                                                            : 'border-white/20'
                                                    }`}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`${product.title} ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Product Info */}
                            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl text-white mb-2">
                                                {product.title}
                                            </CardTitle>
                                            <CardDescription className="text-white/70 text-lg">
                                                {product.short_description}
                                            </CardDescription>
                                        </div>
                                        {product.featured && (
                                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                                                <Star className="h-3 w-3 mr-1" />
                                                Destacado
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="flex items-center gap-4 mb-6">
                                        <Badge className={`${complexityColors[product.complexity as keyof typeof complexityColors]}`}>
                                            {complexityLabels[product.complexity as keyof typeof complexityLabels]}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            {renderStars(product.avg_rating)}
                                            <span className="text-white/70 ml-2">
                                                {product.avg_rating.toFixed(1)} ({product.reviews_count} reseñas)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tech Stack */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-3">Tecnologías</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tech_stack.map((tech, index) => (
                                                <Badge key={index} variant="secondary" className="bg-white/10 text-white/80">
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-3">Características</h3>
                                        <ul className="space-y-2">
                                            {product.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2 text-white/80">
                                                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Included Files */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-3">Archivos Incluidos</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.included_files.map((file, index) => (
                                                <Badge key={index} variant="outline" className="border-white/20 text-white/70">
                                                    {file}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabs */}
                            <Tabs defaultValue="description" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 bg-white/5 border-white/10">
                                    <TabsTrigger value="description" className="text-white data-[state=active]:bg-white/10">
                                        Descripción
                                    </TabsTrigger>
                                    <TabsTrigger value="installation" className="text-white data-[state=active]:bg-white/10">
                                        Instalación
                                    </TabsTrigger>
                                    <TabsTrigger value="reviews" className="text-white data-[state=active]:bg-white/10">
                                        Reseñas ({product.reviews_count})
                                    </TabsTrigger>
                                    <TabsTrigger value="support" className="text-white data-[state=active]:bg-white/10">
                                        Soporte
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="description" className="mt-6">
                                    <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                        <CardContent className="p-6">
                                            <div className="prose prose-invert max-w-none">
                                                <div className="text-white/80 whitespace-pre-wrap">
                                                    {product.description}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="installation" className="mt-6">
                                    <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                        <CardContent className="p-6">
                                            {product.installation_guide ? (
                                                <div className="prose prose-invert max-w-none">
                                                    <div className="text-white/80 whitespace-pre-wrap">
                                                        {product.installation_guide}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Code2 className="h-12 w-12 text-white/30 mx-auto mb-4" />
                                                    <p className="text-white/70">No hay guía de instalación disponible</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="reviews" className="mt-6">
                                    <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                        <CardContent className="p-6">
                                            {product.reviews && product.reviews.length > 0 ? (
                                                <div className="space-y-6">
                                                    {product.reviews.map(review => (
                                                        <div key={review.id} className="border-b border-white/10 pb-6 last:border-b-0">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                                    <span className="text-sm font-bold text-white">
                                                                        {review.user.username.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="font-semibold text-white">{review.user.username}</span>
                                                                        <div className="flex items-center gap-1">
                                                                            {renderStars(review.rating)}
                                                                        </div>
                                                                        <span className="text-sm text-white/50">
                                                                            {new Date(review.created_at).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-white/80">{review.comment}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Star className="h-12 w-12 text-white/30 mx-auto mb-4" />
                                                    <p className="text-white/70">No hay reseñas aún</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="support" className="mt-6">
                                    <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Shield className="h-5 w-5 text-green-400" />
                                                    <span className="text-white">
                                                        {product.includes_support ? 'Soporte incluido' : 'Sin soporte incluido'}
                                                    </span>
                                                </div>
                                                
                                                {product.includes_support && product.support_duration_days && (
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-5 w-5 text-blue-400" />
                                                        <span className="text-white/80">
                                                            {product.support_duration_days} días de soporte
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <Package className="h-5 w-5 text-purple-400" />
                                                    <span className="text-white/80">
                                                        Entrega: {deliveryMethods[product.delivery_method as keyof typeof deliveryMethods]}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Purchase Card */}
                            <Card className="bg-white/5 border-white/10 apple-liquid-card sticky top-6">
                                <CardHeader>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white mb-2">
                                            {product.currency} {product.price.toFixed(2)}
                                        </div>
                                        <div className="text-white/70">
                                            {product.sales_count} ventas • {product.views_count} vistas
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4">
                                    {product.is_purchased ? (
                                        <div className="text-center">
                                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                                            <p className="text-white font-semibold mb-2">Ya tienes este producto</p>
                                            <Button className="w-full bg-green-500/80 hover:bg-green-500 text-white">
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button 
                                            onClick={handlePurchase}
                                            disabled={isPurchasing || product.status !== 'active'}
                                            className="w-full bg-blue-500/80 hover:bg-blue-500 text-white apple-liquid-button h-12"
                                        >
                                            {isPurchasing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                                    Comprar Ahora
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20">
                                            <Heart className="h-4 w-4 mr-2" />
                                            Guardar
                                        </Button>
                                        <Button variant="outline" className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20">
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Compartir
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seller Info */}
                            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Vendedor
                                    </CardTitle>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">
                                                {product.seller.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{product.seller.username}</div>
                                            <div className="text-sm text-white/70">{product.seller.full_name}</div>
                                        </div>
                                    </div>
                                    
                                    {product.seller.bio && (
                                        <p className="text-white/80 text-sm mb-4">{product.seller.bio}</p>
                                    )}
                                    
                                    <Link href={route('users.show', product.seller.id)}>
                                        <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                                            Ver Perfil
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Links */}
                            <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                <CardHeader>
                                    <CardTitle className="text-white">Enlaces</CardTitle>
                                </CardHeader>
                                
                                <CardContent className="space-y-3">
                                    {product.github_repo && (
                                        <a
                                            href={`https://github.com/${product.github_repo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <Github className="h-5 w-5 text-white/70" />
                                            <span className="text-white/80">GitHub</span>
                                            <ExternalLink className="h-4 w-4 text-white/50 ml-auto" />
                                        </a>
                                    )}
                                    
                                    {product.demo_url && (
                                        <a
                                            href={product.demo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <Play className="h-5 w-5 text-white/70" />
                                            <span className="text-white/80">Demo</span>
                                            <ExternalLink className="h-4 w-4 text-white/50 ml-auto" />
                                        </a>
                                    )}
                                    
                                    {product.live_preview_url && (
                                        <a
                                            href={product.live_preview_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <Globe className="h-5 w-5 text-white/70" />
                                            <span className="text-white/80">Live Preview</span>
                                            <ExternalLink className="h-4 w-4 text-white/50 ml-auto" />
                                        </a>
                                    )}
                                    
                                    {product.documentation_url && (
                                        <a
                                            href={product.documentation_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <Code2 className="h-5 w-5 text-white/70" />
                                            <span className="text-white/80">Documentación</span>
                                            <ExternalLink className="h-4 w-4 text-white/50 ml-auto" />
                                        </a>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Demo Credentials */}
                            {product.demo_credentials && (
                                <Card className="bg-white/5 border-white/10 apple-liquid-card">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            Credenciales Demo
                                        </CardTitle>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <Button
                                            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                                            variant="outline"
                                            className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                                        >
                                            {showDemoCredentials ? 'Ocultar' : 'Mostrar'} Credenciales
                                        </Button>
                                        
                                        {showDemoCredentials && (
                                            <div className="mt-4 space-y-2">
                                                {product.demo_credentials.username && (
                                                    <div>
                                                        <label className="text-sm text-white/70">Usuario:</label>
                                                        <div className="p-2 bg-white/5 rounded text-white font-mono text-sm">
                                                            {product.demo_credentials.username}
                                                        </div>
                                                    </div>
                                                )}
                                                {product.demo_credentials.password && (
                                                    <div>
                                                        <label className="text-sm text-white/70">Contraseña:</label>
                                                        <div className="p-2 bg-white/5 rounded text-white font-mono text-sm">
                                                            {product.demo_credentials.password}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
