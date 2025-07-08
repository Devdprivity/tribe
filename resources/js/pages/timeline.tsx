import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
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
    Sparkles
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
    is_pinned: boolean;
    created_at: string;
    user: User;
}

interface Props {
    posts: {
        data: Post[];
        links: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
    filters: {
        type?: string;
    };
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

const formatTimeAgo = (date: string) => {
    // Implementación simple de tiempo relativo
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
        <Card className="mb-4">
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
                                        Buscando trabajo
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
                        {post.type === 'code' ? (
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                <code className="text-sm">{post.content}</code>
                            </pre>
                        ) : (
                            <p>{post.content}</p>
                        )}
                    </div>

                    {/* Media del post */}
                    {post.media_urls && post.media_urls.length > 0 && (
                        <div className="grid grid-cols-1 gap-2">
                            {post.media_urls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt=""
                                    className="rounded-lg max-h-96 object-cover"
                                />
                            ))}
                        </div>
                    )}

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
                                <span>{post.comments_count}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                <span>{post.shares_count}</span>
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

export default function Timeline({ posts, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Timeline" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Timeline</h1>
                    <p className="text-muted-foreground">
                        Tu feed personalizado de la comunidad
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-2">
                    <Badge variant={!filters.type ? "default" : "outline"}>
                        <Link href="/timeline">Todos</Link>
                    </Badge>
                    <Badge variant={filters.type === 'code' ? "default" : "outline"}>
                        <Link href="/timeline?type=code">Código</Link>
                    </Badge>
                    <Badge variant={filters.type === 'project' ? "default" : "outline"}>
                        <Link href="/timeline?type=project">Proyectos</Link>
                    </Badge>
                    <Badge variant={filters.type === 'text' ? "default" : "outline"}>
                        <Link href="/timeline?type=text">Discusión</Link>
                    </Badge>
                </div>

                {/* Creator rápido de posts */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>TU</AvatarFallback>
                            </Avatar>
                            <Link href="/posts/create" className="flex-1">
                                <div className="w-full p-3 text-left text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                    ¿Qué estás construyendo hoy?
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de posts */}
                <div>
                    {posts.data.length > 0 ? (
                        posts.data.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <p className="text-muted-foreground">
                                    No hay posts en tu timeline.
                                    <Link href="/users" className="text-primary hover:underline ml-1">
                                        ¡Sigue a algunos desarrolladores!
                                    </Link>
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Paginación - se puede implementar después */}
            </div>
        </AppLayout>
    );
}
