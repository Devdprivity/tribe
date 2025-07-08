import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Search,
    Filter,
    TrendingUp,
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Code2,
    FileImage,
    Video,
    Pin,
    Flame,
    Lightbulb,
    Bug,
    Sparkles,
    Hash,
    Calendar,
    Eye,
    Plus
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
    is_open_to_work: boolean;
}

interface Post {
    id: number;
    content: string;
    type: 'text' | 'image' | 'video' | 'code' | 'project';
    code_language?: string;
    media_urls?: string[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    views_count: number;
    is_pinned: boolean;
    created_at: string;
    user: User;
    hashtags?: string[];
}

interface Props {
    posts: {
        data: Post[];
        links: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
    filters: {
        search?: string;
        type?: string;
        hashtag?: string;
        time_range?: string;
    };
    trending_posts?: Post[];
    trending_hashtags?: string[];
    popular_today?: Post[];
}

const getLevelColor = (level: string) => {
    switch (level) {
        case 'junior': return 'bg-green-500';
        case 'mid': return 'bg-blue-500';
        case 'senior': return 'bg-purple-500';
        case 'lead': return 'bg-orange-500';
        default: return 'bg-gray-500';
    }
};

const getPostTypeIcon = (type: string) => {
    switch (type) {
        case 'code': return Code2;
        case 'image': return FileImage;
        case 'video': return Video;
        default: return null;
    }
};

const getPostTypeLabel = (type: string) => {
    switch (type) {
        case 'code': return 'Código';
        case 'image': return 'Imagen';
        case 'video': return 'Video';
        case 'project': return 'Proyecto';
        default: return 'Texto';
    }
};

const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return postDate.toLocaleDateString();
};

function PostCard({ post }: { post: Post }) {
    const TypeIcon = getPostTypeIcon(post.type);

    return (
        <Card className="mb-4 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/users/${post.user.id}`}>
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.user.avatar} />
                                <AvatarFallback className={getLevelColor(post.user.level)}>
                                    {post.user.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Link href={`/users/${post.user.id}`} className="font-semibold hover:underline">
                                    {post.user.full_name}
                                </Link>
                                <Badge variant="outline" className="text-xs">
                                    {post.user.level}
                                </Badge>
                                {post.user.is_open_to_work && (
                                    <Badge variant="secondary" className="text-xs">
                                        Disponible
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>@{post.user.username}</span>
                                <span>•</span>
                                <span>{formatTimeAgo(post.created_at)}</span>
                                {TypeIcon && (
                                    <>
                                        <span>•</span>
                                        <TypeIcon className="h-4 w-4" />
                                        <span>{getPostTypeLabel(post.type)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {post.is_pinned && (
                            <Pin className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-3">
                    {/* Contenido del post */}
                    <div className="whitespace-pre-wrap">
                        <Link href={`/posts/${post.id}`} className="block hover:opacity-80 transition-opacity">
                            {post.type === 'code' ? (
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                    <code className="text-sm">{post.content}</code>
                                </pre>
                            ) : (
                                <p className="line-clamp-4">{post.content}</p>
                            )}
                        </Link>
                    </div>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {post.hashtags.map((hashtag, index) => (
                                <Link
                                    key={index}
                                    href={`/posts?hashtag=${hashtag}`}
                                    className="text-primary hover:underline text-sm"
                                >
                                    #{hashtag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Media del post */}
                    {post.media_urls && post.media_urls.length > 0 && (
                        <div className="grid grid-cols-1 gap-2">
                            {post.media_urls.slice(0, 2).map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt=""
                                    className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                />
                            ))}
                            {post.media_urls.length > 2 && (
                                <div className="text-center text-sm text-muted-foreground">
                                    +{post.media_urls.length - 2} más
                                </div>
                            )}
                        </div>
                    )}

                    {/* Estadísticas */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            <span>{post.shares_count}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Acciones del post */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes_count}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                <span>Comentar</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                <span>Compartir</span>
                            </Button>
                        </div>

                        {/* Reacciones específicas para devs */}
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="p-2">
                                <Flame className="h-4 w-4 text-orange-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                                <Bug className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DiscoverSidebar({ trendingPosts, trendingHashtags, popularToday }: {
    trendingPosts?: Post[];
    trendingHashtags?: string[];
    popularToday?: Post[];
}) {
    return (
        <div className="space-y-6">
            {/* Trending Hashtags */}
            {trendingHashtags && trendingHashtags.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Hash className="h-5 w-5" />
                            Trending
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {trendingHashtags.slice(0, 8).map((hashtag, index) => (
                            <Link
                                key={index}
                                href={`/posts?hashtag=${hashtag}`}
                                className="block p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{hashtag}</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Popular Today */}
            {popularToday && popularToday.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Popular Hoy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {popularToday.slice(0, 3).map((post) => (
                            <div key={post.id} className="border-l-2 border-primary pl-3">
                                <Link href={`/posts/${post.id}`} className="block">
                                    <p className="font-medium line-clamp-2 hover:underline text-sm">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>@{post.user.username}</span>
                                        <span>•</span>
                                        <Heart className="h-3 w-3" />
                                        <span>{post.likes_count}</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Filtros rápidos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link href="/posts?type=code" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            <span className="text-sm">Solo código</span>
                        </div>
                    </Link>
                    <Link href="/posts?type=project" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <FileImage className="h-4 w-4" />
                            <span className="text-sm">Proyectos</span>
                        </div>
                    </Link>
                    <Link href="/posts?time_range=today" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">De hoy</span>
                        </div>
                    </Link>
                    <Link href="/posts?time_range=week" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Esta semana</span>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Posts({ posts, filters, trending_posts, trending_hashtags, popular_today }: Props) {
    return (
        <AppLayout>
            <Head title="Explorar" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Contenido Principal */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Explorar</h1>
                            <p className="text-muted-foreground">
                                Descubre contenido increíble de la comunidad
                            </p>
                        </div>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Post
                        </Button>
                    </div>

                    {/* Búsqueda y Filtros */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar posts, hashtags, tecnologías..."
                                className="pl-10"
                                defaultValue={filters.search || ''}
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="cursor-pointer">
                                <Filter className="h-3 w-3 mr-1" />
                                Filtros
                            </Badge>
                            <Badge variant={!filters.type ? "default" : "outline"}>
                                <Link href="/posts">Todos</Link>
                            </Badge>
                            <Badge variant={filters.type === 'code' ? "default" : "outline"}>
                                <Link href="/posts?type=code">Código</Link>
                            </Badge>
                            <Badge variant={filters.type === 'project' ? "default" : "outline"}>
                                <Link href="/posts?type=project">Proyectos</Link>
                            </Badge>
                            <Badge variant={filters.type === 'image' ? "default" : "outline"}>
                                <Link href="/posts?type=image">Imágenes</Link>
                            </Badge>
                            <Badge variant={filters.time_range === 'today' ? "default" : "outline"}>
                                <Link href="/posts?time_range=today">Hoy</Link>
                            </Badge>
                            <Badge variant={filters.time_range === 'week' ? "default" : "outline"}>
                                <Link href="/posts?time_range=week">Esta semana</Link>
                            </Badge>
                        </div>
                    </div>

                    {/* Lista de Posts */}
                    <div>
                        {posts.data.length > 0 ? (
                            posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">No hay posts</h3>
                                    <p className="text-muted-foreground mb-4">
                                        No se encontraron posts con los filtros seleccionados.
                                    </p>
                                    <div className="flex items-center justify-center gap-4">
                                        <Button variant="outline">
                                            Limpiar filtros
                                        </Button>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear post
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <DiscoverSidebar
                        trendingPosts={trending_posts}
                        trendingHashtags={trending_hashtags}
                        popularToday={popular_today}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
