import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
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
    Sparkles,
    Eye,
    Bookmark
} from 'lucide-react';

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
    views_count?: number;
    is_pinned: boolean;
    is_bookmarked?: boolean;
    created_at: string;
    user: User;
    hashtags?: string[];
}

interface PostCardProps {
    post: Post;
    showActions?: boolean;
    compact?: boolean;
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

export default function PostCard({ post, showActions = true, compact = false }: PostCardProps) {
    const TypeIcon = getPostTypeIcon(post.type);

    return (
        <Card className={`${compact ? 'mb-2' : 'mb-4'} hover:shadow-md transition-shadow`}>
            <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/users/${post.user.id}`}>
                            <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
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
                                <p className={compact ? 'line-clamp-2' : 'line-clamp-4'}>{post.content}</p>
                            )}
                        </Link>
                    </div>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && !compact && (
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
                    {post.media_urls && post.media_urls.length > 0 && !compact && (
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
                    {post.views_count && (
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
                    )}

                    {showActions && (
                        <>
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-2 ${post.is_bookmarked ? 'text-primary' : ''}`}
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`/bookmarks/posts/${post.id}`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                    },
                                                });
                                                if (response.ok) {
                                                    // Actualizar el estado local o recargar la página
                                                    window.location.reload();
                                                }
                                            } catch (error) {
                                                console.error('Error toggling bookmark:', error);
                                            }
                                        }}
                                    >
                                        <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                                        <span>Guardar</span>
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
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
