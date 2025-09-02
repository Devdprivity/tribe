import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { formatTimeAgo } from '@/utils/time-format';
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
import PostReactions from './post-reactions';

import SpecializedPost from './specialized-post';
import { useComments } from '@/contexts/comments-context';

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
    type: 'text' | 'image' | 'video' | 'code' | 'project' | 'code_snippet' | 'project_showcase' | 'tech_tutorial' | 'problem_solution' | 'code_playground';
    code_language?: string;
    media_urls?: string[];
    likes_count: number;
    fire_count: number;
    idea_count: number;
    bug_count: number;
    sparkle_count: number;
    comments_count: number;
    shares_count: number;
    views_count?: number;
    is_pinned: boolean;
    is_bookmarked?: boolean;
    created_at: string;
    user: User;
    hashtags?: string[];
    user_reaction?: string | null;
    specialized_data?: any; // Datos específicos para posts especializados
}

interface PostCardProps {
    post: Post;
    currentUser: User;
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

export default function PostCard({ post, currentUser, showActions = true, compact = false }: PostCardProps) {
    const TypeIcon = getPostTypeIcon(post.type);
    const { openCommentsModal } = useComments();

    return (
        <Card className={`apple-liquid-card border border-white/20 ${compact ? 'mb-2' : 'mb-4'} hover:shadow-md transition-shadow`}>
            <CardHeader className={`${compact ? 'pb-2' : 'pb-3'} text-white`}>
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
                                <Link href={`/users/${post.user.id}`} className="font-semibold hover:underline text-white">
                                    {post.user.full_name}
                                </Link>
                                <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                                    {post.user.level}
                                </Badge>
                                {post.user.is_open_to_work && (
                                    <Badge variant="secondary" className="text-xs bg-green-500/20 border-green-400/50 text-green-300">
                                        Disponible
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
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
                            <Pin className="h-4 w-4 text-white/70" />
                        )}
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 text-white">
                <div className="space-y-3">
                    {/* Contenido del post */}
                    <div className="whitespace-pre-wrap">
                        {/* Posts especializados */}
                        {['code_snippet', 'project_showcase', 'tech_tutorial', 'problem_solution', 'code_playground'].includes(post.type) ? (
                            <SpecializedPost 
                                type={post.type as any} 
                                data={post.specialized_data || {}} 
                            />
                        ) : (
                            <Link href={`/posts/${post.id}`} className="block hover:opacity-80 transition-opacity">
                                {post.type === 'code' ? (
                                    <pre className="bg-black/30 border border-white/20 p-4 rounded-lg overflow-x-auto">
                                        <code className="text-sm text-white">{post.content}</code>
                                    </pre>
                                ) : (
                                    <p className={`text-white ${compact ? 'line-clamp-2' : 'line-clamp-4'}`}>{post.content}</p>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && !compact && (
                        <div className="flex flex-wrap gap-1">
                            {post.hashtags.map((hashtag, index) => (
                                <Link
                                    key={index}
                                    href={`/posts?hashtag=${hashtag}`}
                                    className="text-blue-400 hover:underline text-sm"
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
                                <div className="text-center text-sm text-white/70">
                                    +{post.media_urls.length - 2} más
                                </div>
                            )}
                        </div>
                    )}

                    {/* Estadísticas */}
                    {post.views_count && (
                        <div className="flex items-center gap-4 text-sm text-white/70">
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
                            <Separator className="bg-white/20" />

                            {/* Sistema de reacciones y acciones */}
                            <div className="flex items-center justify-between">
                                {/* Reacciones */}
                                <PostReactions
                                    postId={post.id}
                                    currentUserId={currentUser.id}
                                    initialReactions={{
                                        likes_count: post.likes_count,
                                        fire_count: post.fire_count || 0,
                                        idea_count: post.idea_count || 0,
                                        bug_count: post.bug_count || 0,
                                        sparkle_count: post.sparkle_count || 0,
                                    }}
                                    userReaction={post.user_reaction}
                                    onReactionChange={() => {
                                        // Callback para actualizar el post si es necesario
                                    }}
                                />

                                {/* Acciones adicionales */}
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-white/70 hover:text-white hover:bg-white/10 apple-liquid-button rounded-full w-8 h-8 p-0"
                                        onClick={() => openCommentsModal(post)}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 apple-liquid-button rounded-full w-8 h-8 p-0">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`apple-liquid-button rounded-full w-8 h-8 p-0 ${post.is_bookmarked ? 'text-blue-400' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
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
