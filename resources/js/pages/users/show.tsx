import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    MapPin,
    Calendar,
    Github,
    Linkedin,
    Briefcase,
    Globe,
    Users,
    MessageCircle,
    Bookmark,
    Code2,
    Plus
} from 'lucide-react';
import PostCard from '@/components/post-card';

interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
    bio?: string;
    avatar?: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
    years_experience: number;
    location?: string;
    website?: string;
    github_username?: string;
    linkedin_profile?: string;
    is_open_to_work: boolean;
    followers_count: number;
    following_count: number;
    posts_count: number;
    created_at: string;
    is_following?: boolean;
    is_bookmarked?: boolean;
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

interface Props {
    user: User;
    posts: Post[];
    followers: User[];
    following: User[];
    isOwnProfile: boolean;
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

const getLevelLabel = (level: string) => {
    switch (level) {
        case 'junior': return 'Junior';
        case 'mid': return 'Mid-level';
        case 'senior': return 'Senior';
        case 'lead': return 'Lead';
        default: return level;
    }
};

export default function UserShow({ user, posts, followers, following, isOwnProfile }: Props) {
    const [activeTab, setActiveTab] = useState('posts');
    const [isFollowing, setIsFollowing] = useState(user.is_following || false);
    const [isBookmarked, setIsBookmarked] = useState(user.is_bookmarked || false);

    const handleFollow = async () => {
        try {
            const response = await fetch(`/users/${user.id}/follow`, {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                // Actualizar contador
                if (isFollowing) {
                    user.followers_count--;
                } else {
                    user.followers_count++;
                }
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleBookmark = async () => {
        try {
            const response = await fetch(`/bookmarks/users/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setIsBookmarked(!isBookmarked);
            }
        } catch (error) {
            console.error('Error bookmarking user:', error);
        }
    };

    const handleMessage = () => {
        router.visit(`/messages/${user.id}`);
    };

    return (
        <AppLayout title={`${user.full_name} (@${user.username})`} description={`Perfil de ${user.full_name} en Tribe`}>
            <Head title={`${user.full_name} (@${user.username})`} />

            <div className="w-full">
                {/* Header del perfil */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className={getLevelColor(user.level)}>
                                    {user.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Información del usuario */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold">{user.full_name}</h1>
                                        <p className="text-muted-foreground">@{user.username}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline">
                                                {getLevelLabel(user.level)}
                                            </Badge>
                                            {user.is_open_to_work && (
                                                <Badge variant="secondary">
                                                    <Briefcase className="h-3 w-3 mr-1" />
                                                    Disponible
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-2">
                                        {!isOwnProfile && (
                                            <>
                                                <Button
                                                    variant={isFollowing ? "outline" : "default"}
                                                    onClick={handleFollow}
                                                >
                                                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                                                </Button>
                                                <Button variant="outline" onClick={handleMessage}>
                                                    <MessageCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={handleBookmark}
                                            className={isBookmarked ? 'text-primary' : ''}
                                        >
                                            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                        </Button>
                                        {isOwnProfile && (
                                            <Button asChild>
                                                <Link href="/settings/profile">
                                                    Editar perfil
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {user.bio && (
                                    <p className="text-muted-foreground mb-4">{user.bio}</p>
                                )}

                                {/* Información adicional */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    {user.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.years_experience} años de experiencia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.followers_count} seguidores</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Code2 className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.posts_count} posts</span>
                                    </div>
                                </div>

                                {/* Enlaces sociales */}
                                <div className="flex items-center gap-2 mt-4">
                                    {user.github_username && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener">
                                                <Github className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    {user.linkedin_profile && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={user.linkedin_profile} target="_blank" rel="noopener">
                                                <Linkedin className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    {user.website && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={user.website} target="_blank" rel="noopener">
                                                <Globe className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs de contenido */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="posts" className="flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Posts ({posts.length})
                        </TabsTrigger>
                        <TabsTrigger value="followers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Seguidores ({followers.length})
                        </TabsTrigger>
                        <TabsTrigger value="following" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Siguiendo ({following.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Contenido de Posts */}
                    <TabsContent value="posts" className="space-y-4">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Code2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">No hay posts aún</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {isOwnProfile
                                            ? 'Comienza a compartir tu conocimiento con la comunidad.'
                                            : `${user.full_name} aún no ha publicado nada.`
                                        }
                                    </p>
                                    {isOwnProfile && (
                                        <Button asChild>
                                            <Link href="/posts/create">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Crear primer post
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Contenido de Seguidores */}
                    <TabsContent value="followers" className="space-y-4">
                        {followers.length > 0 ? (
                            <div className="grid gap-4">
                                {followers.map((follower) => (
                                    <Card key={follower.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={follower.avatar} />
                                                    <AvatarFallback className={getLevelColor(follower.level)}>
                                                        {follower.full_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{follower.full_name}</h3>
                                                    <p className="text-sm text-muted-foreground">@{follower.username}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {getLevelLabel(follower.level)}
                                                        </Badge>
                                                        {follower.is_open_to_work && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Disponible
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/users/${follower.id}`}>
                                                        Ver perfil
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">No hay seguidores</h3>
                                    <p className="text-muted-foreground">
                                        {isOwnProfile
                                            ? 'Comienza a interactuar con otros desarrolladores para ganar seguidores.'
                                            : `${user.full_name} aún no tiene seguidores.`
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Contenido de Siguiendo */}
                    <TabsContent value="following" className="space-y-4">
                        {following.length > 0 ? (
                            <div className="grid gap-4">
                                {following.map((followed) => (
                                    <Card key={followed.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={followed.avatar} />
                                                    <AvatarFallback className={getLevelColor(followed.level)}>
                                                        {followed.full_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{followed.full_name}</h3>
                                                    <p className="text-sm text-muted-foreground">@{followed.username}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {getLevelLabel(followed.level)}
                                                        </Badge>
                                                        {followed.is_open_to_work && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Disponible
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/users/${followed.id}`}>
                                                        Ver perfil
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">No está siguiendo a nadie</h3>
                                    <p className="text-muted-foreground">
                                        {isOwnProfile
                                            ? 'Descubre y sigue a otros desarrolladores para ver su contenido.'
                                            : `${user.full_name} aún no sigue a nadie.`
                                        }
                                    </p>
                                    {isOwnProfile && (
                                        <Button asChild>
                                            <Link href="/users">
                                                Explorar desarrolladores
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
