import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
    Star,
    ArrowLeft,
    User,
    Calendar,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Filter,
    Search,
    Plus
} from 'lucide-react';

interface Review {
    id: number;
    user_id: number;
    product_id: number;
    purchase_id: number;
    rating: number;
    title: string;
    comment: string;
    is_verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        avatar_url?: string;
    };
    product: {
        id: number;
        name: string;
        image_url?: string;
    };
    helpful_votes: Array<{
        id: number;
        user_id: number;
        is_helpful: boolean;
    }>;
}

interface Product {
    id: number;
    name: string;
    image_url?: string;
    price: number;
    seller: {
        id: number;
        name: string;
    };
}

interface ProductReviewsProps {
    product: Product;
    reviews: Review[];
    userReview?: Review;
    stats: {
        average_rating: number;
        total_reviews: number;
        rating_distribution: {
            5: number;
            4: number;
            3: number;
            2: number;
            1: number;
        };
    };
}

export default function ProductReviews({ product, reviews, userReview, stats }: ProductReviewsProps) {
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [showReviewForm, setShowReviewForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        rating: 5,
        title: '',
        comment: ''
    });

    const filteredReviews = reviews.filter(review => {
        if (ratingFilter === 'all') return true;
        return review.rating === parseInt(ratingFilter);
    }).sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'highest_rating':
                return b.rating - a.rating;
            case 'lowest_rating':
                return a.rating - b.rating;
            case 'most_helpful':
                return b.helpful_count - a.helpful_count;
            default:
                return 0;
        }
    });

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(`/marketplace/products/${product.id}/review`, {
            onSuccess: () => {
                setShowReviewForm(false);
                setData({ rating: 5, title: '', comment: '' });
            }
        });
    };

    const handleHelpfulVote = (reviewId: number, isHelpful: boolean) => {
        router.post(`/marketplace/reviews/${reviewId}/helpful`, {
            is_helpful: isHelpful
        });
    };

    const renderStars = (rating: number, interactive: boolean = false) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? 'button' : undefined}
                        onClick={interactive ? () => setData('rating', star) : undefined}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                        <Star
                            className={`h-5 w-5 ${
                                star <= rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-400'
                            }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const getRatingPercentage = (rating: number) => {
        const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
        return stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Reseñas - ${product.name}`} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(`/marketplace/products/${product.id}`)}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Producto
                            </Button>
                            <h1 className="text-3xl font-bold text-white">
                                Reseñas de {product.name}
                            </h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Product Info & Stats */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Product Card */}
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        {product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        )}
                                        <div>
                                            <h3 className="text-white font-medium">{product.name}</h3>
                                            <p className="text-white/60 text-sm">por {product.seller.name}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rating Stats */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Calificación General</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center mb-4">
                                        <div className="text-4xl font-bold text-white mb-1">
                                            {stats.average_rating.toFixed(1)}
                                        </div>
                                        {renderStars(Math.round(stats.average_rating))}
                                        <p className="text-white/60 text-sm mt-1">
                                            {stats.total_reviews} reseña{stats.total_reviews !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <div key={rating} className="flex items-center gap-2">
                                                <span className="text-white/70 text-sm w-6">{rating}</span>
                                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                                <div className="flex-1 bg-white/10 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-400 h-2 rounded-full"
                                                        style={{ width: `${getRatingPercentage(rating)}%` }}
                                                    />
                                                </div>
                                                <span className="text-white/60 text-xs w-8">
                                                    {stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Write Review Button */}
                            {!userReview && (
                                <Button
                                    onClick={() => setShowReviewForm(true)}
                                    className="w-full bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Escribir Reseña
                                </Button>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Filters */}
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <select
                                                value={ratingFilter}
                                                onChange={(e) => setRatingFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            >
                                                <option value="all">Todas las calificaciones</option>
                                                <option value="5">5 estrellas</option>
                                                <option value="4">4 estrellas</option>
                                                <option value="3">3 estrellas</option>
                                                <option value="2">2 estrellas</option>
                                                <option value="1">1 estrella</option>
                                            </select>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            >
                                                <option value="newest">Más recientes</option>
                                                <option value="oldest">Más antiguas</option>
                                                <option value="highest_rating">Mejor calificadas</option>
                                                <option value="lowest_rating">Peor calificadas</option>
                                                <option value="most_helpful">Más útiles</option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Review Form Modal */}
                            {showReviewForm && (
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-white">Escribir Reseña</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmitReview} className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    Calificación *
                                                </label>
                                                {renderStars(data.rating, true)}
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    Título *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    placeholder="Resume tu experiencia..."
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                                {errors.title && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    Comentario *
                                                </label>
                                                <Textarea
                                                    value={data.comment}
                                                    onChange={(e) => setData('comment', e.target.value)}
                                                    placeholder="Comparte tu experiencia con este producto..."
                                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/50"
                                                    rows={4}
                                                />
                                                {errors.comment && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.comment}</p>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowReviewForm(false)}
                                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={processing || !data.title || !data.comment}
                                                    className="flex-1 bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50"
                                                >
                                                    {processing ? 'Enviando...' : 'Publicar Reseña'}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Reviews */}
                            <div className="space-y-4">
                                {filteredReviews.map((review) => (
                                    <Card key={review.id} className="bg-white/5 border-white/10">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {review.user.avatar_url ? (
                                                        <img
                                                            src={review.user.avatar_url}
                                                            alt={review.user.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-white/50" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium">{review.user.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(review.rating)}
                                                            {review.is_verified_purchase && (
                                                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                                                    Compra verificada
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white/60 text-sm">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="text-white font-medium mb-2">{review.title}</h4>
                                                <p className="text-white/80">{review.comment}</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-white/60 text-sm">
                                                        ¿Te resultó útil esta reseña?
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleHelpfulVote(review.id, true)}
                                                            className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                                                        >
                                                            <ThumbsUp className="h-4 w-4" />
                                                            <span className="text-sm">{review.helpful_count}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleHelpfulVote(review.id, false)}
                                                            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            <ThumbsDown className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredReviews.length === 0 && (
                                    <Card className="bg-white/5 border-white/10">
                                        <CardContent className="p-8 text-center">
                                            <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                No hay reseñas
                                            </h3>
                                            <p className="text-white/70">
                                                No se encontraron reseñas que coincidan con los filtros seleccionados.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
