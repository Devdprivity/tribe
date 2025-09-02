import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import PostCard from '@/components/post-card';
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
    fire_count: number;
    idea_count: number;
    bug_count: number;
    sparkle_count: number;
    comments_count: number;
    shares_count: number;
    views_count: number;
    is_pinned: boolean;
    is_bookmarked?: boolean;
    created_at: string;
    user: User;
    hashtags?: string[];
    user_reaction?: string | null;
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



function DiscoverSidebar({ trendingPosts, trendingHashtags, popularToday }: {
    trendingPosts?: Post[];
    trendingHashtags?: string[];
    popularToday?: Post[];
}) {
    return (
        <div className="space-y-6">
            {/* Trending Hashtags */}
            {trendingHashtags && trendingHashtags.length > 0 && (
                <Card className="apple-liquid-card border border-white/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <Hash className="h-5 w-5" />
                            Trending
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {trendingHashtags.slice(0, 8).map((hashtag, index) => (
                            <Link
                                key={index}
                                href={`/posts?hashtag=${hashtag}`}
                                className="block p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-blue-400" />
                                    <span className="font-medium text-white">{hashtag}</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Popular Today */}
            {popularToday && popularToday.length > 0 && (
                <Card className="apple-liquid-card border border-white/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <TrendingUp className="h-5 w-5" />
                            Popular Hoy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {popularToday.slice(0, 3).map((post) => (
                            <div key={post.id} className="border-l-2 border-blue-400 pl-3">
                                <Link href={`/posts/${post.id}`} className="block">
                                    <p className="font-medium line-clamp-2 hover:underline text-sm text-white/90">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
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
            <Card className="apple-liquid-card border border-white/20">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Filtros Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link href="/posts?type=code" className="block p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/90">Solo código</span>
                        </div>
                    </Link>
                    <Link href="/posts?type=project" className="block p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                            <FileImage className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/90">Proyectos</span>
                        </div>
                    </Link>
                    <Link href="/posts?time_range=today" className="block p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/90">De hoy</span>
                        </div>
                    </Link>
                    <Link href="/posts?time_range=week" className="block p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/90">Esta semana</span>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Posts({ posts, filters, trending_posts, trending_hashtags, popular_today }: Props) {
    const { auth } = usePage().props as { auth: { user: User } };
    const currentUser = auth?.user;

    return (
        <AuthenticatedLayout>
            <Head title="Explorar" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Contenido Principal */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Explorar</h1>
                            <p className="text-white/70">
                                Descubre contenido increíble de la comunidad
                            </p>
                        </div>
                        <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Post
                        </Button>
                    </div>

                    {/* Búsqueda y Filtros */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                            <Input
                                placeholder="Buscar posts, hashtags, tecnologías..."
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 apple-liquid-input"
                                defaultValue={filters.search || ''}
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <Filter className="h-3 w-3 mr-1" />
                                Filtros
                            </Badge>
                            <Badge variant={!filters.type ? "default" : "outline"} className={!filters.type ? "bg-blue-500/80 text-white border-blue-400/50" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}>
                                <Link href="/posts">Todos</Link>
                            </Badge>
                            <Badge variant={filters.type === 'code' ? "default" : "outline"} className={filters.type === 'code' ? "bg-blue-500/80 text-white border-blue-400/50" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}>
                                <Link href="/posts?type=code">Código</Link>
                            </Badge>
                            <Badge variant={filters.type === 'project' ? "default" : "outline"} className={filters.type === 'project' ? "bg-blue-500/80 text-white border-blue-400/50" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}>
                                <Link href="/posts?type=project">Proyectos</Link>
                            </Badge>
                            <Badge variant={filters.type === 'image' ? "default" : "outline"} className={filters.type === 'image' ? "bg-blue-500/80 text-white border-blue-400/50" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}>
                                <Link href="/posts?type=image">Imágenes</Link>
                            </Badge>
                            <Badge variant={filters.time_range === 'today' ? "default" : "outline"} className={filters.time_range === 'today' ? "bg-blue-500/80 text-white border-blue-400/50" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}>
                                <Link href="/posts?time_range=today">Hoy</Link>
                            </Badge>
                            <Badge variant={filters.time_range === 'week' ? "default" : "outline"} className={filters.time_range === 'week' ? "bg-blue-500/80 text-white border-blue-400/50" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}>
                                <Link href="/posts?time_range=week">Esta semana</Link>
                            </Badge>
                        </div>
                    </div>

                    {/* Lista de Posts */}
                    <div>
                        {posts.data.length > 0 ? (
                            posts.data.map((post) => (
                                <PostCard key={post.id} post={post} currentUser={currentUser} />
                            ))
                        ) : (
                            <Card className="apple-liquid-card border border-white/20">
                                <CardContent className="pt-6 text-center">
                                    <Search className="h-12 w-12 mx-auto mb-4 text-white/50" />
                                    <h3 className="text-lg font-semibold mb-2 text-white">No hay posts</h3>
                                    <p className="text-white/70 mb-4">
                                        No se encontraron posts con los filtros seleccionados.
                                    </p>
                                    <div className="flex items-center justify-center gap-4">
                                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                            Limpiar filtros
                                        </Button>
                                        <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
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
        </AuthenticatedLayout>
    );
}
